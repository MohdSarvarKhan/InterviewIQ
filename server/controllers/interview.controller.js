import fs from "fs"
import crypto from "crypto"
import axios from "axios"
import { sendInterviewReportEmail } from "../services/email.service.js"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const pdfParse = require("pdf-parse")
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

const parseAIJSON = (text) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse AI JSON:", text);
    throw new Error("Invalid AI response format");
  }
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    const fileBuffer = await fs.promises.readFile(filepath)

    const pdfData = await pdfParse(fileBuffer);
    let resumeText = pdfData.text
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];


    const aiResponse = await askAi(messages)

    const parsed = parseAIJSON(aiResponse);

    fs.unlinkSync(filepath)


    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};


export const scanGithub = async (req, res) => {
  try {
    let { username } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ message: "GitHub username is required" });
    }

    // Extract username if user pasted a full URL (e.g. https://github.com/username or github.com/username)
    username = username.trim();
    if (username.includes('github.com/')) {
        username = username.split('github.com/')[1].split('/')[0];
    }

    const githubRes = await axios.get(
      `https://api.github.com/users/${username.trim()}/repos?sort=pushed&per_page=10`,
      { headers: { "Accept": "application/vnd.github.v3+json", "User-Agent": "InterviewIQ-App" } }
    );

    const repos = githubRes.data
      .filter(r => !r.fork)
      .slice(0, 6)
      .map(r => ({
        name: r.name,
        description: r.description || "No description",
        language: r.language || "Unknown",
        topics: r.topics || [],
        stars: r.stargazers_count,
        url: r.html_url,
      }));

    if (repos.length === 0) {
      return res.status(404).json({ message: "No public repositories found for this user." });
    }

    const contextText = repos
      .map(r => `- ${r.name} (${r.language})${r.description !== "No description" ? ": " + r.description : ""}${r.topics.length ? " [" + r.topics.join(", ") + "]" : ""}`)
      .join("\n");

    return res.json({ repos, contextText });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "GitHub user not found." });
    }
    return res.status(500).json({ message: `GitHub scan failed: ${error.message}` });
  }
};


export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills, targetCompany, difficulty, isPractice, language = "English", githubContext = "" } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Practice mode skips credit check
    if (!isPractice && user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";
    const safeCompany = targetCompany?.trim() || "";
    const safeDifficulty = difficulty?.trim() || "Intermediate";

    // Build difficulty-aware time limits
    const timeLimitMap = {
      Beginner:     [75,  75,  90,  90, 120],
      Intermediate: [60,  60,  90,  90, 120],
      Advanced:     [60,  60,  75,  75,  90],
      Expert:       [45,  45,  60,  60,  75],
    };
    const timeLimits = timeLimitMap[safeDifficulty] || timeLimitMap.Intermediate;

    const companySection = safeCompany
      ? `Target Company: ${safeCompany}. Tailor questions to this company's known interview culture and style.`
      : "";

    const modeGuidance = {
      Technical:      "Focus on technical depth, code concepts, system knowledge.",
      HR:             "Focus on communication, personality, culture fit, team scenarios.",
      Behavioral:     "Use STAR-style (Situation, Task, Action, Result) scenario questions.",
      "System Design": "Ask about designing scalable systems, architecture trade-offs, and components.",
      DSA:            "Ask the candidate to verbally explain their approach to algorithmic and data structure problems."
    };

    const safeGithub = githubContext?.trim() || "";

    const userPrompt = `
    Role: ${role}
    Experience: ${experience}
    Interview Mode: ${mode}
    Overall Difficulty: ${safeDifficulty}
    Projects: ${projectText}
    Skills: ${skillsText}
    Resume: ${safeResume}
    ${safeGithub ? `GitHub Repositories:\n${safeGithub}` : ""}
    ${companySection}
    `;

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional ${mode} interview.

Mode guidance: ${modeGuidance[mode] || ""}
${safeCompany ? `You are interviewing on behalf of ${safeCompany}.` : ""}

Difficulty level: ${safeDifficulty}. Calibrate question depth accordingly.

IMPORTANT LANGUAGE REQUIREMENT:
Generate ALL questions strictly in the requested language: ${language}.
Your response must consist only of questions translated to ${language}.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must be a single complete sentence (15-30 words).
- Do NOT number them.
- Do NOT add explanations or extra text.
- One question per line only.
- Keep language natural and conversational.
${safeGithub ? `- The candidate has these GitHub repositories. Reference specific repo names, languages, or architectural choices in at least 2 questions to make it personal and challenging.` : ""}

Difficulty progression:
Question 1 → easy
Question 2 → easy
Question 3 → medium
Question 4 → medium
Question 5 → hard

Base questions on the candidate's role, experience, mode, projects, skills, resume${safeGithub ? ", and GitHub repositories" : ""}.
`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned empty response." });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "AI failed to generate questions." });
    }

    const formattedQuestions = questionsArray.map((q, index) => ({
      question: q,
      difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
      timeLimit: timeLimits[index],
    }));

    // Practice mode: no credit deduction, no DB save
    if (isPractice) {
      return res.json({
        interviewId: "practice-" + Date.now(),
        creditsLeft: user.credits,
        userName: user.name,
        isPractice: true,
        questions: formattedQuestions
      });
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      targetCompany: safeCompany,
      difficulty: safeDifficulty,
      isPractice: false,
      language: language,
      resumeText: safeResume,
      questions: formattedQuestions
    })

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      isPractice: false,
      questions: interview.questions
    });
  } catch (error) {
    console.error("GENERATE QUESTION ERROR:", error);
    return res.status(500).json({message:`failed to create interview: ${error.message || error}`, stack: error.stack})
  }
}


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
    }

    const question = interview.questions[questionIndex]
    if (!question) {
        return res.status(400).json({ message: "Invalid question index" });
    }

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }


    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];


    const aiResponse = await askAi(messages)


    const parsed = parseAIJSON(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    await interview.save();


    return res.status(200).json({feedback :parsed.feedback})
  } catch (error) {
    return res.status(500).json({message:`failed to submit answer ${error}`})

  }
}


export const finishInterview = async (req,res) => {
  try {
    const {interviewId} = req.body
    const interview = await Interview.findById(interviewId)
    if(!interview){
      return res.status(400).json({message:"failed to find Interview"})
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";
    
    if (!interview.shareToken) {
      interview.shareToken = crypto.randomBytes(16).toString("hex");
      interview.isPublic = true;
    }

    await interview.save();

    // --- Streak Logic ---
    const user = await User.findById(interview.userId);
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (!user.lastInterviewDate) {
        user.streak = 1;
      } else {
        const last = new Date(user.lastInterviewDate);
        last.setHours(0, 0, 0, 0);
        if (last.getTime() === today.getTime()) {
          // Already interviewed today — keep streak
        } else if (last.getTime() === yesterday.getTime()) {
          user.streak = (user.streak || 0) + 1;
        } else {
          user.streak = 1; // streak broken
        }
      }
      user.lastInterviewDate = new Date();
      await user.save();
    }
    // --- End Streak Logic ---

    // --- Send Email Notification ---
    if (user && user.email) {
      const publicUrl = `http://localhost:5173/public-report/${interview.shareToken}`;
      const reportData = {
        role: interview.role,
        finalScore: Number(finalScore.toFixed(1)),
        avgConfidence: Number(avgConfidence.toFixed(1)),
        avgCommunication: Number(avgCommunication.toFixed(1)),
        avgCorrectness: Number(avgCorrectness.toFixed(1))
      };
      
      // Fire and forget (don't await so it doesn't block the API response)
      sendInterviewReportEmail(user.email, user.name, reportData, publicUrl);
    }
    // --- End Send Email Notification ---

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      streak: user?.streak || 0,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    })
  } catch (error) {
    return res.status(500).json({message:`failed to finish Interview ${error}`})
  }
}


export const getMyInterviews = async (req,res) => {
  try {
    const interviews = await Interview.find({userId:req.userId})
    .sort({ createdAt: -1 })
    .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews)

  } catch (error) {
     return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
  }
}

export const getInterviewReport = async (req,res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }


    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

       return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      shareToken: interview.shareToken, // Return token for sharing
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        followUpQuestion: q.followUpQuestion || "",
      })),
    });

  } catch (error) {
    return res.status(500).json({message:`failed to find currentUser Interview report ${error}`})
  }
}

export const getPublicReport = async (req, res) => {
  try {
    const { token } = req.params;
    const interview = await Interview.findOne({ shareToken: token, isPublic: true }).populate("userId", "name");

    if (!interview) {
      return res.status(404).json({ message: "Public report not found or link is invalid" });
    }

    const totalQuestions = interview.questions.length;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    return res.json({
      userName: interview.userId.name,
      role: interview.role,
      targetCompany: interview.targetCompany,
      difficulty: interview.difficulty,
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        followUpQuestion: q.followUpQuestion || "",
      })),
    });

  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch public report ${error}` });
  }
}


export const followUpQuestion = async (req, res) => {
  try {
    const { interviewId, questionIndex, question, answer } = req.body;

    const messages = [
      {
        role: "system",
        content: `You are a professional interviewer. 
The candidate just answered a question. Decide if you need ONE short follow-up question to clarify or dig deeper.
If the answer is complete and sufficient, respond with exactly: DONE
If you want a follow-up, respond with just the question (max 20 words). No preamble.
Keep tone natural and conversational.`
      },
      {
        role: "user",
        content: `Question: ${question}\nCandidate Answer: ${answer}`
      }
    ];

    const aiResponse = await askAi(messages);
    const followUp = aiResponse?.trim();

    // If AI says DONE or response is empty, no follow-up needed
    if (!followUp || followUp.toUpperCase() === "DONE") {
      return res.json({ followUp: null });
    }

    // Save follow-up question to interview document
    if (interviewId && !interviewId.startsWith("practice-")) {
      const interview = await Interview.findById(interviewId);
      if (interview && interview.questions[questionIndex]) {
        interview.questions[questionIndex].followUpQuestion = followUp;
        await interview.save();
      }
    }

    return res.json({ followUp });
  } catch (error) {
    return res.status(500).json({ message: `Follow-up error: ${error}` });
  }
}
