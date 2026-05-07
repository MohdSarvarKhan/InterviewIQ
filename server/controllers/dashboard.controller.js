import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interviews = await Interview.find({ userId, status: "completed", isPractice: false });

    let totalInterviews = interviews.length;
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    let bestScore = 0;

    // Time series data for chart
    const scoreHistory = interviews.map((int, i) => {
      totalScore += int.finalScore || 0;
      if (int.finalScore > bestScore) bestScore = int.finalScore;

      // Calculate averages from questions
      let qConf = 0, qComm = 0, qCorr = 0;
      int.questions.forEach(q => {
        qConf += q.confidence || 0;
        qComm += q.communication || 0;
        qCorr += q.correctness || 0;
      });

      const qLen = int.questions.length || 1;
      totalConfidence += qConf / qLen;
      totalCommunication += qComm / qLen;
      totalCorrectness += qCorr / qLen;

      return {
        name: `Int \${i + 1}`,
        score: Number((int.finalScore || 0).toFixed(1)),
        date: new Date(int.createdAt).toLocaleDateString()
      };
    });

    const avgScore = totalInterviews ? totalScore / totalInterviews : 0;
    const avgConfidence = totalInterviews ? totalConfidence / totalInterviews : 0;
    const avgCommunication = totalInterviews ? totalCommunication / totalInterviews : 0;
    const avgCorrectness = totalInterviews ? totalCorrectness / totalInterviews : 0;

    const radarData = [
      { subject: 'Confidence', A: Number(avgConfidence.toFixed(1)), fullMark: 10 },
      { subject: 'Communication', A: Number(avgCommunication.toFixed(1)), fullMark: 10 },
      { subject: 'Correctness', A: Number(avgCorrectness.toFixed(1)), fullMark: 10 },
    ];

    return res.json({
      streak: user.streak || 0,
      totalInterviews,
      avgScore: Number(avgScore.toFixed(1)),
      bestScore: Number(bestScore.toFixed(1)),
      scoreHistory,
      radarData
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
}

export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({ streak: { $gt: 0 } })
        .sort({ streak: -1, credits: -1 })
        .limit(50)
        .select("name streak credits");

    return res.json(topUsers);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
}
