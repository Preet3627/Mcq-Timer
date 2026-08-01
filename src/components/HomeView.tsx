import React, { useEffect, useState } from 'react';
import { Play, Clock, Target, Trophy, ArrowRight, Zap, RefreshCw, Sparkles, CheckCircle2, RotateCcw, Cpu, BrainCircuit, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { QTickLogo } from './QTickLogo';
import { NavTab, TestSessionResult } from '../types';
import { runLocalTfInference, TFJSModelPrediction } from '../utils/tfjsPredictor';

interface HomeViewProps {
  onStartPractice: () => void;
  onContinueUnfinished: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onViewSessionDetail: (session: TestSessionResult) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartPractice,
  onContinueUnfinished,
  onNavigateTab,
  onViewSessionDetail,
}) => {
  const { sessions, unfinishedSession, user, themeMode, setShowAIPlannerModal } = useAppStore();

  const [tfPrediction, setTfPrediction] = useState<TFJSModelPrediction | null>(null);

  useEffect(() => {
    runLocalTfInference(sessions).then(setTfPrediction);
  }, [sessions]);

  // Compute stats
  const totalSessions = sessions.length;
  const totalTimeSeconds = sessions.reduce((acc, s) => acc + s.totalTimeSpent, 0);
  const avgAccuracy =
    totalSessions > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalSessions)
      : 0;
  const avgPace =
    totalSessions > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.avgTimePerQuestion, 0) / totalSessions)
      : 0;

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const recentSessions = sessions.slice(0, 4);

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Active Unfinished Session Banner */}
      {unfinishedSession && (
        <div className="bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/40 dark:border-amber-500/40 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Incomplete Session
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {Math.floor(unfinishedSession.totalSessionTime / 60)}m spent
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                {unfinishedSession.settings.subject} • {unfinishedSession.settings.exerciseNumber ? `Exercise ${unfinishedSession.settings.exerciseNumber}` : unfinishedSession.settings.mode}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Question {unfinishedSession.currentQ} of {unfinishedSession.settings.totalQuestions} ({Object.values(unfinishedSession.attempts).filter(a => a.selectedAns).length} answered)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onContinueUnfinished}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Session</span>
            </button>
            <button
              onClick={useAppStore.getState().clearUnfinishedSession}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 font-bold text-xs transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}!</span>
            </div>

            {tfPrediction && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 backdrop-blur-md text-xs font-bold text-purple-200 border border-purple-400/30">
                <Cpu className="w-3.5 h-3.5 text-purple-300" />
                <span>TF.js Target Pace: {tfPrediction.recommendedTargetTimeSec}s/Q</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Ready to build your MCQ speed today?
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 font-medium">
            Track every question's seconds, improve your accuracy, and prepare for JEE & NEET.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onStartPractice}
              className="px-6 py-3 rounded-2xl bg-white text-blue-900 font-bold text-xs sm:text-sm shadow-lg shadow-black/10 hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Practice Now</span>
            </button>

            <button
              onClick={() => setShowAIPlannerModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-black/10 transition-all flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4 text-slate-950" />
              <span>AI Planner & JSON Studio</span>
            </button>

            {unfinishedSession && (
              <button
                onClick={onContinueUnfinished}
                className="px-5 py-3 rounded-2xl bg-blue-900/60 hover:bg-blue-900/80 backdrop-blur-md text-white border border-white/20 font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Resume Active Session (Q{unfinishedSession.currentQ})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Practice Time */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Practice</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {formatTime(totalTimeSeconds)}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{totalSessions} practice sessions</p>
          </div>
        </div>

        {/* Avg Speed per Q */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Pace / Question</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {avgPace > 0 ? `${avgPace}s` : '--'}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Target: ~180s (3 mins)</p>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalSessions > 0 ? `${avgAccuracy}%` : '--'}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Across all completed sets</p>
          </div>
        </div>

        {/* Total Questions Solved */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Questions Solved</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {sessions.reduce((acc, s) => acc + s.settings.totalQuestions, 0)}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">MCQs tracked</p>
          </div>
        </div>
      </div>

      {/* Aspirant Toolkit & AI Integrations */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI Mentor & Teacher Toolkit</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export 1-month AI prompts, share teacher reports, roll back versions, and revise formula cards
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => useAppStore.getState().setShowDeepLinkModal(true)}
            className="p-3.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-left space-y-1.5 hover:border-indigo-500 transition-all"
          >
            <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">🤖 AI Schedule Prompt</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Export 1-month context to Gemini/ChatGPT</div>
          </button>

          <button
            type="button"
            onClick={() => useAppStore.getState().setShowTeacherReportModal(true)}
            className="p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-left space-y-1.5 hover:border-emerald-500 transition-all"
          >
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">📊 Teacher Share Link</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Send 1-link analytics card to mentor</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('flashcards')}
            className="p-3.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-left space-y-1.5 hover:border-purple-500 transition-all"
          >
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300">⚡ Formula Vault</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Master JEE/NEET formula memory cards</div>
          </button>

          <button
            type="button"
            onClick={() => useAppStore.getState().setShowVersionModal(true)}
            className="p-3.5 rounded-2xl border border-cyan-200/80 dark:border-cyan-900/60 bg-cyan-50/50 dark:bg-cyan-950/30 text-left space-y-1.5 hover:border-cyan-500 transition-all"
          >
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">🕒 History Version Recovery</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Restore previous app history snapshots</div>
          </button>
        </div>
      </div>

      {/* Quick Start Subjects Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick Start Practice</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pick a subject and jump straight into solving</p>
          </div>
          <button
            onClick={() => onNavigateTab('practice')}
            className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Custom Setup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { subject: 'Physics', icon: '⚡', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' },
            { subject: 'Chemistry', icon: '🧪', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' },
            { subject: 'Mathematics', icon: '📐', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40' },
            { subject: 'Biology', icon: '🧬', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40' },
          ].map((item) => (
            <button
              key={item.subject}
              onClick={onStartPractice}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 space-y-2 ${item.color}`}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{item.subject}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">30 Questions • 3m pace</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Practice Sessions</h2>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            View All History
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-xs">No practice sessions completed yet.</p>
            <button
              onClick={onStartPractice}
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              Start your first session →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onViewSessionDetail(s)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 dark:text-cyan-400 text-sm">
                    {s.settings.subject.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {s.settings.subject} • {s.settings.exerciseNumber ? `Exercise ${s.settings.exerciseNumber}` : s.settings.mode}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(s.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                    {s.accuracy}% Accuracy
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {Math.round(s.totalTimeSpent / 60)}m ({s.avgTimePerQuestion}s/q)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
