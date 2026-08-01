export type Subject = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | string;

export type PracticeMode =
  | 'Exercise'
  | 'Self Practice'
  | 'PYQ'
  | 'Mock Test'
  | 'Custom'
  | string;

export type PracticeLevel = 'Level 1' | 'Level 2' | 'Level 3';

export type ThemeMode = 'system' | 'light' | 'dark';

export type NavTab = 'home' | 'practice' | 'history' | 'insights' | 'planner' | 'flashcards' | 'settings';

export interface QuestionAnswerKey {
  q: number;
  ans: string;
}

export type QuestionStatus = 'unvisited' | 'answered' | 'marked' | 'marked_answered';

export interface QuestionAttemptState {
  q: number;
  selectedAns: string | null;
  timeSpent: number; // in seconds
  status: QuestionStatus;
  cautionTriggered: boolean; // > caution threshold (e.g. 180s = 3m)
  urgentTriggered: boolean; // > urgent threshold (e.g. 600s = 10m)
}

export interface TestSettings {
  subject: Subject;
  mode: PracticeMode;
  level?: PracticeLevel;
  exerciseNumber?: string;
  customTag?: string;
  chapterName?: string;
  description?: string;
  totalQuestions: number;
  targetTimePerQuestion: number; // in seconds (e.g. 180s = 3m)
  cautionThreshold: number; // in seconds (e.g. 180s = 3m)
  urgentThreshold: number; // in seconds (e.g. 600s = 10m)
  soundEnabled: boolean;
  ambientSound: 'none' | 'zen_pad' | 'ticking' | 'brown_noise' | 'rain';
  volume: number; // 0.0 to 1.0
  answerKey: QuestionAnswerKey[];
  enableNegativeMarking: boolean; // JEE (+4 / -1) vs NEET (+4 / -1)
  feedbackMode?: 'test' | 'practice'; // 'test' = scorecard at end, 'practice' = instant answer highlight & web solution search
  hapticsEnabled?: boolean;
  notificationsEnabled?: boolean;
}

export interface TestSessionResult {
  id: string;
  date: string; // ISO string
  settings: TestSettings;
  attempts: Record<number, QuestionAttemptState>;
  totalTimeSpent: number;
  accuracy: number; // 0 to 100
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  totalScore: number;
  maxScore: number;
  avgTimePerQuestion: number;
  overCautionCount: number; // >3m questions
  overUrgentCount: number; // >10m questions
}

export interface UnfinishedSession {
  settings: TestSettings;
  attempts: Record<number, QuestionAttemptState>;
  currentQ: number;
  totalSessionTime: number;
  updatedAt: string;
}

export interface GoogleUserProfile {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
  tokenExpiresAt?: number;
}

export interface SchoolProfile {
  schoolType: 'ashadeep' | 'custom' | 'guest';
  schoolName: string;
  stream?: 'JEE' | 'NEET';
  isVerified?: boolean;
}

export interface AshadeepExamEvent {
  id: string;
  code: string; // e.g. JMWT-01, JMKOTA-01, JMUT-01, AITS-01, FST-01
  type: 'Weekly Test' | 'Kota Test' | 'Unit Test / RRT' | 'AITS' | 'Full Test' | 'Lecture';
  subject: 'Maths' | 'Physics' | 'Chemistry' | 'Biology' | 'CPM' | 'Computer' | 'English' | string;
  syllabus: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // e.g. "09:00"
  endTime?: string; // e.g. "12:00"
  calendarEventId?: string; // ID if synced to Google Calendar
  isCustomized?: boolean;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

export interface CalendarEventRequest {
  title: string;
  description: string;
  startIso: string;
  endIso: string;
  reminderMinutes?: number;
  emailReminderMinutes?: number;
}

export interface FlashcardItem {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | string;
  topic: string;
  front: string; // Question / Formula Title
  back: string; // Formula Details / Explanation / Solution
  type: 'formula' | 'concept' | 'shortcut';
  examTag?: string; // e.g. JMWT-01 or Rotational Motion
  isLearned?: boolean;
  createdAt: string;
}

export interface HistorySnapshot {
  id: string;
  timestamp: string;
  label: string;
  reason: 'manual_backup' | 'pre_import_backup' | 'auto_snapshot';
  sessionCount: number;
  timetableCount: number;
  flashcardCount: number;
  data: {
    sessions: TestSessionResult[];
    customTimetable: AshadeepExamEvent[];
    flashcards: FlashcardItem[];
    testSettings: TestSettings;
    schoolProfile: SchoolProfile | null;
  };
}

export interface DeepLinkPayload {
  type: 'practice' | 'schedule' | 'flashcards' | 'full_snapshot' | 'teacher_report';
  source?: string; // e.g. "Gemini AI" or "Teacher"
  createdDate?: string;
  title?: string;
  description?: string;
  practiceSettings?: Partial<TestSettings>;
  scheduleEvents?: AshadeepExamEvent[];
  flashcards?: FlashcardItem[];
  studentReport?: StudentShareReport;
}

export interface StudentShareReport {
  studentName: string;
  schoolName: string;
  stream: string;
  generatedDate: string;
  totalSessions: number;
  totalQuestionsSolved: number;
  avgAccuracy: number;
  avgTimePerQuestion: number;
  subjectStats: Record<string, { attempted: number; correct: number; accuracy: number; avgTime: number }>;
  upcomingExams: AshadeepExamEvent[];
  recentSessions: TestSessionResult[];
}
