import { TestSessionResult, TestSettings } from '../types';

const STORAGE_KEY_SESSIONS = 'jee_neet_timer_sessions_v1';
const STORAGE_KEY_SETTINGS = 'jee_neet_timer_last_settings_v1';

export function saveTestSession(result: TestSessionResult): void {
  try {
    const existing = getTestSessions();
    const updated = [result, ...existing].slice(0, 100); // Keep last 100 tests
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save test session to localStorage:', e);
  }
}

export function getTestSessions(): TestSessionResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Failed to load test sessions:', e);
    return [];
  }
}

export function clearTestSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
  } catch (e) {}
}

export function saveLastSettings(settings: Partial<TestSettings>): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

export function getLastSettings(): Partial<TestSettings> | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}
