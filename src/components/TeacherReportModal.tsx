import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Award,
  BookOpen,
  BarChart2,
  Calendar,
  Clock,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateTeacherShareUrl } from '../utils/promptGenerator';

interface TeacherReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherReportModal: React.FC<TeacherReportModalProps> = ({ isOpen, onClose }) => {
  const { sessions, customTimetable, schoolProfile, user } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [studentNameInput, setStudentNameInput] = useState(
    user?.name || schoolProfile?.schoolName || 'Aspirant Student'
  );

  if (!isOpen) return null;

  const shareUrl = generateTeacherShareUrl(
    sessions,
    customTimetable,
    schoolProfile,
    studentNameInput
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const totalQuestions = sessions.reduce((acc, s) => acc + s.settings.totalQuestions, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.totalCorrect, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-6 my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              1-Link Teacher & Parent Sharing
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              Share Analytics Report
            </h2>
          </div>
        </div>

        {/* Student Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Student Name on Report Card:
          </label>
          <input
            type="text"
            value={studentNameInput}
            onChange={(e) => setStudentNameInput(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Card Report Preview */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4 shadow-inner border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="font-black text-sm text-emerald-400">{studentNameInput}</div>
              <div className="text-[10px] text-slate-400">
                {schoolProfile?.schoolName} • {schoolProfile?.stream} Stream
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
              Live Verified Log
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-800/80">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tests Logged</div>
              <div className="text-base font-black text-white">{sessions.length}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</div>
              <div className="text-base font-black text-emerald-400">{avgAccuracy}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Qs</div>
              <div className="text-base font-black text-cyan-400">{totalQuestions}</div>
            </div>
          </div>
        </div>

        {/* Share Link Button */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Generated Share Link for Teachers:
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
