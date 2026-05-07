import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion, AnimatePresence } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsArrowRight, BsGripVertical } from "react-icons/bs";
import { useState, useRef, useEffect, useCallback } from 'react'
import axios from "axios"
import { ServerUrl } from '../App'
import CodeEditor from './CodeEditor'
import WebcamMonitor from './WebcamMonitor'
import CopilotWidget from './CopilotWidget'

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, mode } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [isFollowUpPhase, setIsFollowUpPhase] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [code, setCode] = useState("// Write your code here...");
  const [currentEmotion, setCurrentEmotion] = useState("neutral");

  // ── Draggable webcam state (user's camera) ────────────────────────────────
  const [webcamPos, setWebcamPos] = useState({ x: 0, y: 0 });
  const [isWebcamDragging, setIsWebcamDragging] = useState(false);
  const webcamDragOffset = useRef({ x: 0, y: 0 });
  const webcamCardRef = useRef(null);
  const webcamPosRef = useRef({ x: 0, y: 0 });

  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  // Set initial webcam position (bottom-right corner)
  useEffect(() => {
    const initX = window.innerWidth - 220;
    const initY = window.innerHeight - 200;
    setWebcamPos({ x: initX, y: initY });
    webcamPosRef.current = { x: initX, y: initY };
  }, []);

  // ── Voice setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const langMap = { English: "en", Hindi: "hi", Spanish: "es", French: "fr" };
      const targetLang = langMap[interviewData.language] || "en";
      const langVoices = voices.filter(v => v.lang.startsWith(targetLang));
      const voicePool = langVoices.length > 0 ? langVoices : voices;

      const femaleVoice = voicePool.find(v =>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) { setSelectedVoice(femaleVoice); setVoiceGender("female"); return; }

      const maleVoice = voicePool.find(v =>
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("mark") ||
        v.name.toLowerCase().includes("male")
      );
      if (maleVoice) { setSelectedVoice(maleVoice); setVoiceGender("male"); return; }

      setSelectedVoice(voicePool[0]);
      setVoiceGender("female");
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [interviewData.language]);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // ── Speak function ───────────────────────────────────────────────────────
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) { resolve(); return; }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      utterance.onstart = () => { setIsAIPlaying(true); stopMic(); videoRef.current?.play(); };
      utterance.onend = () => {
        if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
        setIsAIPlaying(false);
        if (isMicOn) startMic();
        setTimeout(() => { setSubtitle(""); resolve(); }, 300);
      };
      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  // ── Intro + question flow ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedVoice) return;
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`);
        await speakText("I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.");
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));
        if (currentIndex === questions.length - 1) await speakText("Alright, this one might be a bit more challenging.");
        await speakText(currentQuestion.question);
        if (isMicOn) startMic();
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) setTimeLeft(currentQuestion.timeLimit || 60);
  }, [currentIndex]);

  // ── Speech recognition ────────────────────────────────────────────────────
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const langMap = { English: "en-US", Hindi: "hi-IN", Spanish: "es-ES", French: "fr-FR" };
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = langMap[interviewData.language] || "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let newText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) newText += event.results[i][0].transcript;
      }
      if (newText.trim()) setAnswer(prev => prev + " " + newText.trim());
    };
    recognitionRef.current = recognition;
  }, []);

  const startMic = () => { try { recognitionRef.current?.start(); } catch { } };
  const stopMic  = () => { recognitionRef.current?.stop(); };
  const toggleMic = () => {
    if (isMicOn) stopMic(); else startMic();
    setIsMicOn(!isMicOn);
  };

  // ── Submit / Next / Finish ────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const codePayload = mode === "DSA" ? `\n\nCode Submitted:\n${code}` : "";
      if (isFollowUpPhase) {
        const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
          interviewId, questionIndex: currentIndex,
          answer: answer + codePayload, timeTaken: currentQuestion.timeLimit - timeLeft,
        }, { withCredentials: true });
        setFeedback(result.data.feedback);
        speakText(result.data.feedback);
        setIsSubmitting(false);
        setIsFollowUpPhase(false);
      } else {
        const followUpResult = await axios.post(ServerUrl + "/api/interview/followup", {
          interviewId, questionIndex: currentIndex,
          question: currentQuestion.question, answer: answer + codePayload,
        }, { withCredentials: true });
        if (followUpResult.data.followUp) {
          setFollowUpQuestion(followUpResult.data.followUp);
          setIsFollowUpPhase(true);
          setAnswer("");
          speakText(followUpResult.data.followUp);
          setIsSubmitting(false);
        } else {
          const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
            interviewId, questionIndex: currentIndex,
            answer: answer + codePayload, timeTaken: currentQuestion.timeLimit - timeLeft,
          }, { withCredentials: true });
          setFeedback(result.data.feedback);
          speakText(result.data.feedback);
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer(""); setFeedback(""); setFollowUpQuestion(null); setIsFollowUpPhase(false);
    if (currentIndex + 1 >= questions.length) { finishInterview(); return; }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    if (recognitionRef.current) recognitionRef.current.abort();
    setTimeout(() => { if (isMicOn) startMic(); }, 600);
  };

  const finishInterview = async () => {
    stopMic(); setIsMicOn(false);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true });
      onFinish(result.data);
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    if (!isIntroPhase && currentQuestion && timeLeft === 0 && !isSubmitting && !feedback) submitAnswer();
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Webcam drag handlers ───────────────────────────────────────────────────
  const handleWebcamMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsWebcamDragging(true);
    webcamDragOffset.current = {
      x: e.clientX - webcamPosRef.current.x,
      y: e.clientY - webcamPosRef.current.y,
    };
  }, []);

  const handleWebcamMouseMove = useCallback((e) => {
    if (!isWebcamDragging) return;
    const cardW = webcamCardRef.current?.offsetWidth  || 192;
    const cardH = webcamCardRef.current?.offsetHeight || 160;
    const newX = Math.max(0, Math.min(window.innerWidth  - cardW, e.clientX - webcamDragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - cardH, e.clientY - webcamDragOffset.current.y));
    webcamPosRef.current = { x: newX, y: newY };
    setWebcamPos({ x: newX, y: newY });
  }, [isWebcamDragging]);

  const handleWebcamMouseUp = useCallback(() => setIsWebcamDragging(false), []);

  useEffect(() => {
    if (isWebcamDragging) {
      window.addEventListener('mousemove', handleWebcamMouseMove);
      window.addEventListener('mouseup', handleWebcamMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleWebcamMouseMove);
      window.removeEventListener('mouseup', handleWebcamMouseUp);
    };
  }, [isWebcamDragging, handleWebcamMouseMove, handleWebcamMouseUp]);

  const handleWebcamTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsWebcamDragging(true);
    webcamDragOffset.current = { x: touch.clientX - webcamPosRef.current.x, y: touch.clientY - webcamPosRef.current.y };
  }, []);

  const handleWebcamTouchMove = useCallback((e) => {
    if (!isWebcamDragging) return;
    const touch = e.touches[0];
    const cardW = webcamCardRef.current?.offsetWidth  || 192;
    const cardH = webcamCardRef.current?.offsetHeight || 160;
    const newX = Math.max(0, Math.min(window.innerWidth  - cardW, touch.clientX - webcamDragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - cardH, touch.clientY - webcamDragOffset.current.y));
    webcamPosRef.current = { x: newX, y: newY };
    setWebcamPos({ x: newX, y: newY });
  }, [isWebcamDragging]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center p-4 sm:p-6 transition-colors pt-24 pb-12'>
      <div className='w-full max-w-4xl min-h-[85vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-colors'>

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 transition-colors'>
          <h2 className='text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
            AI Smart Interview
          </h2>
          <div className='flex items-center gap-4'>
            <AnimatePresence>
              {isAIPlaying && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full transition-colors'
                >
                  🎙 AI Speaking…
                </motion.span>
              )}
            </AnimatePresence>
            <div className='flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400'>
              <span className='font-semibold text-gray-800 dark:text-white transition-colors'>{currentIndex + 1}<span className='font-normal text-gray-400'>/{questions.length}</span></span>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className='flex-1 flex flex-col p-5 sm:p-8'>

          {/* Question card */}
          {!isIntroPhase && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className='mb-6 bg-gray-50 dark:bg-gray-800/50 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors'
            >
              <p className='text-xs text-gray-400 dark:text-gray-500 mb-2'>
                Question {currentIndex + 1} of {questions.length}
                {isFollowUpPhase && <span className='ml-2 text-emerald-500 font-semibold'>· Follow-up</span>}
              </p>
              <p className='text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 leading-relaxed transition-colors'>
                {isFollowUpPhase ? followUpQuestion : currentQuestion?.question}
              </p>
            </motion.div>
          )}

          {/* Intro splash */}
          {isIntroPhase && (
            <div className='flex-1 flex flex-col items-center justify-center text-center gap-4'>
              <div className='w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center transition-colors'>
                <span className='text-3xl'>🤖</span>
              </div>
              <p className='text-gray-500 dark:text-gray-400 text-sm transition-colors'>AI interviewer is greeting you…</p>
            </div>
          )}

          {/* Answer area */}
          {!isIntroPhase && (
            mode === "DSA" ? (
              <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[260px]">
                <div className="flex-1"><CodeEditor code={code} setCode={setCode} language="javascript" /></div>
                <textarea
                  placeholder="Verbal explanation transcript…"
                  onChange={e => setAnswer(e.target.value)} value={answer}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-colors text-gray-800 dark:text-gray-100"
                />
              </div>
            ) : (
              <textarea
                placeholder="Type or speak your answer here…"
                onChange={e => setAnswer(e.target.value)} value={answer}
                className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-colors text-gray-800 dark:text-gray-100 min-h-[200px]"
              />
            )
          )}

          {/* Buttons / Feedback */}
          {!isIntroPhase && (
            !feedback ? (
              <div className='flex items-center gap-4 mt-5'>
                <motion.button onClick={toggleMic} whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transition-colors ${isMicOn ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                >
                  {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                </motion.button>
                <motion.button onClick={submitAnswer} disabled={isSubmitting} whileTap={{ scale: 0.95 }}
                  className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-400'
                >
                  {isSubmitting ? "Submitting…" : "Submit Answer"}
                </motion.button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className='mt-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl shadow-sm transition-colors'
              >
                <p className='text-emerald-700 dark:text-emerald-400 font-medium mb-4 transition-colors'>{feedback}</p>
                <button onClick={handleNext}
                  className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'
                >
                  {currentIndex + 1 >= questions.length ? "Finish Interview" : "Next Question"} <BsArrowRight size={18} />
                </button>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* ── Fixed AI Interviewer Video — left side ───────────────────────── */}
      <div
        ref={videoCardRef}
        className='fixed left-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-500/60 bg-black select-none'
        style={{ width: 220 }}
      >
        {/* Header label */}
        <div className='flex items-center gap-2 px-3 py-2 bg-gray-900'>
          <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
          <span className='text-white text-xs font-semibold'>AI Interviewer</span>
          {isAIPlaying && (
            <span className='ml-auto text-emerald-400 text-[10px] font-bold animate-pulse'>SPEAKING</span>
          )}
        </div>

        {/* AI Video */}
        <video
          src={videoSource} key={videoSource} ref={videoRef}
          muted playsInline preload="auto"
          className="w-full h-auto object-cover"
        />

        {/* Subtitle */}
        <AnimatePresence>
          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='bg-gray-900 px-3 py-2 border-t border-gray-700'
            >
              <p className='text-white text-xs leading-relaxed text-center'>{subtitle}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Draggable User Webcam ─────────────────────────────────────────── */}
      <div
        ref={webcamCardRef}
        className='rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-400/60 bg-black select-none'
        style={{ position: 'fixed', left: webcamPos.x, top: webcamPos.y, zIndex: 50, width: 180 }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={handleWebcamMouseDown}
          onTouchStart={handleWebcamTouchStart}
          onTouchMove={handleWebcamTouchMove}
          onTouchEnd={handleWebcamMouseUp}
          className={`flex items-center justify-between px-3 py-1.5 bg-gray-900 ${isWebcamDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className='flex items-center gap-1.5'>
            <span className='w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse' />
            <span className='text-white text-[10px] font-semibold'>You</span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='text-[9px] text-gray-400 italic'>{currentEmotion}</span>
            <BsGripVertical className='text-gray-400' size={14} />
          </div>
        </div>
        {/* User webcam feed */}
        <WebcamMonitor onEmotionDetected={emotion => setCurrentEmotion(emotion)} />
      </div>

      {/* ── Interview Copilot ─────────────────────────────────────────────── */}
      <CopilotWidget answer={answer} isMicOn={isMicOn} />
    </div>
  );
}

export default Step2Interview
