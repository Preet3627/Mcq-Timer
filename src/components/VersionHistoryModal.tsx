import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Trash2,
  X,
  ShieldCheck,
  Clock,
  Database,
  CheckCircle2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const {
    historySnapshots,
    createHistorySnapshot,
    restoreHistorySnapshot,
    deleteHistorySnapshot,
  } = useAppStore();

  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const [manualLabel, setManualLabel] = useState('');

  if (!isOpen) return null;

  const handleCreateManualSnapshot = () => {
    const label = manualLabel.trim() || `Manual Snapshot ${new Date().toLocaleTimeString()}`;
    createHistorySnapshot('manual_backup', label);
    setManualLabel('');
    setRestoreMsg('Created new history snapshot successfully!');
    setTimeout(() => setRestoreMsg(null), 3000);
  };

  const handleRestore = (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to recover app history to version: "${label}"?`)) {
      const success = restoreHistorySnapshot(id);
      if (success) {
        setRestoreMsg(`Successfully restored app history to: "${label}"!`);
        setTimeout(() => setRestoreMsg(null), 4000);
      }
    }
  };

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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Version History & Recovery
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              App State Version Backups
            </h2>
          </div>
        </div>

        {/* Notification Feedback */}
        {restoreMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{restoreMsg}</span>
          </div>
        )}

        {/* Create Manual Snapshot Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Database className="w-4 h-4 text-cyan-500" />
            <span>Create Immediate State Backup</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualLabel}
              onChange={(e) => setManualLabel(e.target.value)}
              placeholder="Backup Label (e.g. Before JMWT-01 Revision)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={handleCreateManualSnapshot}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Save Version</span>
            </button>
          </div>
        </div>

        {/* Version List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Available Past Versions ({historySnapshots?.length || 0})
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
            {!historySnapshots || historySnapshots.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No past version snapshots created yet. Snapshots are created automatically before imports!
              </div>
            ) : (
              historySnapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 hover:border-cyan-500/50 transition-all"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span>{snap.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {new Date(snap.timestamp).toLocaleString()} • {snap.sessionCount} Test Logs • {snap.timetableCount} Exams • {snap.flashcardCount} Cards
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestore(snap.id, snap.label)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs font-bold flex items-center gap-1 border border-cyan-200 dark:border-cyan-800 transition-all"
                      title="Restore app history to this snapshot"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Recover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteHistorySnapshot(snap.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      title="Delete snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
