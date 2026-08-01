import React from 'react';
import { X, Trophy, Clock, Target, Trash2, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TestSessionResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TestSessionResult[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onClearHistory
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Test History & Speed Logs
                </h3>
                <p className="text-xs text-slate-400">
                  Saved test sessions & performance records
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Session Log List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {sessions.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                <FileText className="w-10 h-10 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-400">No saved sessions yet</p>
                <p className="text-xs">Complete an MCQ timer test session to view your speed logs here!</p>
              </div>
            ) : (
              sessions.map((sess) => {
                const dateStr = new Date(sess.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={sess.id}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl space-y-3 transition-colors shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full">
                        {sess.settings.subject}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> {dateStr}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-sm font-black text-slate-100">
                          {sess.settings.exerciseNumber ? `Exercise ${sess.settings.exerciseNumber}` : sess.settings.mode}
                        </div>
                        <p className="text-xs text-slate-400">
                          {sess.settings.totalQuestions} Questions
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-amber-400">
                          {sess.totalScore} <span className="text-xs text-slate-500">pts</span>
                        </div>
                        <div className="text-xs text-emerald-400 font-semibold">
                          {sess.accuracy}% Accuracy
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Total: {formatTime(sess.totalTimeSpent)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-orange-400" />
                        <span>Pace: {sess.avgTimePerQuestion}s / Q</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Clear History */}
          {sessions.length > 0 && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold rounded-lg border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logs</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
