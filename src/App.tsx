import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SplashAnimation } from './components/SplashAnimation';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeView } from './components/HomeView';
import { SetupModal } from './components/SetupModal';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { TimerEngine } from './components/TimerEngine';
import { ScorecardModal } from './components/ScorecardModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AIPromptModal } from './components/AIPromptModal';
import { CalendarModal } from './components/CalendarModal';
import { OAuthSettingsModal } from './components/OAuthSettingsModal';
import { SchoolSelectionModal } from './components/SchoolSelectionModal';
import { AshadeepPlannerView } from './components/AshadeepPlannerView';
import { FlashcardsView } from './components/FlashcardsView';
import { PromptGeneratorModal } from './components/PromptGeneratorModal';
import { AIPlannerModal } from './components/AIPlannerModal';
import { DeepLinkApprovalModal } from './components/DeepLinkApprovalModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { TeacherReportModal } from './components/TeacherReportModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TestSettings, TestSessionResult, NavTab, UnfinishedSession } from './types';
import { useAppStore } from './store/useAppStore';
import { parseAnswerKeyInput } from './utils/answerKeyParser';
import { parseDeepLinkFromUrl } from './utils/promptGenerator';
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
    showSchoolModal,
    setShowSchoolModal,
    pendingDeepLink,
    showDeepLinkModal,
    showVersionModal,
    showTeacherReportModal,
    showAIPlannerModal,
    setPendingDeepLink,
    setShowDeepLinkModal,
    setShowVersionModal,
    setShowTeacherReportModal,
    setShowAIPlannerModal,
  } = useAppStore();

  const [showSplash, setShowSplash] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [view, setView] = useState<'tabs' | 'timer' | 'scorecard'>('tabs');
  const [testSettings, setTestSettings] = useState<TestSettings | null>(lastSettings);
  const [testResult, setTestResult] = useState<TestSessionResult | null>(null);

  // Modals
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isPromptGenOpen, setIsPromptGenOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isOAuthOpen, setIsOAuthOpen] = useState(false);
  const [selectedHistoryResult, setSelectedHistoryResult] = useState<TestSessionResult | null>(null);

  // Initialize store listeners, PWA, and check URL for deep links
  useEffect(() => {
    initStoreListeners();

    // Check for Deep Link URL query parameters
    if (window.location.search) {
      const parsed = parseDeepLinkFromUrl(window.location.search);
      if (parsed) {
        setPendingDeepLink(parsed);
        setShowDeepLinkModal(true);
      }
    }

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

  const [resumeSessionState, setResumeSessionState] = useState<UnfinishedSession | null>(null);

  // Handle Start Test from Setup or Quick Start
  const handleStartTest = (settings: TestSettings) => {
    setResumeSessionState(null);
    setTestSettings(settings);
    setLastSettings(settings);
    setView('timer');
  };

  // Handle Resume Unfinished Session
  const handleResumeUnfinished = () => {
    if (unfinishedSession) {
      setResumeSessionState(unfinishedSession);
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
                <HistoryView onOpenCalendarModal={() => setIsCalendarOpen(true)} />
              )}

              {activeTab === 'planner' && <AshadeepPlannerView />}

              {activeTab === 'flashcards' && <FlashcardsView />}

              {activeTab === 'insights' && <InsightsView />}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}

          {view === 'timer' && testSettings && (
            <TimerEngine
              settings={testSettings}
              onFinishTest={handleFinishTest}
              onResetSetup={handleResetSetup}
              initialState={resumeSessionState}
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

        {/* AI Answer Key Convertor Modal */}
        <AIPromptModal
          isOpen={isAIPromptOpen}
          onClose={() => setIsAIPromptOpen(false)}
          subject={testSettings?.subject || lastSettings.subject || 'Physics'}
          totalQuestions={testSettings?.totalQuestions || lastSettings.totalQuestions || 30}
          onImportJSON={(jsonStr) => {
            const parsed = parseAnswerKeyInput(jsonStr, testSettings?.totalQuestions || lastSettings.totalQuestions || 30);
            if (parsed.length > 0) {
              if (testSettings) {
                setTestSettings({ ...testSettings, answerKey: parsed });
              }
              setLastSettings({ ...lastSettings, answerKey: parsed });
            }
          }}
        />

        {/* Dynamic AI Schedule & Analytics Prompt Generator Modal */}
        <PromptGeneratorModal
          isOpen={isPromptGenOpen}
          onClose={() => setIsPromptGenOpen(false)}
        />

        {/* Deep Link Import Approval & Preview Modal */}
        <DeepLinkApprovalModal
          isOpen={showDeepLinkModal}
          onClose={() => setShowDeepLinkModal(false)}
        />

        {/* History Versioning & Rollback Snapshot Recovery Modal */}
        <VersionHistoryModal
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
        />

        {/* Teacher Share Report Modal */}
        <TeacherReportModal
          isOpen={showTeacherReportModal}
          onClose={() => setShowTeacherReportModal(false)}
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

        {/* School & Stream Selection Modal */}
        <SchoolSelectionModal
          isOpen={showSchoolModal}
          onClose={() => setShowSchoolModal(false)}
        />

        {/* AI Master Planner & All-In-One JSON Studio Modal */}
        <AIPlannerModal
          isOpen={showAIPlannerModal}
          onClose={() => setShowAIPlannerModal(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
