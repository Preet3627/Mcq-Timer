import React from 'react';
import { TrendingUp, Target, Clock, AlertTriangle, Sparkles, CheckCircle, ArrowUpRight, Award, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const InsightsView: React.FC = () => {
  const { sessions } = useAppStore();

  const totalSessions = sessions.length;

  if (totalSessions === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Insights Yet</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete a few practice sessions to see your speed trends, accuracy progress, and recommendations.
          </p>
        </div>
      </div>
    );
  }

  // Calculate insights
  const avgAccuracy = Math.round(
    sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalSessions
  );
  const avgPace = Math.round(
    sessions.reduce((acc, s) => acc + s.avgTimePerQuestion, 0) / totalSessions
  );

  // Compare recent vs older sessions for improvement text
  let paceTrendText = 'Your average pace is steady across sessions.';
  if (totalSessions >= 2) {
    const latestPace = sessions[0].avgTimePerQuestion;
    const previousPace = sessions[1].avgTimePerQuestion;
    const diff = previousPace - latestPace;
    if (diff > 0) {
      paceTrendText = `Your average time per question improved by ${diff} seconds in your latest session!`;
    } else if (diff < 0) {
      paceTrendText = `Your pace took ${Math.abs(diff)}s longer in your latest set. Keep practicing!`;
    }
  }

  // Overtime questions stat
  const totalOvertimeCount = sessions.reduce((acc, s) => acc + s.overCautionCount, 0);

  // Subject breakdown map
  const subjectMap: Record<string, { count: number; totalAcc: number; totalPace: number }> = {};
  sessions.forEach((s) => {
    const sub = s.settings.subject;
    if (!subjectMap[sub]) {
      subjectMap[sub] = { count: 0, totalAcc: 0, totalPace: 0 };
    }
    subjectMap[sub].count += 1;
    subjectMap[sub].totalAcc += s.accuracy;
    subjectMap[sub].totalPace += s.avgTimePerQuestion;
  });

  const subjectStats = Object.keys(subjectMap).map((sub) => ({
    subject: sub,
    avgAcc: Math.round(subjectMap[sub].totalAcc / subjectMap[sub].count),
    avgPace: Math.round(subjectMap[sub].totalPace / subjectMap[sub].count),
    count: subjectMap[sub].count,
  }));

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header Summary */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-cyan-500/10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Speed & Accuracy Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Your MCQ Pace Highlights</h1>
        <p className="text-xs sm:text-sm text-cyan-100 font-medium">{paceTrendText}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Pace</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{avgPace}s</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">per question</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Accuracy</span>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{avgAccuracy}%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">across {totalSessions} sets</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overtime Questions</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-500">{totalOvertimeCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">took &gt; 3 mins</p>
          </div>
        </div>
      </div>

      {/* Subject Wise Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Subject Wise Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjectStats.map((sub) => (
            <div
              key={sub.subject}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{sub.subject}</span>
                <span className="text-[11px] font-semibold text-slate-500">{sub.count} sessions</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Accuracy: <strong className="text-emerald-600 dark:text-emerald-400">{sub.avgAcc}%</strong></span>
                <span className="text-slate-500">Avg Pace: <strong className="text-slate-800 dark:text-slate-200">{sub.avgPace}s/q</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
