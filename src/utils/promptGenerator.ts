import {
  TestSessionResult,
  AshadeepExamEvent,
  FlashcardItem,
  SchoolProfile,
  DeepLinkPayload,
  StudentShareReport,
  TestSettings,
} from '../types';

/**
 * Helper to compress JSON or encode object into URL safe base64
 */
export function encodePayloadToBase64<T>(data: T): string {
  try {
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  } catch (err) {
    console.error('Failed to encode payload:', err);
    return '';
  }
}

/**
 * Helper to decode base64 back into JSON object
 */
export function decodePayloadFromBase64<T>(base64Str: string): T | null {
  try {
    const jsonStr = decodeURIComponent(atob(base64Str));
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.error('Failed to decode payload:', err);
    return null;
  }
}

/**
 * Generates a comprehensive dynamic AI prompt containing 1-month surrounding schedule,
 * student MCQ performance analytics, subject weaknesses, and instructions for external LLMs
 * to generate advice, flashcards, and QTickX deep links.
 */
export function generateDynamicStudentPrompt(
  sessions: TestSessionResult[],
  customTimetable: AshadeepExamEvent[],
  flashcards: FlashcardItem[],
  schoolProfile: SchoolProfile | null
): string {
  const currentDateIso = new Date().toISOString().split('T')[0];
  const today = new Date();

  // 1. Calculate 1-Month Window Schedule (15 days past to 30 days future)
  const pastWindow = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
  const futureWindow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const oneMonthSchedule = customTimetable.filter((ev) => {
    if (!ev.date) return false;
    const evDate = new Date(ev.date);
    return evDate >= pastWindow && evDate <= futureWindow;
  });

  // Sort chronologically
  oneMonthSchedule.sort((a, b) => (a.date > b.date ? 1 : -1));

  // 2. Aggregate Analytics
  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce(
    (acc, s) => acc + (s.settings.totalQuestions || 0),
    0
  );
  const totalCorrect = sessions.reduce((acc, s) => acc + (s.totalCorrect || 0), 0);
  const totalTimeSpentSec = sessions.reduce((acc, s) => acc + (s.totalTimeSpent || 0), 0);
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgTimePerQ =
    totalQuestions > 0 ? Math.round(totalTimeSpentSec / totalQuestions) : 0;

  const totalOverCaution = sessions.reduce((acc, s) => acc + (s.overCautionCount || 0), 0);

  // Subject breakdown
  const subjectStats: Record<
    string,
    { attempted: number; correct: number; totalTime: number }
  > = {};

  sessions.forEach((s) => {
    const subj = s.settings.subject || 'General';
    if (!subjectStats[subj]) {
      subjectStats[subj] = { attempted: 0, correct: 0, totalTime: 0 };
    }
    subjectStats[subj].attempted += s.settings.totalQuestions || 0;
    subjectStats[subj].correct += s.totalCorrect || 0;
    subjectStats[subj].totalTime += s.totalTimeSpent || 0;
  });

  const subjectSummaryLines = Object.entries(subjectStats)
    .map(([subj, stat]) => {
      const acc = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
      const avgT = stat.attempted > 0 ? Math.round(stat.totalTime / stat.attempted) : 0;
      return `- **${subj}**: ${stat.attempted} Qs solved | Accuracy: ${acc}% | Avg Time: ${avgT}s/question`;
    })
    .join('\n');

  // 3. Recent Sessions Summary (last 5)
  const recentSessionsList = sessions.slice(0, 5).map((s, idx) => {
    return `${idx + 1}. [${s.date.split('T')[0]}] ${s.settings.subject} (${s.settings.mode}) - ${s.settings.totalQuestions} Qs | Accuracy: ${s.accuracy}% | Score: ${s.totalScore}/${s.maxScore} | Avg Time: ${s.avgTimePerQuestion}s`;
  });

  // 4. One Month Schedule List
  const scheduleLines = oneMonthSchedule.map((ev) => {
    return `- [${ev.date}] **${ev.code}** (${ev.type} - ${ev.subject}): ${ev.syllabus}`;
  });

  // App Base Domain URL for Deep Link Guidance
  const appBaseUrl = window.location.origin + window.location.pathname;

  const promptText = `
SYSTEM ROLE & CONTEXT FOR AI ASSISTANT:
You are an elite competitive examination mentor specializing in JEE Main, JEE Advanced, and NEET entrance exams.
Below is the live student context, 1-month surrounding test schedule, and recent practice analytics exported from the QTickX MCQ Practice System.

---
### 🎓 STUDENT PROFILE
- **School / Institute**: ${schoolProfile?.schoolName || 'Ashadeep IIT & NEET Group'}
- **Target Exam Stream**: ${schoolProfile?.stream || 'JEE'}
- **Export Date**: ${currentDateIso}

---
### 📅 SURROUNDING 1-MONTH TEST & LECTURE SCHEDULE
The student has the following exam dates and syllabus coverage scheduled within a 1-month window:
${scheduleLines.length > 0 ? scheduleLines.join('\n') : '- No scheduled tests in the immediate 1-month window.'}

---
### 📊 MCQS PRACTICE ANALYTICS & SPEED METRICS
- **Total Practice Sessions**: ${totalSessions}
- **Total Questions Attempted**: ${totalQuestions} Qs
- **Overall Accuracy Rate**: ${overallAccuracy}%
- **Average Speed**: ${avgTimePerQ} seconds / question (Target: 180s)
- **Over-caution Questions (>3 minutes)**: ${totalOverCaution} questions
- **Subject-wise Performance Breakdown**:
${subjectSummaryLines || '- No subject breakdown data yet.'}

---
### 📝 RECENT PRACTICE TEST LOGS
${recentSessionsList.length > 0 ? recentSessionsList.join('\n') : '- No practice test history recorded yet.'}

---
### 🤖 MENTORSHIP INSTRUCTIONS FOR THE AI ASSISTANT:
1. **Analyze Performance Gaps**: Identify the student's weakest subject and speed bottlenecks based on the analytics above.
2. **Actionable Study Plan**: Formulate a high-impact, day-by-day revision schedule tailored to their upcoming exam dates listed in the schedule above.
3. **High-Yield Flashcards & Formulas**: Suggest 3-5 critical formulas or memory tips for their immediate upcoming syllabus topics.
4. **Generate QTickX Interactive Deep-Links**:
   When proposing a practice test or revision exercise, format a QTickX Deep-Link so the student can click it directly to launch the timer in QTickX!
   
   *Practice Deep-Link Format*:
   \`${appBaseUrl}?addPractice=1&subject=<Subject>&mode=Self+Practice&totalQuestions=15&targetTimePerQuestion=180\`
   
   *Flashcard Import Deep-Link Format*:
   \`${appBaseUrl}?importFlashcards=<Base64EncodedPayload>\`

Please provide a structured, encouraging, and highly specific mentorship response.
`.trim();

  return promptText;
}

/**
 * Creates a shareable URL containing a student performance report for teachers
 */
export function generateTeacherShareUrl(
  sessions: TestSessionResult[],
  customTimetable: AshadeepExamEvent[],
  schoolProfile: SchoolProfile | null,
  studentName = 'Student'
): string {
  const currentDateIso = new Date().toISOString().split('T')[0];

  const totalQuestionsSolved = sessions.reduce((acc, s) => acc + s.settings.totalQuestions, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.totalCorrect, 0);
  const avgAccuracy = totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0;
  const totalTimeSpentSec = sessions.reduce((acc, s) => acc + s.totalTimeSpent, 0);
  const avgTimePerQuestion = totalQuestionsSolved > 0 ? Math.round(totalTimeSpentSec / totalQuestionsSolved) : 0;

  const subjectStats: Record<string, { attempted: number; correct: number; accuracy: number; avgTime: number }> = {};
  sessions.forEach((s) => {
    const subj = s.settings.subject || 'General';
    if (!subjectStats[subj]) {
      subjectStats[subj] = { attempted: 0, correct: 0, accuracy: 0, avgTime: 0 };
    }
    subjectStats[subj].attempted += s.settings.totalQuestions;
    subjectStats[subj].correct += s.totalCorrect;
  });

  Object.keys(subjectStats).forEach((subj) => {
    const stat = subjectStats[subj];
    stat.accuracy = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
  });

  const report: StudentShareReport = {
    studentName,
    schoolName: schoolProfile?.schoolName || 'Ashadeep IIT Group',
    stream: schoolProfile?.stream || 'JEE',
    generatedDate: currentDateIso,
    totalSessions: sessions.length,
    totalQuestionsSolved,
    avgAccuracy,
    avgTimePerQuestion,
    subjectStats,
    upcomingExams: customTimetable.slice(0, 5),
    recentSessions: sessions.slice(0, 5),
  };

  const payload: DeepLinkPayload = {
    type: 'teacher_report',
    source: 'QTickX Student Export',
    createdDate: currentDateIso,
    title: `Academic Report - ${studentName}`,
    studentReport: report,
  };

  const encoded = encodePayloadToBase64(payload);
  const appBaseUrl = window.location.origin + window.location.pathname;
  return `${appBaseUrl}?shareReport=${encoded}`;
}

/**
 * Generates deep link for practice test creation
 */
export function generatePracticeDeepUrl(settings: Partial<TestSettings>): string {
  const params = new URLSearchParams();
  params.set('addPractice', '1');
  if (settings.subject) params.set('subject', settings.subject);
  if (settings.mode) params.set('mode', settings.mode);
  if (settings.totalQuestions) params.set('totalQuestions', String(settings.totalQuestions));
  if (settings.targetTimePerQuestion) params.set('targetTimePerQuestion', String(settings.targetTimePerQuestion));
  if (settings.exerciseNumber) params.set('exerciseNumber', settings.exerciseNumber);
  if (settings.chapterName) params.set('chapterName', settings.chapterName);

  const appBaseUrl = window.location.origin + window.location.pathname;
  return `${appBaseUrl}?${params.toString()}`;
}

/**
 * Parses deep links from location search or raw query string
 */
export function parseDeepLinkFromUrl(queryString: string): DeepLinkPayload | null {
  try {
    const searchParams = new URLSearchParams(queryString);

    // 1. Practice Deep Link
    if (searchParams.has('addPractice')) {
      const subject = searchParams.get('subject') || 'Physics';
      const mode = searchParams.get('mode') || 'Self Practice';
      const totalQuestions = parseInt(searchParams.get('totalQuestions') || '30', 10);
      const targetTimePerQuestion = parseInt(searchParams.get('targetTimePerQuestion') || '180', 10);
      const exerciseNumber = searchParams.get('exerciseNumber') || '';
      const chapterName = searchParams.get('chapterName') || '';

      return {
        type: 'practice',
        title: `Practice Test: ${subject} (${chapterName || mode})`,
        description: `Pre-configured test with ${totalQuestions} questions and ${Math.round(targetTimePerQuestion / 60)} min target time per question.`,
        practiceSettings: {
          subject,
          mode,
          totalQuestions,
          targetTimePerQuestion,
          cautionThreshold: targetTimePerQuestion,
          urgentThreshold: targetTimePerQuestion * 3,
          exerciseNumber,
          chapterName,
          answerKey: Array.from({ length: totalQuestions }, (_, i) => ({ q: i + 1, ans: '' })),
        },
      };
    }

    // 2. Share Report Deep Link
    if (searchParams.has('shareReport')) {
      const raw = searchParams.get('shareReport');
      if (raw) {
        const decoded = decodePayloadFromBase64<DeepLinkPayload>(raw);
        if (decoded && decoded.type === 'teacher_report') {
          return decoded;
        }
      }
    }

    // 3. Import Schedule Deep Link
    if (searchParams.has('importSchedule')) {
      const raw = searchParams.get('importSchedule');
      if (raw) {
        const decoded = decodePayloadFromBase64<DeepLinkPayload>(raw);
        if (decoded && decoded.scheduleEvents) {
          return decoded;
        }
      }
    }

    // 4. Import Flashcards Deep Link
    if (searchParams.has('importFlashcards')) {
      const raw = searchParams.get('importFlashcards');
      if (raw) {
        const decoded = decodePayloadFromBase64<DeepLinkPayload>(raw);
        if (decoded && decoded.flashcards) {
          return decoded;
        }
      }
    }

    // 5. Full Snapshot Deep Link
    if (searchParams.has('importSnapshot')) {
      const raw = searchParams.get('importSnapshot');
      if (raw) {
        return decodePayloadFromBase64<DeepLinkPayload>(raw);
      }
    }
  } catch (err) {
    console.error('Error parsing deep link:', err);
  }

  return null;
}
