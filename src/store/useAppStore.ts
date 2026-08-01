import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  TestSettings,
  TestSessionResult,
  GoogleUserProfile,
  SyncState,
  CalendarEventRequest,
  ThemeMode,
  NavTab,
  UnfinishedSession,
  SchoolProfile,
  AshadeepExamEvent,
  FlashcardItem,
  HistorySnapshot,
  DeepLinkPayload,
  ExamScoreRecord,
  MotivationalQuoteItem,
  AIPlannerImportPayload,
} from '../types';
import { getOriginalAshadeepTimetable } from '../data/ashadeepSchedule';
import { INITIAL_AUTO_FLASHCARDS } from '../data/autoFlashcards';
import {
  authenticateGoogleUser,

  saveToGoogleDrive,
  loadFromGoogleDrive,
  createGoogleCalendarEvent,
} from '../utils/googleServices';
import { requestWakeLock, releaseWakeLock } from '../utils/device';

// Default Client ID or from environment
const DEFAULT_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '992823023011-sampleclientid.apps.googleusercontent.com';

export const DEFAULT_SETTINGS: TestSettings = {
  subject: 'Physics',
  mode: 'Self Practice',
  level: 'Level 1',
  customTag: '',
  totalQuestions: 30,
  targetTimePerQuestion: 180, // 3 minutes
  cautionThreshold: 180, // 3 minutes
  urgentThreshold: 600, // 10 minutes
  soundEnabled: true,
  ambientSound: 'none',
  volume: 0.7,
  enableNegativeMarking: true,
  feedbackMode: 'test',
  answerKey: Array.from({ length: 30 }, (_, i) => ({ q: i + 1, ans: '' })),
  hapticsEnabled: true,
  notificationsEnabled: true,
};

interface AppState {
  // Config & State
  testSettings: TestSettings;
  lastSettings: TestSettings;
  sessions: TestSessionResult[];
  unfinishedSession: UnfinishedSession | null;
  user: GoogleUserProfile | null;
  googleClientId: string;
  syncState: SyncState;
  lastSyncedAt: string | null;
  syncError: string | null;
  wakeLockActive: boolean;
  pwaInstallPrompt: any | null;
  isPwaInstalled: boolean;
  themeMode: ThemeMode;
  activeTab: NavTab;

  // School & Timetable State
  schoolProfile: SchoolProfile | null;
  customTimetable: AshadeepExamEvent[];
  showSchoolModal: boolean;

  // Flashcards, Versioning, and Deep Link State
  flashcards: FlashcardItem[];
  historySnapshots: HistorySnapshot[];
  pendingDeepLink: DeepLinkPayload | null;
  showDeepLinkModal: boolean;
  showVersionModal: boolean;
  showTeacherReportModal: boolean;
  showAIPlannerModal: boolean;
  examScores: ExamScoreRecord[];

  // Actions
  setTestSettings: (settings: TestSettings) => void;
  setLastSettings: (settings: TestSettings) => void;
  setUnfinishedSession: (session: UnfinishedSession | null) => void;
  clearUnfinishedSession: () => void;
  addSession: (result: TestSessionResult) => void;
  saveSession: (result: TestSessionResult) => void;
  deleteSession: (id: string) => void;
  clearSessions: () => void;
  setUser: (user: GoogleUserProfile | null) => void;
  signOut: () => void;
  setGoogleClientId: (clientId: string) => void;
  setPwaInstallPrompt: (prompt: any) => void;
  setIsPwaInstalled: (installed: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setActiveTab: (tab: NavTab) => void;
  initStoreListeners: () => void;

  // Flashcard Actions
  addFlashcard: (card: FlashcardItem) => void;
  toggleFlashcardLearned: (id: string) => void;
  deleteFlashcard: (id: string) => void;
  setFlashcards: (cards: FlashcardItem[]) => void;

  // Versioning & Snapshot Actions
  createHistorySnapshot: (reason: HistorySnapshot['reason'], label?: string) => string;
  restoreHistorySnapshot: (snapshotId: string) => boolean;
  deleteHistorySnapshot: (snapshotId: string) => void;

  // Deep Link & AI Planner Actions
  setPendingDeepLink: (payload: DeepLinkPayload | null) => void;
  setShowDeepLinkModal: (show: boolean) => void;
  setShowVersionModal: (show: boolean) => void;
  setShowTeacherReportModal: (show: boolean) => void;
  setShowAIPlannerModal: (show: boolean) => void;
  applyDeepLinkPayload: (payload: DeepLinkPayload) => void;
  importAIPlannerPayload: (payload: AIPlannerImportPayload) => void;
  addExamScore: (record: ExamScoreRecord) => void;
  deleteExamScore: (id: string) => void;

  // School & Timetable Actions
  setSchoolProfile: (profile: SchoolProfile | null) => void;
  setShowSchoolModal: (show: boolean) => void;
  restoreDefaultTimetable: () => void;
  updateTimetableEvent: (event: AshadeepExamEvent) => void;
  addCustomTimetableEvent: (event: AshadeepExamEvent) => void;
  deleteTimetableEvent: (id: string) => void;
  clearGoogleCalendarEvents: () => Promise<boolean>;

  // Google Operations
  loginWithGoogle: () => Promise<void>;
  syncToCloud: () => Promise<boolean>;
  restoreFromCloud: () => Promise<boolean>;
  scheduleCalendarEvent: (eventData: CalendarEventRequest) => Promise<{ id: string; htmlLink: string }>;

  // Device Controls
  toggleWakeLock: (enable: boolean) => Promise<boolean>;
}

const applyThemeToDocument = (mode: ThemeMode) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      testSettings: DEFAULT_SETTINGS,
      lastSettings: DEFAULT_SETTINGS,
      sessions: [],
      unfinishedSession: null,
      user: null,
      googleClientId: DEFAULT_CLIENT_ID,
      syncState: 'idle',
      lastSyncedAt: null,
      syncError: null,
      wakeLockActive: false,
      pwaInstallPrompt: null,
      isPwaInstalled: false,
      themeMode: 'system',
      activeTab: 'home',

      schoolProfile: {
        schoolType: 'guest',
        schoolName: 'Guest Student',
        stream: 'JEE',
        isVerified: true,
      },
      customTimetable: [],
      showSchoolModal: false,

      flashcards: INITIAL_AUTO_FLASHCARDS,
      historySnapshots: [],
      pendingDeepLink: null,
      showDeepLinkModal: false,
      showVersionModal: false,
      showTeacherReportModal: false,
      showAIPlannerModal: false,
      examScores: [],

      setTestSettings: (settings) => set({ testSettings: settings, lastSettings: settings }),
      setLastSettings: (settings) => set({ lastSettings: settings, testSettings: settings }),

      setUnfinishedSession: (session) => set({ unfinishedSession: session }),
      clearUnfinishedSession: () => set({ unfinishedSession: null }),

      addSession: (result) => {
        const nextSessions = [result, ...get().sessions.filter((s) => s.id !== result.id)];
        set({ sessions: nextSessions, unfinishedSession: null });
        if (get().user?.accessToken) {
          get().syncToCloud().catch(console.warn);
        }
      },

      saveSession: (result) => {
        const nextSessions = [result, ...get().sessions.filter((s) => s.id !== result.id)];
        set({ sessions: nextSessions, unfinishedSession: null });
        if (get().user?.accessToken) {
          get().syncToCloud().catch(console.warn);
        }
      },

      deleteSession: (id) => {
        const nextSessions = get().sessions.filter((s) => s.id !== id);
        set({ sessions: nextSessions });
        if (get().user?.accessToken) {
          get().syncToCloud().catch(console.warn);
        }
      },

      clearSessions: () => {
        set({ sessions: [] });
        if (get().user?.accessToken) {
          get().syncToCloud().catch(console.warn);
        }
      },

      setUser: (user) => set({ user }),

      signOut: () =>
        set({
          user: null,
          syncState: 'idle',
          syncError: null,
        }),

      setGoogleClientId: (clientId) => set({ googleClientId: clientId }),

      setPwaInstallPrompt: (prompt) => set({ pwaInstallPrompt: prompt }),

      setIsPwaInstalled: (installed) => set({ isPwaInstalled: installed }),

      setThemeMode: (mode) => {
        set({ themeMode: mode });
        applyThemeToDocument(mode);
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      initStoreListeners: () => {
        applyThemeToDocument(get().themeMode);

        // System theme listener
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleThemeChange = () => {
            if (get().themeMode === 'system') {
              applyThemeToDocument('system');
            }
          };

          try {
            mediaQuery.addEventListener('change', handleThemeChange);
          } catch (e) {
            mediaQuery.addListener(handleThemeChange);
          }
        }
      },

      loginWithGoogle: async () => {
        set({ syncState: 'syncing', syncError: null });
        try {
          const clientId = get().googleClientId;
          const userProfile = await authenticateGoogleUser(clientId);
          set({ user: userProfile, syncState: 'synced', syncError: null });

          if (userProfile.accessToken) {
            await get().restoreFromCloud();
          }
        } catch (err: any) {
          console.error('Google Sign-In Error:', err);
          set({
            syncState: 'error',
            syncError: err.message || 'Google Sign-In failed. Please check Client ID or try again.',
          });
          throw err;
        }
      },

      syncToCloud: async () => {
        const user = get().user;
        if (!user || !user.accessToken) {
          set({ syncError: 'Sign in with Google to backup data to your Google account' });
          return false;
        }

        set({ syncState: 'syncing', syncError: null });
        try {
          const payload = {
            version: 1,
            updatedAt: new Date().toISOString(),
            userEmail: user.email,
            settings: get().testSettings,
            sessions: get().sessions,
          };

          await saveToGoogleDrive(user.accessToken, payload);
          set({
            syncState: 'synced',
            lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            syncError: null,
          });
          return true;
        } catch (err: any) {
          console.error('Drive Backup Error:', err);
          const isExpired = err?.message?.includes('401') || err?.message?.includes('expired');
          if (isExpired && user) {
            set({
              user: { ...user, accessToken: undefined },
              syncState: 'error',
              syncError: 'Google authentication session expired. Please sign in again to re-connect.',
            });
          } else {
            set({
              syncState: 'error',
              syncError: err.message || 'Failed to sync to Google Drive.',
            });
          }
          return false;
        }
      },

      restoreFromCloud: async () => {
        const user = get().user;
        if (!user || !user.accessToken) {
          set({ syncError: 'Sign in with Google to restore backup' });
          return false;
        }

        set({ syncState: 'syncing', syncError: null });
        try {
          const backup = await loadFromGoogleDrive(user.accessToken);
          if (backup) {
            if (backup.settings) {
              set({ testSettings: backup.settings, lastSettings: backup.settings });
            }
            if (Array.isArray(backup.sessions)) {
              set({ sessions: backup.sessions });
            }
            set({
              syncState: 'synced',
              lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              syncError: null,
            });
            return true;
          } else {
            set({
              syncState: 'synced',
              lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            return false;
          }
        } catch (err: any) {
          console.error('Drive Restore Error:', err);
          const isExpired = err?.message?.includes('401') || err?.message?.includes('expired');
          if (isExpired && user) {
            set({
              user: { ...user, accessToken: undefined },
              syncState: 'error',
              syncError: 'Google authentication session expired. Please sign in again to re-connect.',
            });
          } else {
            set({
              syncState: 'error',
              syncError: err.message || 'Failed to restore from Google Drive.',
            });
          }
          return false;
        }
      },

      scheduleCalendarEvent: async (eventData) => {
        const user = get().user;
        if (!user || !user.accessToken) {
          throw new Error('Please sign in with Google to add reminders to your Google Calendar.');
        }
        return await createGoogleCalendarEvent(user.accessToken, eventData);
      },

      setSchoolProfile: (profile) => {
        set({ schoolProfile: profile });
        if (profile.schoolType === 'ashadeep' && profile.isVerified) {
          set({ customTimetable: getOriginalAshadeepTimetable() });
        } else {
          set({ customTimetable: [] });
        }
      },
      setShowSchoolModal: (show) => set({ showSchoolModal: show }),

      restoreDefaultTimetable: () => {
        const { schoolProfile } = get();
        if (schoolProfile?.schoolType === 'ashadeep' && schoolProfile?.isVerified) {
          set({ customTimetable: getOriginalAshadeepTimetable() });
        } else {
          set({ customTimetable: [] });
        }
      },

      updateTimetableEvent: (updated) => {
        const list = get().customTimetable.map((item) =>
          item.id === updated.id ? { ...updated, isCustomized: true } : item
        );
        set({ customTimetable: list });
      },

      addCustomTimetableEvent: (event) => {
        set({ customTimetable: [event, ...get().customTimetable] });
      },

      deleteTimetableEvent: (id) => {
        set({ customTimetable: get().customTimetable.filter((item) => item.id !== id) });
      },

      clearGoogleCalendarEvents: async () => {
        // Reset calendar event IDs on local timetable
        const resetList = get().customTimetable.map((ev) => ({
          ...ev,
          calendarEventId: undefined,
        }));
        set({ customTimetable: resetList });
        return true;
      },

      toggleWakeLock: async (enable) => {
        if (enable) {
          const success = await requestWakeLock();
          set({ wakeLockActive: success });
          return success;
        } else {
          await releaseWakeLock();
          set({ wakeLockActive: false });
          return true;
        }
      },

      // Flashcards Actions
      addFlashcard: (card) => {
        const next = [card, ...get().flashcards.filter((f) => f.id !== card.id)];
        set({ flashcards: next });
      },

      toggleFlashcardLearned: (id) => {
        const next = get().flashcards.map((f) =>
          f.id === id ? { ...f, isLearned: !f.isLearned } : f
        );
        set({ flashcards: next });
      },

      deleteFlashcard: (id) => {
        const next = get().flashcards.filter((f) => f.id !== id);
        set({ flashcards: next });
      },

      setFlashcards: (cards) => set({ flashcards: cards }),

      // History Versioning & Snapshot Actions
      createHistorySnapshot: (reason, label) => {
        const snapshotId = `snap-${Date.now()}`;
        const newSnapshot: HistorySnapshot = {
          id: snapshotId,
          timestamp: new Date().toISOString(),
          label: label || `Snapshot ${new Date().toLocaleTimeString()}`,
          reason,
          sessionCount: get().sessions.length,
          timetableCount: get().customTimetable.length,
          flashcardCount: get().flashcards.length,
          data: {
            sessions: JSON.parse(JSON.stringify(get().sessions)),
            customTimetable: JSON.parse(JSON.stringify(get().customTimetable)),
            flashcards: JSON.parse(JSON.stringify(get().flashcards)),
            testSettings: JSON.parse(JSON.stringify(get().testSettings)),
            schoolProfile: get().schoolProfile ? JSON.parse(JSON.stringify(get().schoolProfile)) : null,
          },
        };

        const existingSnapshots = get().historySnapshots || [];
        const updatedSnapshots = [newSnapshot, ...existingSnapshots].slice(0, 10); // Keep 10 latest
        set({ historySnapshots: updatedSnapshots });
        return snapshotId;
      },

      restoreHistorySnapshot: (snapshotId) => {
        const target = get().historySnapshots.find((s) => s.id === snapshotId);
        if (!target) return false;

        // Take automatic safety backup before restoring past version
        get().createHistorySnapshot('auto_snapshot', `Pre-restore Backup before loading ${target.label}`);

        set({
          sessions: target.data.sessions || [],
          customTimetable: target.data.customTimetable || [],
          flashcards: target.data.flashcards || INITIAL_AUTO_FLASHCARDS,
          testSettings: target.data.testSettings || DEFAULT_SETTINGS,
          schoolProfile: target.data.schoolProfile || get().schoolProfile,
        });
        return true;
      },

      deleteHistorySnapshot: (snapshotId) => {
        set({
          historySnapshots: get().historySnapshots.filter((s) => s.id !== snapshotId),
        });
      },

      // Deep Link Actions
      setPendingDeepLink: (payload) => set({ pendingDeepLink: payload }),
      setShowDeepLinkModal: (show) => set({ showDeepLinkModal: show }),
      setShowVersionModal: (show) => set({ showVersionModal: show }),
      setShowTeacherReportModal: (show) => set({ showTeacherReportModal: show }),

      applyDeepLinkPayload: (payload) => {
        // Create safety backup
        get().createHistorySnapshot('pre_import_backup', `Pre-import backup (${payload.title || payload.type})`);

        if (payload.type === 'practice' && payload.practiceSettings) {
          const mergedSettings: TestSettings = {
            ...get().testSettings,
            ...payload.practiceSettings,
          };
          set({ testSettings: mergedSettings, activeTab: 'practice' });
        }

        if (payload.scheduleEvents && payload.scheduleEvents.length > 0) {
          const currentEvents = get().customTimetable;
          const mergedEvents = [...payload.scheduleEvents, ...currentEvents];
          // deduplicate by id/code
          const uniqueEventsMap = new Map<string, AshadeepExamEvent>();
          mergedEvents.forEach((ev) => uniqueEventsMap.set(ev.id || ev.code, ev));
          set({ customTimetable: Array.from(uniqueEventsMap.values()) });
        }

        if (payload.flashcards && payload.flashcards.length > 0) {
          const currentCards = get().flashcards;
          const mergedCards = [...payload.flashcards, ...currentCards];
          const uniqueCardsMap = new Map<string, FlashcardItem>();
          mergedCards.forEach((card) => uniqueCardsMap.set(card.id, card));
          set({ flashcards: Array.from(uniqueCardsMap.values()) });
        }

        set({ pendingDeepLink: null, showDeepLinkModal: false });
      },

      setShowAIPlannerModal: (show) => set({ showAIPlannerModal: show }),

      addExamScore: (record) => {
        const updated = [record, ...get().examScores.filter((e) => e.id !== record.id)];
        set({ examScores: updated });
      },

      deleteExamScore: (id) => {
        set({ examScores: get().examScores.filter((e) => e.id !== id) });
      },

      importAIPlannerPayload: (payload) => {
        // Create safety backup
        get().createHistorySnapshot(
          'pre_import_backup',
          `AI Planner JSON Import (${payload.title || 'All-In-One AI Package'})`
        );

        if (payload.schoolProfile) {
          const updatedProfile = {
            ...get().schoolProfile,
            ...payload.schoolProfile,
          } as SchoolProfile;
          set({ schoolProfile: updatedProfile });
        }

        if (payload.customTimetable && payload.customTimetable.length > 0) {
          const currentEvents = get().customTimetable;
          const mergedEvents = [...payload.customTimetable, ...currentEvents];
          const uniqueEventsMap = new Map<string, AshadeepExamEvent>();
          mergedEvents.forEach((ev) => uniqueEventsMap.set(ev.id || ev.code, ev));
          set({ customTimetable: Array.from(uniqueEventsMap.values()) });
        }

        if (payload.flashcards && payload.flashcards.length > 0) {
          const currentCards = get().flashcards;
          const mergedCards = [...payload.flashcards, ...currentCards];
          const uniqueCardsMap = new Map<string, FlashcardItem>();
          mergedCards.forEach((card) => uniqueCardsMap.set(card.id, card));
          set({ flashcards: Array.from(uniqueCardsMap.values()) });
        }

        if (payload.examScores && payload.examScores.length > 0) {
          const currentScores = get().examScores;
          const mergedScores = [...payload.examScores, ...currentScores];
          const uniqueScoresMap = new Map<string, ExamScoreRecord>();
          mergedScores.forEach((s) => uniqueScoresMap.set(s.id || `${s.examCode}-${s.subject}`, s));
          set({ examScores: Array.from(uniqueScoresMap.values()) });
        }

        if (payload.presetPracticeSession) {
          const mergedSettings: TestSettings = {
            ...get().testSettings,
            ...payload.presetPracticeSession,
          };
          set({ testSettings: mergedSettings });
        }

        set({ showAIPlannerModal: false });
      },
    }),
    {
      name: 'qtick_store_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        testSettings: state.testSettings,
        lastSettings: state.lastSettings,
        sessions: state.sessions,
        unfinishedSession: state.unfinishedSession,
        user: state.user,
        googleClientId: state.googleClientId,
        lastSyncedAt: state.lastSyncedAt,
        themeMode: state.themeMode,
        schoolProfile: state.schoolProfile,
        customTimetable: state.customTimetable,
        flashcards: state.flashcards,
        historySnapshots: state.historySnapshots,
        examScores: state.examScores,
      }),
    }
  )
);
