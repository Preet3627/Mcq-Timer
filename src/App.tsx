import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SplashAnimation } from './components/SplashAnimation';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeView } from './components/HomeView';
import { SetupModal } from './components/SetupModal';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { TimerEngine } from './components/TimerEngine';
import { ScorecardModal } from './components/ScorecardModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AIPromptModal } from './components/AIPromptModal';
import { CalendarModal } from './components/CalendarModal';
import { OAuthSettingsModal } from './components/OAuthSettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TestSettings, TestSessionResult, NavTab } from './types';
import { useAppStore } from './store/useAppStore';
import { startAmbientSound, stopAmbientSound, updateAmbientVolume } from './utils/audio';

export default function App() {
  const {
    user,
    sessions,
    lastSettings,
    unfinishedSession,
    saveSession,
    clearSessions,
    setLastSettings,
    initStoreListeners,
    setPwaInstallPrompt,
    setIsPwaInstalled,
    themeMode,
    activeTab,
    setActiveTab,
  } = useAppStore();

  const [showSplash, setShowSplash] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [view, setView] = useState<'tabs' | 'timer' | 'scorecard'>('tabs');
  const [testSettings, setTestSettings] = useState<TestSettings | null>(lastSettings);
  const [testResult, setTestResult] = useState<TestSessionResult | null>(null);

  // Modals
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isOAuthOpen, setIsOAuthOpen] = useState(false);
  const [selectedHistoryResult, setSelectedHistoryResult] = useState<TestSessionResult | null>(null);

  // Initialize store listeners & PWA install prompts
  useEffect(() => {
    initStoreListeners();

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('QTick ServiceWorker registered:', reg.scope))
        .catch((err) => console.warn('SW registration failed:', err));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setPwaInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle Start Test from Setup or Quick Start
  const handleStartTest = (settings: TestSettings) => {
    setTestSettings(settings);
    setLastSettings(settings);
    setView('timer');
  };

  // Handle Resume Unfinished Session
  const handleResumeUnfinished = () => {
    if (unfinishedSession) {
      setTestSettings(unfinishedSession.settings);
      setView('timer');
    }
  };

  // Handle Test Finish
  const handleFinishTest = (result: TestSessionResult) => {
    setTestResult(result);
    setView('scorecard');
  };

  // Handle Save History
  const handleSaveToHistory = (result: TestSessionResult) => {
    saveSession(result);
  };

  // Reset Back to Setup / Main Views
  const handleResetSetup = () => {
    stopAmbientSound();
    setView('tabs');
  };

  // Sound Toggles
  const handleToggleSound = () => {
    if (!testSettings) return;
    const nextSoundState = !testSettings.soundEnabled;
    const updated = {
      ...testSettings,
      soundEnabled: nextSoundState,
    };
    setTestSettings(updated);
    setLastSettings(updated);
    if (!nextSoundState) {
      stopAmbientSound();
    } else if (testSettings.ambientSound !== 'none') {
      startAmbientSound(testSettings.ambientSound, testSettings.volume);
    }
  };

  const handleChangeAmbientSound = (sound: TestSettings['ambientSound']) => {
    if (!testSettings) return;
    const updated = {
      ...testSettings,
      ambientSound: sound,
    };
    setTestSettings(updated);
    setLastSettings(updated);
    if (testSettings.soundEnabled) {
      startAmbientSound(sound, testSettings.volume);
    }
  };

  const handleChangeVolume = (vol: number) => {
    if (!testSettings) return;
    const updated = {
      ...testSettings,
      volume: vol,
    };
    setTestSettings(updated);
    setLastSettings(updated);
    updateAmbientVolume(vol);
  };

  // Show 3D PWA Splash Screen on launch
  if (showSplash) {
    return <SplashAnimation onComplete={() => setShowSplash(false)} />;
  }

  // Google Sign-In Guard (If user not logged in & hasn't chosen guest mode)
  if (!user && !isGuestMode) {
    return (
      <ErrorBoundary>
        <WelcomeScreen onGuestContinue={() => setIsGuestMode(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors">
        {/* Top Header Bar */}
        <Header
          settings={testSettings}
          isTestActive={view === 'timer'}
          activeTab={activeTab}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setView('tabs');
          }}
          onOpenAIPrompt={() => setIsAIPromptOpen(true)}
          onOpenOAuthModal={() => setIsOAuthOpen(true)}
          onOpenCalendarModal={() => setIsCalendarOpen(true)}
          onResetTest={handleResetSetup}
          onToggleSound={handleToggleSound}
          onChangeAmbientSound={handleChangeAmbientSound}
          onChangeVolume={handleChangeVolume}
        />

        {/* Main Content View Switcher */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6">
          {view === 'tabs' && (
            <>
              {activeTab === 'home' && (
                <HomeView
                  onStartPractice={() => {
                    setActiveTab('practice');
                  }}
                  onContinueUnfinished={handleResumeUnfinished}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onViewSessionDetail={(session) => {
                    setTestResult(session);
                    setView('scorecard');
                  }}
                />
              )}

              {activeTab === 'practice' && (
                <SetupModal
                  onStartTest={handleStartTest}
                  onOpenAIPrompt={() => setIsAIPromptOpen(true)}
                  initialSettings={testSettings || undefined}
                />
              )}

              {activeTab === 'history' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Practice History</h1>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Review all your previous MCQ test sessions</p>
                    </div>
                    {sessions.length > 0 && (
                      <button
                        onClick={clearSessions}
                        className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
                      >
                        Clear All History
                      </button>
                    )}
                  </div>

                  {sessions.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      No saved practice sessions yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setTestResult(s);
                            setView('scorecard');
                          }}
                          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all"
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                              {s.settings.subject} • {s.settings.mode}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {new Date(s.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                              {s.accuracy}% Accuracy
                            </div>
                            <div className="text-xs text-slate-400">
                              {Math.round(s.totalTimeSpent / 60)}m spent ({s.avgTimePerQuestion}s/q)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'insights' && <InsightsView />}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}

          {view === 'timer' && testSettings && (
            <TimerEngine
              settings={testSettings}
              onFinishTest={handleFinishTest}
              onResetSetup={handleResetSetup}
            />
          )}

          {view === 'scorecard' && testResult && (
            <ScorecardModal
              result={testResult}
              onNewTest={handleResetSetup}
              onSaveToHistory={handleSaveToHistory}
              onOpenCalendarModal={() => setIsCalendarOpen(true)}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden during active MCQ timer) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setView('tabs');
          }}
          isTimerActive={view === 'timer'}
        />

        {/* AI Prompt Helper Modal */}
        <AIPromptModal
          isOpen={isAIPromptOpen}
          onClose={() => setIsAIPromptOpen(false)}
          subject={testSettings?.subject || 'Physics'}
          totalQuestions={testSettings?.totalQuestions || 30}
          onImportJSON={() => {}}
        />

        {/* Google Calendar Schedule Modal */}
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          defaultSubject={testSettings?.subject || 'Physics'}
        />

        {/* Google OAuth Settings Modal */}
        <OAuthSettingsModal
          isOpen={isOAuthOpen}
          onClose={() => setIsOAuthOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
