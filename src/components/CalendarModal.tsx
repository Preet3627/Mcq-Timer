import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Layers,
  FileCode,
  Zap,
  BookOpen,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

export interface ParsedScheduleEvent {
  title: string;
  examType?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
  reminderMinutes?: number;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = 'Physics',
}) => {
  const { user, scheduleCalendarEvent, loginWithGoogle } = useAppStore();

  const [activeTab, setActiveTab] = useState<'single' | 'ai_prompt' | 'ai_paste'>('single');

  // Single event form state
  const [title, setTitle] = useState(`JEE Practice Test: ${defaultSubject}`);
  const [examType, setExamType] = useState<string>('Kota Test');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(90); // minutes
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [enableEmailAlarm, setEnableEmailAlarm] = useState(true);
  const [notes, setNotes] = useState('Solve PYQ & revision test under timed conditions with Quantum Timer.');

  // AI Prompt Helper state
  const [selectedPreset, setSelectedPreset] = useState<'kota' | 'rrt_sa' | 'school' | 'oneweek' | 'custom'>('kota');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // AI Paste state
  const [pastedJson, setPastedJson] = useState('');
  const [parsedEvents, setParsedEvents] = useState<ParsedScheduleEvent[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Submit / Batch status
  const [loading, setLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [batchSuccessCount, setBatchSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Prompts for different schedule presets
  const getPromptForPreset = (preset: 'kota' | 'rrt_sa' | 'school' | 'oneweek' | 'custom') => {
    const dateToday = new Date().toISOString().split('T')[0];

    if (preset === 'kota') {
      return `Act as an expert JEE/NEET Exam Scheduler. I need a schedule for Kota Test Series (Part Tests, Cumulative Tests, and Full Syllabus Mock Tests).

Create a schedule starting from ${dateToday}. Output ONLY a raw JSON array matching this strict schema:

[
  {
    "title": "Kota Test Series - Part Test 1 (Physics & Chem)",
    "examType": "Kota Test",
    "date": "${dateToday}",
    "startTime": "09:00",
    "endTime": "12:00",
    "notes": "Units & Dimensions, Kinematics, Mole Concept, Periodic Table",
    "reminderMinutes": 15
  },
  {
    "title": "Kota Test Series - Part Test 2 (Maths & Bio)",
    "examType": "Kota Test",
    "date": "${dateToday}",
    "startTime": "14:00",
    "endTime": "17:00",
    "notes": "Sets, Relations, Functions, Cell Biology",
    "reminderMinutes": 15
  }
]

Include 4-6 test events across upcoming dates. Do NOT include any markdown formatted commentary, only the valid JSON array.`;
    }

    if (preset === 'rrt_sa') {
      return `Act as an academic coordinator. I need a complete schedule for RRT (Recent Revision Test), SA1 (Summative Assessment 1), SA2 (Summative Assessment 2), and Weekly Tests.

Create a schedule starting from ${dateToday}. Output ONLY a raw JSON array:

[
  {
    "title": "RRT 1: Physics Mechanics & Rotational Motion",
    "examType": "RRT",
    "date": "${dateToday}",
    "startTime": "08:00",
    "endTime": "10:00",
    "notes": "Revision test for Newton laws and angular momentum",
    "reminderMinutes": 15
  },
  {
    "title": "SA1: Chemistry Mid-Term Exam",
    "examType": "SA1",
    "date": "${dateToday}",
    "startTime": "10:30",
    "endTime": "13:30",
    "notes": "Summative Assessment 1 full inorganic & physical chemistry",
    "reminderMinutes": 30
  },
  {
    "title": "SA2: Final Comprehensive Mock Exam",
    "examType": "SA2",
    "date": "${dateToday}",
    "startTime": "09:00",
    "endTime": "12:00",
    "notes": "Summative Assessment 2 full syllabus",
    "reminderMinutes": 30
  },
  {
    "title": "Weekly Chapter Test: Calculus",
    "examType": "Weekly Test",
    "date": "${dateToday}",
    "startTime": "16:00",
    "endTime": "17:30",
    "notes": "Integration & Differential Equations",
    "reminderMinutes": 15
  }
]

Output ONLY a raw JSON array, without conversational text or surrounding markdown codeblocks if possible.`;
    }

    if (preset === 'school') {
      return `Act as a school timetable assistant. Create a weekly school lecture schedule (Physics, Chemistry, Mathematics, Biology, English) for Mon-Fri starting from ${dateToday}.

Output ONLY a raw JSON array:

[
  {
    "title": "School Lecture: Physics (Optics & Waves)",
    "examType": "School Lecture",
    "date": "${dateToday}",
    "startTime": "08:00",
    "endTime": "09:00",
    "notes": "Bring Physics NCERT Textbook Vol 2",
    "reminderMinutes": 10
  },
  {
    "title": "School Lecture: Organic Chemistry",
    "examType": "School Lecture",
    "date": "${dateToday}",
    "startTime": "09:15",
    "endTime": "10:15",
    "notes": "Reaction Mechanisms & Aldehydes",
    "reminderMinutes": 10
  }
]

Generate 6-10 daily lecture events. Output ONLY a valid JSON array.`;
    }

    if (preset === 'oneweek') {
      return `Act as a study marathon planner. Create a 7-day continuous exam and revision schedule starting from ${dateToday}.

Output ONLY a raw JSON array:

[
  {
    "title": "Day 1: Physics Full Mock Test (3 Hrs)",
    "examType": "Kota Test",
    "date": "${dateToday}",
    "startTime": "09:00",
    "endTime": "12:00",
    "notes": "Full syllabus mock test 1",
    "reminderMinutes": 15
  }
]

Generate 7 consecutive daily exam slots. Output strictly valid JSON.`;
    }

    return `Create a schedule of study sessions or exams. Return strictly a JSON array formatted as:
[
  {
    "title": "Event Name",
    "examType": "Kota Test / RRT / SA1 / SA2 / Weekly Test / School Lecture",
    "date": "YYYY-MM-DD",
    "startTime": "HH:mm",
    "endTime": "HH:mm",
    "notes": "Description or syllabus",
    "reminderMinutes": 15
  }
]`;
  };

  const handleCopyPrompt = () => {
    const p = getPromptForPreset(selectedPreset);
    navigator.clipboard.writeText(p);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Parse pasted JSON
  const handleParsePastedJson = (text: string) => {
    setPastedJson(text);
    setJsonError(null);
    if (!text.trim()) {
      setParsedEvents([]);
      return;
    }

    try {
      // Remove codeblock ticks if user copied ```json ... ```
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) {
        setJsonError('JSON must be an array of event objects e.g. [{ "title": "..." }]');
        setParsedEvents([]);
        return;
      }

      const validEvents: ParsedScheduleEvent[] = parsed.map((item: any, idx: number) => ({
        title: item.title || item.name || `Event ${idx + 1}`,
        examType: item.examType || item.type || 'Exam',
        date: item.date || new Date().toISOString().split('T')[0],
        startTime: item.startTime || item.time || '10:00',
        endTime: item.endTime || '11:30',
        notes: item.notes || item.description || '',
        reminderMinutes: item.reminderMinutes || 15
      }));

      setParsedEvents(validEvents);
    } catch (err: any) {
      setJsonError(`Invalid JSON format: ${err.message}`);
      setParsedEvents([]);
    }
  };

  // Submit Single Event
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.accessToken) {
      setError('Please sign in with your Google account first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessLink(null);

    try {
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      const fullTitle = examType ? `[${examType}] ${title}` : title;

      const result = await scheduleCalendarEvent({
        title: fullTitle,
        description: `${notes}\n\nExam Type: ${examType}\nScheduled via QTick Quantum MCQ Timer.`,
        startIso: startDateTime.toISOString(),
        endIso: endDateTime.toISOString(),
        reminderMinutes,
        emailReminderMinutes: enableEmailAlarm ? 30 : undefined
      });

      setSuccessLink(result.htmlLink);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule event in your Google Calendar.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Batch Events from Parsed JSON
  const handleBatchSchedule = async () => {
    if (!user || !user.accessToken) {
      setError('Please sign in with your Google account first.');
      return;
    }

    if (parsedEvents.length === 0) {
      setError('No valid events parsed from JSON to schedule.');
      return;
    }

    setLoading(true);
    setError(null);
    setBatchProgress({ current: 0, total: parsedEvents.length });

    let count = 0;
    let lastLink = null;

    try {
      for (let i = 0; i < parsedEvents.length; i++) {
        const ev = parsedEvents[i];
        setBatchProgress({ current: i + 1, total: parsedEvents.length });

        const startDateTime = new Date(`${ev.date}T${ev.startTime}:00`);
        let endDateTime = new Date(`${ev.date}T${ev.endTime}:00`);

        if (isNaN(endDateTime.getTime()) || endDateTime <= startDateTime) {
          endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
        }

        const fullTitle = ev.examType ? `[${ev.examType}] ${ev.title}` : ev.title;

        const res = await scheduleCalendarEvent({
          title: fullTitle,
          description: `${ev.notes || ''}\n\nExam/Lecture Type: ${ev.examType || 'Schedule'}\nScheduled via QTick Quantum MCQ Timer.`,
          startIso: startDateTime.toISOString(),
          endIso: endDateTime.toISOString(),
          reminderMinutes: ev.reminderMinutes || 15,
          emailReminderMinutes: 30
        });

        lastLink = res.htmlLink;
        count++;
      }

      setBatchSuccessCount(count);
      setSuccessLink(lastLink);
    } catch (err: any) {
      setError(`Batch schedule interrupted: ${err.message}`);
    } finally {
      setLoading(false);
      setBatchProgress(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black">Google Calendar Exam & Timetable Scheduler</h3>
                <p className="text-xs text-slate-400">
                  Adds practice sessions, Kota tests & lecture alarms directly to your Google Calendar
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'single'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Single Event / Test</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_prompt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ai_prompt'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get AI Schedule Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ai_paste'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Paste JSON Batch ({parsedEvents.length})</span>
            </button>
          </div>

          {/* Body content */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {!user ? (
              <div className="p-5 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl flex flex-col items-center text-center space-y-3">
                <Calendar className="w-10 h-10 text-cyan-400" />
                <div>
                  <h4 className="font-bold text-slate-200">Sign in with Google Account</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Connecting your account allows QTick to sync exams, Kota test series, and lecture timetable alarms straight into your personal Google Calendar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                    } catch (e) {}
                  }}
                  className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
                >
                  Sign in with Google
                </button>
              </div>
            ) : successLink ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-300">
                  {batchSuccessCount ? `${batchSuccessCount} Events Scheduled!` : 'Event Added to Calendar!'}
                </h4>
                <p className="text-xs text-slate-300">
                  {batchSuccessCount
                    ? `Successfully created ${batchSuccessCount} schedule entries with 15-min alarms in your Google Calendar.`
                    : 'Your practice session and alarm reminder have been saved to Google Calendar.'}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={successLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400"
                  >
                    <span>Open in Google Calendar</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessLink(null);
                      setBatchSuccessCount(null);
                      onClose();
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* TAB 1: Single Event Scheduler */}
                {activeTab === 'single' && (
                  <form onSubmit={handleSubmitSingle} className="space-y-4">
                    {/* Exam / Event Category Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Exam / Schedule Type
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Kota Test', 'RRT', 'SA1 / SA2', 'Weekly Test', 'School Lecture'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setExamType(type)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              examType === type
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Event Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="e.g. Mechanics Part Test / Electrostatics Review"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Duration
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value={45}>45 mins (Lecture)</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours (30 Qs)</option>
                          <option value={180}>3 hours (Kota Full Test)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Alarm Reminder
                        </label>
                        <select
                          value={reminderMinutes}
                          onChange={(e) => setReminderMinutes(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value={5}>5 mins before</option>
                          <option value={10}>10 mins before</option>
                          <option value={15}>15 mins before</option>
                          <option value={30}>30 mins before</option>
                          <option value={60}>1 hour before</option>
                          <option value={1440}>1 day before</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Alarm Options */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span>Also send email reminder (30 mins before)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableEmailAlarm}
                        onChange={(e) => setEnableEmailAlarm(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Syllabus / Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Chapter topics, revision notes..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:border-cyan-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20"
                      >
                        <Bell className="w-4 h-4" />
                        <span>{loading ? 'Adding Event...' : 'Schedule Event with Alarm'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: AI Prompt Generator */}
                {activeTab === 'ai_prompt' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-1">
                      <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Generate Exam & Timetable Schedule with AI</span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Choose a schedule type below, copy the prompt, and paste it to ChatGPT, Claude, or Gemini. The AI will generate a formatted JSON schedule that you can paste in QTick to batch sync to Google Calendar.
                      </p>
                    </div>

                    {/* Preset Choice Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'kota', label: 'Kota Test Series', icon: Trophy },
                        { id: 'rrt_sa', label: 'RRT / SA1 / SA2 Exam', icon: Layers },
                        { id: 'school', label: 'School Lectures', icon: BookOpen },
                        { id: 'oneweek', label: '1-Week Marathon', icon: Zap },
                        { id: 'custom', label: 'Custom Schedule', icon: Sparkles }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedPreset(item.id as any)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                              selectedPreset === item.id
                                ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0 text-purple-400" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Prompt Box */}
                    <div className="relative">
                      <textarea
                        readOnly
                        rows={7}
                        value={getPromptForPreset(selectedPreset)}
                        className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
                      >
                        {copiedPrompt ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Step 1: Copy prompt above → Step 2: Paste in ChatGPT → Step 3: Copy AI output JSON to next tab
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ai_paste')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <span>Next: Paste JSON</span>
                        <FileCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: Paste AI JSON & Batch Schedule */}
                {activeTab === 'ai_paste' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase">
                          Paste AI Generated Schedule JSON
                        </label>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {parsedEvents.length} events detected
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={pastedJson}
                        onChange={(e) => handleParsePastedJson(e.target.value)}
                        placeholder={`Paste JSON array e.g.:
[
  {
    "title": "Kota Test Series Part Test 1",
    "examType": "Kota Test",
    "date": "${new Date().toISOString().split('T')[0]}",
    "startTime": "09:00",
    "endTime": "12:00",
    "notes": "Mechanics & Mole Concept",
    "reminderMinutes": 15
  }
]`}
                        className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {jsonError && (
                      <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                        {jsonError}
                      </div>
                    )}

                    {/* Parsed Events Preview List */}
                    {parsedEvents.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                        <div className="text-xs font-bold text-slate-400 uppercase">Schedule Preview ({parsedEvents.length} Items)</div>
                        {parsedEvents.map((ev, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-mono">
                                  {ev.examType || 'Exam'}
                                </span>
                                <span>{ev.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                📅 {ev.date} • ⏰ {ev.startTime} - {ev.endTime}
                              </div>
                            </div>
                            <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              <span>{ev.reminderMinutes || 15}m alarm</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {batchProgress && (
                      <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-1.5">
                        <div className="flex justify-between text-xs text-cyan-300 font-bold">
                          <span>Scheduling to Google Calendar...</span>
                          <span>{batchProgress.current} / {batchProgress.total}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-300"
                            style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveTab('ai_prompt')}
                        className="text-xs text-purple-400 hover:underline font-bold"
                      >
                        ← Back to AI Prompt
                      </button>
                      <button
                        type="button"
                        onClick={handleBatchSchedule}
                        disabled={loading || parsedEvents.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <Bell className="w-4 h-4" />
                        <span>
                          {loading ? 'Scheduling...' : `Batch Sync ${parsedEvents.length} Events to Google Calendar`}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
