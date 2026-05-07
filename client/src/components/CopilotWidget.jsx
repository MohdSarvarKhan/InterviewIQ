import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const HINTS = {
  inactive:  { bg: 'bg-gray-800/80',   border: 'border-gray-600',   icon: '⚫', label: 'Copilot Inactive',          sub: 'Mic is off'                        },
  fast:      { bg: 'bg-red-900/80',    border: 'border-red-500',    icon: '🔴', label: 'Slow Down!',                sub: 'You\'re speaking too fast'          },
  rambling:  { bg: 'bg-yellow-900/80', border: 'border-yellow-500', icon: '🟡', label: 'Wrap Up Your Point',        sub: 'Answer is getting too long'        },
  stuck:     { bg: 'bg-blue-900/80',   border: 'border-blue-400',   icon: '💡', label: 'Try a Concrete Example',   sub: 'Use a real-world scenario'         },
  good:      { bg: 'bg-emerald-900/80',border: 'border-emerald-400',icon: '🟢', label: 'Great Pace, Keep Going!',  sub: 'You\'re doing well'                },
  starting:  { bg: 'bg-gray-800/80',   border: 'border-gray-500',   icon: '🎤', label: 'Copilot Listening...',     sub: 'Start speaking to get feedback'    },
};

function CopilotWidget({ answer, isMicOn }) {
  const [hint, setHint]             = useState('starting');
  const [minimized, setMinimized]   = useState(false);
  const [flash, setFlash]           = useState(false);

  // Track when answer text last changed (for silence detection)
  const lastAnswerRef   = useRef(answer);
  const lastChangeTime  = useRef(Date.now());

  // Track word-count history for pace detection (sliding window)
  const wcHistory = useRef([]); // [{wc, ts}]

  useEffect(() => {
    if (answer !== lastAnswerRef.current) {
      lastAnswerRef.current = answer;
      lastChangeTime.current = Date.now();
    }
  }, [answer]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now        = Date.now();
      const wc         = answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length;
      const silenceSec = (now - lastChangeTime.current) / 1000;

      // Maintain a 10-second sliding window of {wc, ts}
      wcHistory.current.push({ wc, ts: now });
      wcHistory.current = wcHistory.current.filter(e => now - e.ts <= 10000);

      let nextHint = hint;

      if (!isMicOn) {
        nextHint = 'inactive';
      } else if (wc === 0) {
        nextHint = 'starting';
      } else if (wc > 200) {
        nextHint = 'rambling';
      } else if (silenceSec > 8 && isMicOn) {
        nextHint = 'stuck';
      } else {
        // Calculate WPM from sliding window
        const oldest = wcHistory.current[0];
        const newest = wcHistory.current[wcHistory.current.length - 1];
        const wordsAdded = newest.wc - oldest.wc;
        const secondsElapsed = (newest.ts - oldest.ts) / 1000 || 1;
        const wpm = (wordsAdded / secondsElapsed) * 60;

        if (wpm > 160 && wordsAdded > 5) {
          nextHint = 'fast';
        } else {
          nextHint = 'good';
        }
      }

      if (nextHint !== hint) {
        setHint(nextHint);
        // Flash animation on hint change
        setFlash(true);
        setTimeout(() => setFlash(false), 600);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [answer, isMicOn, hint]);

  const h = HINTS[hint] || HINTS.starting;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <AnimatePresence mode="wait">
        {minimized ? (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setMinimized(false)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-2xl border-2 ${h.border} ${h.bg} backdrop-blur-md`}
            title="Open Copilot"
          >
            {h.icon}
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: flash ? 1.04 : 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`rounded-2xl border-2 ${h.border} ${h.bg} backdrop-blur-md shadow-2xl overflow-hidden`}
            style={{ width: 220 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span className="text-white/60 text-xs font-semibold tracking-wider uppercase">
                Interview Copilot
              </span>
              <button
                onClick={() => setMinimized(true)}
                className="text-white/40 hover:text-white/80 transition text-xs"
                title="Minimize"
              >
                ✕
              </button>
            </div>

            {/* Hint body */}
            <div className="px-4 py-3 flex items-center gap-3">
              <motion.span
                key={hint}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl flex-shrink-0"
              >
                {h.icon}
              </motion.span>
              <div>
                <motion.p
                  key={hint + '-label'}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-white font-semibold text-sm leading-tight"
                >
                  {h.label}
                </motion.p>
                <motion.p
                  key={hint + '-sub'}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="text-white/50 text-xs mt-0.5"
                >
                  {h.sub}
                </motion.p>
              </div>
            </div>

            {/* Word count bar */}
            <div className="px-4 pb-3">
              <div className="flex justify-between text-white/40 text-xs mb-1">
                <span>Words</span>
                <span>{answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length} / 200</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    (answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length) > 200
                      ? 'bg-red-400'
                      : (answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length) > 150
                      ? 'bg-yellow-400'
                      : 'bg-emerald-400'
                  }`}
                  animate={{
                    width: `${Math.min(100, ((answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length) / 200) * 100)}%`
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CopilotWidget;
