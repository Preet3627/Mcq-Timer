import React from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  BarChart3,
  Sparkles,
  RotateCcw,
  Calendar,
  HardDrive,
  Smartphone,
  UserCheck,
  Sun,
  Moon,
  Monitor,
  School,
  BookOpen
} from 'lucide-react';
import { QTickLogo } from './QTickLogo';
import { TestSettings, NavTab, ThemeMode } from '../types';
import { useAppStore } from '../store/useAppStore';

interface HeaderProps {
  settings: TestSettings | null;
  isTestActive: boolean;
  activeTab: NavTab;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAIPrompt: () => void;
  onOpenOAuthModal: () => void;
  onOpenCalendarModal: () => void;
  onResetTest?: () => void;
  onToggleSound: () => void;
  onChangeAmbientSound: (sound: TestSettings['ambientSound']) => void;
  onChangeVolume: (vol: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isTestActive,
  activeTab,
  onNavigateTab,
  onOpenAIPrompt,
  onOpenOAuthModal,
  onOpenCalendarModal,
  onResetTest,
  onToggleSound,
  onChangeAmbientSound,
  onChangeVolume,
}) => {
  const {
    user,
    themeMode,
    setThemeMode,
    pwaInstallPrompt,
    isPwaInstalled,
    schoolProfile,
    setShowSchoolModal,
  } = useAppStore();

  const handleInstallPWA = () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
    }
  };

  const desktopNavItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'practice', label: 'Practice' },
    { id: 'planner', label: 'Syllabus & Planner' },
    { id: 'history', label: 'History' },
    { id: 'insights', label: 'Insights' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Branding & Logo */}
        <div className="flex items-center gap-4">
          <div onClick={() => onNavigateTab('home')} className="cursor-pointer">
            <QTickLogo variant="full" size="md" />
          </div>

          {/* Desktop Navigation Links */}
          {!isTestActive && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl text-xs font-semibold">
              {desktopNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigateTab(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Active Session Badge during Timer */}
        {isTestActive && settings && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-blue-900 dark:text-cyan-300">{settings.subject}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">{settings.mode}</span>
          </div>
        )}

        {/* Controls Grid */}
        <div className="flex items-center gap-2">
          {/* Theme Quick Toggle */}
          <button
            onClick={() => {
              const nextMode: ThemeMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
              setThemeMode(nextMode);
            }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={`Theme: ${themeMode} (click to toggle)`}
          >
            {themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-cyan-400" />
            ) : (
              <Monitor className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* PWA Install Button */}
          {pwaInstallPrompt && !isPwaInstalled && (
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all"
              title="Install App"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* School Selector Button */}
          <button
            onClick={() => setShowSchoolModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800 transition-all"
            title="School & Stream Selection"
          >
            <School className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">
              {schoolProfile?.schoolType === 'ashadeep'
                ? 'Ashadeep IIT'
                : schoolProfile?.schoolType === 'custom'
                ? schoolProfile.schoolName
                : 'School'}
            </span>
          </button>

          {/* Google Calendar Reminder Button */}
          <button
            onClick={onOpenCalendarModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Schedule Practice Session in Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Schedule</span>
          </button>

          {/* User Account Button */}
          <button
            onClick={() => onNavigateTab('settings')}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs transition-colors"
          >
            {user ? (
              <>
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-4 h-4 rounded-full" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hidden md:inline">
                  {user.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hidden md:inline">
                  Account
                </span>
              </>
            )}
          </button>

          {/* Sound Controls */}
          {settings && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs">
              <button
                onClick={onToggleSound}
                className={`p-1.5 rounded-lg transition-colors ${
                  settings.soundEnabled
                    ? 'bg-blue-500/20 text-blue-600 dark:text-cyan-400 font-bold'
                    : 'text-slate-400'
                }`}
                title={settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          )}

          {/* End Practice */}
          {isTestActive && onResetTest && (
            <button
              onClick={onResetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End Practice</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
