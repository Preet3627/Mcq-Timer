import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Grid,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Send,
  Zap,
  HelpCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TestSettings, QuestionAttemptState, QuestionStatus, TestSessionResult } from '../types';
import { playClickSound, playCautionChime, playUrgentAlarm, startAmbientSound, stopAmbientSound } from '../utils/audio';
import { requestScreenWakeLock, releaseScreenWakeLock, vibrateDevice, sendSystemNotification } from '../utils/device';

interface TimerEngineProps {
  settings: TestSettings;
  onFinishTest: (result: TestSessionResult) => void;
  onResetSetup: () => void;
}

export const TimerEngine: React.FC<TimerEngineProps> = ({
  settings,
  onFinishTest,
  onResetSetup
}) => {
  // Test State
  const [currentQ, setCurrentQ] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isNumericalMode, setIsNumericalMode] = useState(false);
  const [numericalInput, setNumericalInput] = useState('');

  // Per-question attempts map: qNum -> QuestionAttemptState
  const [attempts, setAttempts] = useState<Record<number, QuestionAttemptState>>(() => {
    const initial: Record<number, QuestionAttemptState> = {};
    for (let i = 1; i <= settings.totalQuestions; i++) {
      initial[i] = {
        q: i,
        selectedAns: null,
        timeSpent: 0,
        status: 'unvisited',
        cautionTriggered: false,
        urgentTriggered: false
      };
    }
    return initial;
  });

  // Total session timer in seconds
  const [totalSessionTime, setTotalSessionTime] = useState(0);

  // Activate Screen Wake Lock while timer is running
  useEffect(() => {
    let wakeLockObj: any = null;
    requestScreenWakeLock().then((wl) => {
      wakeLockObj = wl;
    });

    return () => {
      releaseScreenWakeLock();
    };
  }, []);

  // Initialize Audio ambient sound
  useEffect(() => {
    if (settings.soundEnabled && settings.ambientSound !== 'none') {
      startAmbientSound(settings.ambientSound, settings.volume || 0.5);
    }
    return () => {
      stopAmbientSound();
    };
  }, [settings.ambientSound, settings.soundEnabled, settings.volume]);

  // Main Timer Interval tick (1 second)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTotalSessionTime((prev) => prev + 1);

      setAttempts((prevAttempts) => {
        const currentAttempt = prevAttempts[currentQ] || {
          q: currentQ,
          selectedAns: null,
          timeSpent: 0,
          status: 'unvisited',
          cautionTriggered: false,
          urgentTriggered: false
        };

        const newTime = currentAttempt.timeSpent + 1;
        let isCaution = currentAttempt.cautionTriggered;
        let isUrgent = currentAttempt.urgentTriggered;

        // Check Caution threshold (e.g., 3 mins / 180s)
        if (newTime >= settings.cautionThreshold && !isCaution) {
          isCaution = true;
          if (settings.soundEnabled) {
            playCautionChime(true, settings.volume || 0.8);
          }
          vibrateDevice([100, 50, 100]);
          sendSystemNotification(
            '⚠️ Caution Warning - Overtime!',
            `Question #${currentQ} time exceeded ${Math.floor(settings.cautionThreshold / 60)} minutes.`
          );
        }

        // Check Urgent threshold (e.g., 10 mins / 600s)
        if (newTime >= settings.urgentThreshold && !isUrgent) {
          isUrgent = true;
          if (settings.soundEnabled) {
            playUrgentAlarm(true, settings.volume || 0.9);
          }
          vibrateDevice([200, 100, 200, 100, 200]);
          sendSystemNotification(
            '🚨 URGENT ALARM - 10 MINS OVERTIME!',
            `Question #${currentQ} has exceeded ${Math.floor(settings.urgentThreshold / 60)} mins! Move forward!`
          );
        }

        return {
          ...prevAttempts,
          [currentQ]: {
            ...currentAttempt,
            timeSpent: newTime,
            cautionTriggered: isCaution,
            urgentTriggered: isUrgent,
            status: currentAttempt.status === 'unvisited' ? 'unvisited' : currentAttempt.status
          }
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, currentQ, settings.cautionThreshold, settings.urgentThreshold, settings.soundEnabled, settings.volume]);

  // Keyboard Shortcuts (A, B, C, D, Left, Right, Space, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleOptionSelect(key);
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevQuestion();
      } else if (e.key === 'm' || e.key === 'M') {
        handleMarkForReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, attempts]);

  const currentAttempt = attempts[currentQ] || {
    q: currentQ,
    selectedAns: null,
    timeSpent: 0,
    status: 'unvisited',
    cautionTriggered: false,
    urgentTriggered: false
  };

  const currentQTime = currentAttempt.timeSpent;

  // Option Select Handler
  const handleOptionSelect = (ans: string) => {
    playClickSound(settings.soundEnabled, settings.volume);
    vibrateDevice(35);

    const newStatus: QuestionStatus =
      currentAttempt.status === 'marked' || currentAttempt.status === 'marked_answered'
        ? 'marked_answered'
        : 'answered';

    setAttempts((prev) => ({
      ...prev,
      [currentQ]: {
        ...prev[currentQ],
        selectedAns: ans,
        status: newStatus
      }
    }));
  };

  // Clear Option Handler
  const handleClearAnswer = () => {
    playClickSound(settings.soundEnabled, settings.volume);
    vibrateDevice(20);

    const newStatus: QuestionStatus =
      currentAttempt.status === 'marked_answered' ? 'marked' : 'unvisited';

    setAttempts((prev) => ({
      ...prev,
      [currentQ]: {
        ...prev[currentQ],
        selectedAns: null,
        status: newStatus
      }
    }));
    setNumericalInput('');
  };

  // Mark for Review Handler
  const handleMarkForReview = () => {
    playClickSound(settings.soundEnabled, settings.volume);
    vibrateDevice(50);

    const newStatus: QuestionStatus = currentAttempt.selectedAns
      ? 'marked_answered'
      : 'marked';

    setAttempts((prev) => ({
      ...prev,
      [currentQ]: {
        ...prev[currentQ],
        status: newStatus
      }
    }));

    handleNextQuestion();
  };

  // Save & Next
  const handleSaveAndNext = () => {
    playClickSound(settings.soundEnabled, settings.volume);
    vibrateDevice(30);

    if (isNumericalMode && numericalInput.trim()) {
      handleOptionSelect(numericalInput.trim());
    }
    handleNextQuestion();
  };

  // Navigation
  const handleNextQuestion = () => {
    if (currentQ < settings.totalQuestions) {
      setCurrentQ((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQ > 1) {
      setCurrentQ((prev) => prev - 1);
    }
  };

  // Finish & Submit Test Calculation
  const handleFinishSession = () => {
    playClickSound(settings.soundEnabled, settings.volume);
    vibrateDevice([100, 50, 200]);

    // Calculate Scores & Metrics
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;
    let overCautionCount = 0;
    let overUrgentCount = 0;

    const answerKeyMap: Record<number, string> = {};
    settings.answerKey.forEach((k) => {
      answerKeyMap[k.q] = k.ans;
    });

    (Object.values(attempts) as QuestionAttemptState[]).forEach((att) => {
      if (att.cautionTriggered) overCautionCount++;
      if (att.urgentTriggered) overUrgentCount++;

      if (!att.selectedAns) {
        totalUnattempted++;
      } else {
        const correctAns = answerKeyMap[att.q];
        if (correctAns && att.selectedAns.toUpperCase() === correctAns.toUpperCase()) {
          totalCorrect++;
        } else {
          totalIncorrect++;
        }
      }
    });

    // Score Calculation: JEE (+4 / -1)
    const totalScore = totalCorrect * 4 - totalIncorrect * 1;
    const maxScore = settings.totalQuestions * 4;
    const answeredTotal = totalCorrect + totalIncorrect;
    const accuracy = answeredTotal > 0 ? Math.round((totalCorrect / answeredTotal) * 100) : 0;
    const avgTimePerQuestion = Math.round(totalSessionTime / settings.totalQuestions);

    const result: TestSessionResult = {
      id: 'session_' + Date.now(),
      date: new Date().toISOString(),
      settings,
      attempts,
      totalTimeSpent: totalSessionTime,
      accuracy,
      totalCorrect,
      totalIncorrect,
      totalUnattempted,
      totalScore,
      maxScore,
      avgTimePerQuestion,
      overCautionCount,
      overUrgentCount
    };

    onFinishTest(result);
  };

  // Format Helper MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress Stats Calculation
  const attemptsList = Object.values(attempts) as QuestionAttemptState[];
  const answeredCount = attemptsList.filter(
    (a) => a.status === 'answered' || a.status === 'marked_answered'
  ).length;
  const markedCount = attemptsList.filter(
    (a) => a.status === 'marked' || a.status === 'marked_answered'
  ).length;

  // Dynamic Ring Progress % & Color Scheme based on per-question timer
  const cautionSecs = settings.cautionThreshold;
  const urgentSecs = settings.urgentThreshold;

  const isCautionState = currentQTime >= cautionSecs && currentQTime < urgentSecs;
  const isUrgentState = currentQTime >= urgentSecs;

  const ringProgressPercent = Math.min(100, (currentQTime / cautionSecs) * 100);

  const ringColor = isUrgentState
    ? '#ef4444' // Red
    : isCautionState
    ? '#f59e0b' // Amber
    : '#06b6d4'; // Cyan

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#050510] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-[-100px] w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-100px] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Floating Glassmorphism HUD Bar */}
      <div className="bg-[#050510]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-[65px] z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Question Navigation Counter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Grid className="w-4 h-4 text-cyan-400" />
              <span>Palette ({currentQ}/{settings.totalQuestions})</span>
            </button>
            <div className="text-xs text-slate-400 hidden sm:block">
              Progress: <b className="text-emerald-400">{answeredCount}</b> Answered •{' '}
              <b className="text-purple-400">{markedCount}</b> Marked
            </div>
          </div>

          {/* Center: Overall Session Stopwatch */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-2xl shadow-inner font-mono backdrop-blur-md">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 leading-tight">
                Session Time
              </span>
              <span className="text-base font-black text-cyan-300 leading-tight">
                {formatTime(totalSessionTime)}
              </span>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              title={isPaused ? 'Resume Test' : 'Pause Test'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>

          {/* Right: Submit Test Button */}
          <button
            onClick={handleFinishSession}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT TEST</span>
          </button>
        </div>
      </div>

      {/* Question Palette Grid Drawer */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#050510]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden shadow-2xl z-20"
          >
            <div className="max-w-7xl mx-auto p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-200">Question Matrix Jump</span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Answered</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500" /> Marked</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border border-rose-500 bg-rose-500/20" /> &gt;3m Overtime</span>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 max-h-48 overflow-y-auto p-1">
                {attemptsList.map((att) => {
                  const isCurrent = att.q === currentQ;
                  let bgClass = 'bg-white/5 text-slate-300 border-white/10';

                  if (att.status === 'answered') bgClass = 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40';
                  else if (att.status === 'marked') bgClass = 'bg-purple-600/30 text-purple-200 font-bold border-purple-500/40';
                  else if (att.status === 'marked_answered') bgClass = 'bg-amber-500/30 text-amber-200 font-bold border-amber-500/40';

                  const hasWarning = att.cautionTriggered || att.urgentTriggered;

                  return (
                    <button
                      key={att.q}
                      onClick={() => {
                        playClickSound(settings.soundEnabled, settings.volume);
                        vibrateDevice(20);
                        setCurrentQ(att.q);
                        setShowGrid(false);
                      }}
                      className={`h-9 rounded-xl border flex flex-col items-center justify-center text-xs transition-all relative ${bgClass} ${
                        isCurrent ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#050510] scale-105' : 'hover:scale-105'
                      } ${hasWarning ? 'border-rose-500 ring-1 ring-rose-500/50' : ''}`}
                      title={`Question ${att.q}: ${formatTime(att.timeSpent)} spent`}
                    >
                      <span>{att.q}</span>
                      {att.timeSpent > 0 && (
                        <span className="text-[9px] opacity-75 font-mono">{formatTime(att.timeSpent)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Center Podium: INSANE MCQ Timer & Option Selector */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center space-y-6 z-10">
        {/* Warning Banners if overtime */}
        {isUrgentState && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 bg-rose-500/20 border-2 border-rose-500 rounded-2xl text-rose-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-lg shadow-rose-500/20 backdrop-blur-md"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>URGENT TIME WARNING: You have spent over {Math.floor(urgentSecs / 60)} minutes on Question #{currentQ}! Move forward!</span>
          </motion.div>
        )}

        {isCautionState && !isUrgentState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Caution Warning: Question time exceeded {Math.floor(cautionSecs / 60)} minutes!</span>
          </motion.div>
        )}

        {/* Central Card Container with Frosted Glass Theme */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden space-y-8">
          {/* Subtle Ambient Glow behind Timer */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20 transition-all duration-700"
            style={{ backgroundColor: ringColor }}
          />

          {/* Top Section: Question Badge & INSANE Circular Timer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Question Header & Subject Info */}
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-cyan-500/15 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                <span>Question {currentQ} of {settings.totalQuestions}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
                {settings.subject} — {settings.exerciseNumber ? `Exercise ${settings.exerciseNumber}` : settings.mode}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Target pace: {Math.floor(settings.targetTimePerQuestion / 60)}m per question
              </p>
            </div>

            {/* INSANE Radial SVG Circular Ring Timer */}
            <div className="relative flex items-center justify-center">
              <svg className="w-44 h-44 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="#1e293b"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeDasharray={452.38} // 2 * pi * 72
                  strokeDashoffset={452.38 - (452.38 * ringProgressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Q #{currentQ} Time
                </span>
                <span
                  className="text-3xl font-black tracking-tight transition-colors duration-500"
                  style={{ color: ringColor }}
                >
                  {formatTime(currentQTime)}
                </span>
                {isCautionState && (
                  <span className="text-[10px] font-bold text-amber-400 animate-pulse mt-0.5">
                    &gt; 3 MINS
                  </span>
                )}
                {isUrgentState && (
                  <span className="text-[10px] font-bold text-rose-400 animate-bounce mt-0.5">
                    &gt; 10 MINS!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Section: Option Input & Answer Key Checker */}
          <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Select Your Answer:</span>
              <button
                onClick={() => setIsNumericalMode(!isNumericalMode)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
              >
                {isNumericalMode ? 'Switch to Standard MCQ (A,B,C,D)' : 'Switch to Integer / Numerical Input'}
              </button>
            </div>

            {/* Standard MCQ Options (A, B, C, D) */}
            {!isNumericalMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const isSelected = currentAttempt.selectedAns === opt;
                  return (
                    <motion.button
                      key={opt}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOptionSelect(opt)}
                      className={`h-20 rounded-2xl border-2 font-black text-2xl flex flex-col items-center justify-center transition-all shadow-lg relative ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 border-cyan-300 shadow-cyan-500/20 ring-4 ring-cyan-500/30'
                          : 'bg-white/10 border-white/20 text-slate-100 hover:border-cyan-400/50 hover:bg-white/15'
                      }`}
                    >
                      <span className="text-2xl">{opt}</span>
                      <span className="text-[10px] font-medium opacity-60">Key [{opt}]</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-slate-950 rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* Numerical Answer Input */
              <div className="space-y-2">
                <input
                  type="text"
                  value={numericalInput || currentAttempt.selectedAns || ''}
                  onChange={(e) => {
                    setNumericalInput(e.target.value);
                    handleOptionSelect(e.target.value);
                  }}
                  placeholder="Type numerical answer e.g. 12.5 or 4"
                  className="w-full p-4 bg-slate-950 border-2 border-white/10 focus:border-cyan-500 rounded-2xl font-mono text-xl text-cyan-300 text-center focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 relative z-10">
            {/* Clear & Mark Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAnswer}
                disabled={!currentAttempt.selectedAns}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
              >
                Clear Answer
              </button>
              <button
                onClick={handleMarkForReview}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  currentAttempt.status === 'marked' || currentAttempt.status === 'marked_answered'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                    : 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
                }`}
              >
                Mark for Review & Next
              </button>
            </div>

            {/* Navigation & Save & Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQ === 1}
                className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-200 rounded-xl border border-white/10 transition-colors"
                title="Previous Question (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleSaveAndNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
              >
                <span>SAVE & NEXT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint Footer */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
          <span>Shortcuts:</span>
          <span><b>[A,B,C,D]</b> Select</span>
          <span><b>[Space / →]</b> Next</span>
          <span><b>[←]</b> Prev</span>
          <span><b>[M]</b> Mark</span>
        </div>
      </main>
    </div>
  );
};
