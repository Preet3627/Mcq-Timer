import React, { useState } from 'react';
import {
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Sparkles,
  Bell,
  Trash2,
  School,
  RotateCcw,
  CalendarCheck,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ThemeMode } from '../types';

export const SettingsView: React.FC = () => {
  const {
    user,
    signOut,
    loginWithGoogle,
    themeMode,
    setThemeMode,
    testSettings,
    setTestSettings,
    syncState,
    syncToCloud,
    restoreFromCloud,
    lastSyncedAt,
    sessions,
    clearSessions,
    pwaInstallPrompt,
    isPwaInstalled,
    schoolProfile,
    setShowSchoolModal,
    restoreDefaultTimetable,
    clearGoogleCalendarEvents,
  } = useAppStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleToggleTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    const success = await syncToCloud();
    setIsSyncing(false);
    if (success) {
      setSyncMsg('Successfully backed up to your Google account!');
    } else {
      setSyncMsg('Sync failed or offline. Practice data is safe on this device.');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ version: 1, settings: testSettings, sessions }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qtick_practice_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInstallPwa = () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage your account, theme, sound, and cloud backup</p>
      </div>

      {/* 1. Account & Google Sign-In Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <User className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Google Account</span>
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border border-blue-500/20" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Practice data synced to your Google account
                </div>
              </div>
            </div>

            <button
              onClick={signOut}
              className="px-4 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-3">
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold">Connect your Google Account</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sign in so your practice history automatically backs up safely to your own account.
              </p>
            </div>
            <button
              onClick={() => loginWithGoogle()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* 1B. School & Timetable Management Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <School className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>School Profile & Timetable Management</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {schoolProfile?.schoolType === 'ashadeep'
                ? 'Ashadeep IIT & NEET Group (Sankalp Batch)'
                : schoolProfile?.schoolType === 'custom'
                ? schoolProfile.schoolName
                : 'Guest Mode'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stream: <span className="font-bold text-blue-600 dark:text-blue-400">{schoolProfile?.stream || 'JEE'}</span> • Status: {schoolProfile?.isVerified ? 'Verified' : 'Guest/Custom'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSchoolModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 self-start sm:self-auto"
          >
            Change School / Password
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              restoreDefaultTimetable();
              alert('Restored default Ashadeep JEE 2026-27 timetable!');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Restore Default Ashadeep Timetable</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await clearGoogleCalendarEvents();
              alert('Cleared local Google Calendar event links.');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Reset Calendar Sync Links</span>
          </button>
        </div>
      </div>

      {/* 2. Theme Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>App Appearance & Theme</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
            { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
            { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
          ].map((item) => {
            const isActive = themeMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleToggleTheme(item.id as ThemeMode)}
                className={`p-3.5 rounded-2xl border font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-cyan-400 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sound & Ambient Focus Audio */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Volume2 className="w-4 h-4 text-cyan-500" />
          <span>Sound & Ambient Focus Audio</span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="font-bold text-slate-800 dark:text-slate-200">Timer Sound Effects</span>
            <input
              type="checkbox"
              checked={testSettings.soundEnabled}
              onChange={(e) => setTestSettings({ ...testSettings, soundEnabled: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-600 dark:text-slate-400">Ambient Background Sound</label>
            <select
              value={testSettings.ambientSound}
              onChange={(e) => setTestSettings({ ...testSettings, ambientSound: e.target.value as any })}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs"
            >
              <option value="none">None (Silent)</option>
              <option value="rain">Soft Rain</option>
              <option value="brown_noise">Brown Noise</option>
              <option value="zen_pad">Zen Study Pad</option>
              <option value="ticking">Subtle Clock Ticking</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Data Backup & Storage */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <HardDrive className="w-4 h-4 text-emerald-500" />
          <span>Data Storage & Cloud Backup</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Cloud Backup Status</span>
              <span className="font-mono text-slate-500">
                {lastSyncedAt ? `Last synced: ${lastSyncedAt}` : 'Not synced yet'}
              </span>
            </div>
            {syncMsg && <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{syncMsg}</p>}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>

            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA Installation Card if prompt available */}
      {pwaInstallPrompt && !isPwaInstalled && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-sm">Install QTick App</h3>
          </div>
          <p className="text-xs text-blue-100">
            Install QTick to your home screen for quick offline access during study sessions.
          </p>
          <button
            onClick={handleInstallPwa}
            className="px-5 py-2.5 bg-white text-blue-900 font-extrabold text-xs rounded-xl shadow hover:bg-blue-50 transition-colors"
          >
            Install App to Device
          </button>
        </div>
      )}
    </div>
  );
};
