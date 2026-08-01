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
} from '../types';
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

  // Actions
  setTestSettings: (settings: TestSettings) => void;
  setLastSettings: (settings: TestSettings) => void;
  setUnfinishedSession: (session: UnfinishedSession | null) => void;
  clearUnfinishedSession: () => void;
  addSession: (result: TestSessionResult) => void;
  saveSession: (result: TestSessionResult) => void;
  clearSessions: () => void;
  setUser: (user: GoogleUserProfile | null) => void;
  signOut: () => void;
  setGoogleClientId: (clientId: string) => void;
  setPwaInstallPrompt: (prompt: any) => void;
  setIsPwaInstalled: (installed: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setActiveTab: (tab: NavTab) => void;
  initStoreListeners: () => void;

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
      }),
    }
  )
);
