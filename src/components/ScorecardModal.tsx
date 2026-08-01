import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BarChart2,
  Share2,
  Download,
  Filter,
  Sparkles,
  Calendar,
  HardDrive,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { TestSessionResult, QuestionAttemptState } from '../types';
import { playFanfareSound } from '../utils/audio';
import { useAppStore } from '../store/useAppStore';
import { shareContent } from '../utils/device';

interface ScorecardModalProps {
  result: TestSessionResult;
  onNewTest: () => void;
  onSaveToHistory: (result: TestSessionResult) => void;
  onOpenCalendarModal: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  result,
  onNewTest,
  onSaveToHistory,
  onOpenCalendarModal
}) => {
  const { user, syncToCloud, syncState } = useAppStore();
  const [tableFilter, setTableFilter] = useState<'all' | 'incorrect' | 'overtime' | 'marked'>('all');

  // Trigger fanfare audio & confetti on mount
  useEffect(() => {
    if (result.settings.soundEnabled) {
      playFanfareSound(true, result.settings.volume || 0.7);
    }
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Auto-save session to Zustand store
    onSaveToHistory(result);

    // Auto-sync to Google Drive if user logged in
    if (user) {
      syncToCloud();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleShareReport = () => {
    const exerciseOrMode = result.settings.exerciseNumber ? `Exercise ${result.settings.exerciseNumber}` : result.settings.mode;
    const summary = `🏆 JEE/NEET MCQ Speed Session Summary:\nSubject: ${result.settings.subject} (${exerciseOrMode})\nScore: ${result.totalScore}/${result.maxScore} (${result.accuracy}% Accuracy)\nTime Spent: ${formatTime(result.totalTimeSpent)}\nSpeed: ${result.avgTimePerQuestion}s/question!`;
    shareContent({
      title: 'MCQ Timer Scorecard',
      text: summary,
      url: window.location.href,
    });
  };

  const answerKeyMap: Record<number, string> = {};
  result.settings.answerKey.forEach((k) => {
    answerKeyMap[k.q] = k.ans;
  });

  const attemptsArray = Object.values(result.attempts) as QuestionAttemptState[];

  // Filtered rows for analysis table
  const filteredAttempts = attemptsArray.filter((att) => {
    if (tableFilter === 'incorrect') {
      const correctAns = answerKeyMap[att.q];
      return att.selectedAns && correctAns && att.selectedAns.toUpperCase() !== correctAns.toUpperCase();
    }
    if (tableFilter === 'overtime') {
      return att.cautionTriggered || att.urgentTriggered;
    }
    if (tableFilter === 'marked') {
      return att.status === 'marked' || att.status === 'marked_answered';
    }
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#050510] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-5xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6"
      >
        {/* Banner Header */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#050510] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full uppercase tracking-wider">
                  SESSION COMPLETE
                </span>
                <span className="text-xs text-slate-300">
                  {result.settings.subject} • {result.settings.exerciseNumber ? `Exercise ${result.settings.exerciseNumber}` : result.settings.mode}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight mt-1">
                MCQ Speed Analytics Scorecard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareReport}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs rounded-xl border border-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Share Score</span>
            </button>
            <button
              onClick={onOpenCalendarModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs rounded-xl border border-cyan-500/30 transition-colors"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Schedule Next</span>
            </button>
          </div>
        </div>

        {/* Core Stats Overview Cards Grid */}
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Score */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col justify-between space-y-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-cyan-400" /> Total Score
              </span>
              <div className="text-2xl md:text-3xl font-black text-cyan-300">
                {result.totalScore} <span className="text-xs text-slate-500 font-normal">/ {result.maxScore}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">JEE Standard Scheme (+4 / -1)</p>
            </div>

            {/* Accuracy Rate */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col justify-between space-y-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" /> Accuracy Rate
              </span>
              <div className="text-2xl md:text-3xl font-black text-emerald-400">
                {result.accuracy}%
              </div>
              <p className="text-[10px] text-slate-500">{result.totalCorrect} Correct • {result.totalIncorrect} Wrong</p>
            </div>

            {/* Total Time & Avg Pace */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col justify-between space-y-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" /> Total Time Spent
              </span>
              <div className="text-2xl md:text-3xl font-black text-blue-400 font-mono">
                {formatTime(result.totalTimeSpent)}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Avg {result.avgTimePerQuestion}s / question</p>
            </div>

            {/* Overtime Warning Flags */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 flex flex-col justify-between space-y-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Time Warning Flags
              </span>
              <div className="text-2xl md:text-3xl font-black text-rose-400">
                {result.overCautionCount} <span className="text-xs text-slate-500 font-normal">Over 3m</span>
              </div>
              <p className="text-[10px] text-slate-500">{result.overUrgentCount} Over 10m Urgent Warnings</p>
            </div>
          </div>

          {/* Wrong Questions Schedule Banner */}
          {result.totalIncorrect > 0 && (
            <div className="bg-rose-950/50 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-200">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-rose-300">
                    {result.totalIncorrect} Question{result.totalIncorrect > 1 ? 's' : ''} Got Wrong in This Session
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Review these wrong questions tomorrow to strengthen weak concepts and boost speed.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTableFilter('incorrect')}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition-colors"
                >
                  View Wrong Questions
                </button>
                <button
                  type="button"
                  onClick={onOpenCalendarModal}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Schedule Tomorrow</span>
                </button>
              </div>
            </div>
          )}

          {/* Question Breakdown Table & Filters */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> Per-Question Performance Matrix
              </h3>

              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-950 p-1 border border-white/10 rounded-xl text-xs">
                {[
                  { id: 'all', label: 'All Questions' },
                  { id: 'incorrect', label: `❌ Incorrect (${result.totalIncorrect})` },
                  { id: 'overtime', label: '⚠️ Overtime (>3m)' },
                  { id: 'marked', label: '🟪 Marked' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTableFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      tableFilter === f.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#050510] border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Q #</th>
                      <th className="px-4 py-3">Your Choice</th>
                      <th className="px-4 py-3">Correct Key</th>
                      <th className="px-4 py-3">Result</th>
                      <th className="px-4 py-3">Time Spent</th>
                      <th className="px-4 py-3">Pace Status</th>
                      <th className="px-4 py-3">Solution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {filteredAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-sans">
                          No questions match this filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAttempts.map((att) => {
                        const correctAns = answerKeyMap[att.q];
                        const isAnswered = Boolean(att.selectedAns);
                        const isCorrect = isAnswered && correctAns && att.selectedAns?.toUpperCase() === correctAns.toUpperCase();

                        return (
                          <tr key={att.q} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-200">
                              Question {att.q}
                            </td>
                            <td className="px-4 py-3">
                              {att.selectedAns ? (
                                <span className="px-2 py-0.5 rounded bg-white/10 font-bold text-cyan-300 border border-white/10">
                                  {att.selectedAns}
                                </span>
                              ) : (
                                <span className="text-slate-600 font-sans italic">Unattempted</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {correctAns ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30">
                                  {correctAns}
                                </span>
                              ) : (
                                <span className="text-slate-600 font-sans">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-sans">
                              {!isAnswered ? (
                                <span className="text-slate-500">Unattempted</span>
                              ) : isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+4)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> Incorrect (-1)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-200">
                              {formatTime(att.timeSpent)}
                            </td>
                            <td className="px-4 py-3 font-sans text-[11px]">
                              {att.urgentTriggered ? (
                                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                                  🚨 Urgent Over 10m
                                </span>
                              ) : att.cautionTriggered ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                  ⚠️ Over 3m Caution
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                                  ⚡ Ideal Pace
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-sans">
                              <button
                                type="button"
                                onClick={() => {
                                  const query = `JEE NEET ${result.settings.subject} ${result.settings.exerciseNumber ? 'Exercise ' + result.settings.exerciseNumber : result.settings.mode} Question ${att.q} solution explanation`;
                                  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                                }}
                                className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 text-[11px] font-semibold transition-colors"
                              >
                                <Search className="w-3 h-3 text-cyan-400" />
                                <span>Solution</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#050510]/90 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>
              {user
                ? `Saved to your local store & backing up to ${user.email}'s Google Drive`
                : 'Session saved locally to device storage'}
            </span>
          </div>

          <button
            onClick={onNewTest}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>START ANOTHER TEST</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
