import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Trophy,
  Target,
  Search,
  Filter,
  FileText,
  Trash2,
  CalendarCheck2,
  ChevronRight,
  BookOpen,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TestSessionResult, Subject } from '../types';
import { useAppStore } from '../store/useAppStore';

interface HistoryViewProps {
  onOpenCalendarModal?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onOpenCalendarModal }) => {
  const { sessions, clearHistory, removeSession } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [selectedSession, setSelectedSession] = useState<TestSessionResult | null>(null);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSubject =
        selectedSubjectFilter === 'All' ||
        s.settings.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchSubject;

      const matchSearch =
        s.settings.subject.toLowerCase().includes(q) ||
        (s.settings.chapterName && s.settings.chapterName.toLowerCase().includes(q)) ||
        (s.settings.description && s.settings.description.toLowerCase().includes(q)) ||
        (s.settings.exerciseNumber && s.settings.exerciseNumber.toLowerCase().includes(q)) ||
        s.settings.mode.toLowerCase().includes(q);

      return matchSubject && matchSearch;
    });
  }, [sessions, searchQuery, selectedSubjectFilter]);

  // Group Sessions by Date for Timetable View
  const groupedByDate = useMemo(() => {
    const groups: { [dateKey: string]: { dateLabel: string; dateObj: Date; totalSeconds: number; list: TestSessionResult[] } } = {};

    filteredSessions.forEach((sess) => {
      const d = new Date(sess.date);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const dateLabel = d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateLabel,
          dateObj: d,
          totalSeconds: 0,
          list: []
        };
      }

      groups[dateKey].totalSeconds += sess.totalTimeSpent;
      groups[dateKey].list.push(sess);
    });

    // Sort dates descending
    return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [filteredSessions]);

  // Total Study Time & Overall Metrics
  const totalPracticeTimeSec = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.totalTimeSpent, 0);
  }, [sessions]);

  const totalQuestionsSolved = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.settings.totalQuestions, 0);
  }, [sessions]);

  const overallAccuracy = useMemo(() => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.accuracy, 0);
    return Math.round(sum / sessions.length);
  }, [sessions]);

  const formatHoursMins = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  const formatTimeString = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Study Timetable & Practice Schedule
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                Daily Study Timetable & Speed Logs
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Track exact study time slots, chapter progress, and practice duration for JEE/NEET prep.
              </p>
            </div>

            {onOpenCalendarModal && (
              <button
                type="button"
                onClick={onOpenCalendarModal}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Schedule Study Event</span>
              </button>
            )}
          </div>

          {/* Quick Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Study Time</span>
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {formatHoursMins(totalPracticeTimeSec)}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Solved</span>
              </div>
              <div className="text-lg font-black text-emerald-300 mt-0.5">
                {totalQuestionsSolved} Questions
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Avg Accuracy</span>
              </div>
              <div className="text-lg font-black text-amber-300 mt-0.5">
                {overallAccuracy}%
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Test Sessions</span>
              </div>
              <div className="text-lg font-black text-purple-300 mt-0.5">
                {sessions.length} Sessions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Chapter, Subject, Ex No..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Subject Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubjectFilter(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubjectFilter === subj
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable / Logs List */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Timetable Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {sessions.length === 0
              ? 'Complete an MCQ practice timer session to record your daily study time and chapter logs here.'
              : 'No sessions match your search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map((group) => (
            <div key={group.dateLabel} className="space-y-3">
              {/* Daily Date & Time Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {group.dateLabel}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Daily Practice Time: {formatHoursMins(group.totalSeconds)}</span>
                </div>
              </div>

              {/* Session Cards for this date */}
              <div className="grid grid-cols-1 gap-3">
                {group.list.map((sess) => {
                  const startTime = formatTimeString(sess.date);
                  // Estimate end time
                  const endDate = new Date(new Date(sess.date).getTime() + sess.totalTimeSpent * 1000);
                  const endTime = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={sess.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left Block: Time Slot & Subject/Chapter */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                            {startTime} - {endTime}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 font-bold text-xs">
                            {sess.settings.subject}
                          </span>

                          {sess.settings.exerciseNumber && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                              Ex {sess.settings.exerciseNumber}
                            </span>
                          )}

                          <span className="text-xs text-slate-400 font-medium">
                            • {sess.settings.mode}
                          </span>
                        </div>

                        {/* Chapter Name & Notes */}
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-cyan-500 shrink-0" />
                            <span>{sess.settings.chapterName || `${sess.settings.subject} Practice Set`}</span>
                          </h4>
                          {sess.settings.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {sess.settings.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Stats & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-right space-y-0.5">
                          <div className="text-sm font-black text-slate-900 dark:text-white">
                            {sess.totalScore} / {sess.maxScore} <span className="text-xs font-normal text-slate-400">pts</span>
                          </div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {sess.accuracy}% Accuracy ({sess.totalCorrect}/{sess.settings.totalQuestions})
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Pace: {sess.avgTimePerQuestion}s / Q
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSession(sess.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors"
                          title="Delete Session Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Clear All Button */}
      {sessions.length > 0 && (
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-bold border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Entire History Log</span>
          </button>
        </div>
      )}
    </div>
  );
};
