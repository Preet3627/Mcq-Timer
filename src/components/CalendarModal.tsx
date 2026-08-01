import React, { useState } from 'react';
import { Calendar, Clock, Bell, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = 'Physics',
}) => {
  const { user, scheduleCalendarEvent, loginWithGoogle } = useAppStore();

  const [title, setTitle] = useState(`JEE Practice Test: ${defaultSubject}`);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(90); // minutes
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [notes, setNotes] = useState('Solve 30 PYQ Level 2 questions under timed conditions with Quantum Timer.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

      const result = await scheduleCalendarEvent({
        title,
        description: `${notes}\n\nScheduled via Quantum MCQ Timer App.`,
        startIso: startDateTime.toISOString(),
        endIso: endDateTime.toISOString(),
        reminderMinutes,
      });

      setSuccessLink(result.htmlLink);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule event in your Google Calendar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Schedule Practice Session</h3>
                <p className="text-xs text-slate-400">
                  Adds a reminder directly to your personal Google Calendar
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {!user ? (
              <div className="p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl flex flex-col items-center text-center space-y-3">
                <Calendar className="w-10 h-10 text-cyan-400" />
                <div>
                  <h4 className="font-bold text-slate-200">Sign in with Google Required</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in with your personal Google account so events are added directly to your own Google Calendar with automatic alarms.
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
              <div className="p-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-300">Event Added to Calendar!</h4>
                <p className="text-xs text-slate-300">
                  Your practice session and 15-minute alarm reminder have been saved to your Google Calendar.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={successLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400"
                  >
                    <span>View in Google Calendar</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setSuccessLink(null);
                      onClose();
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-cyan-500 focus:outline-none"
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
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-cyan-500 focus:outline-none text-slate-200"
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
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-cyan-500 focus:outline-none text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Duration (Minutes)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-cyan-500 focus:outline-none text-slate-200"
                    >
                      <option value={30}>30 mins</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours (30 Qs)</option>
                      <option value={180}>3 hours (Full Test)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Alarm Reminder
                    </label>
                    <select
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-cyan-500 focus:outline-none text-slate-200"
                    >
                      <option value={10}>10 mins before</option>
                      <option value={15}>15 mins before</option>
                      <option value={30}>30 mins before</option>
                      <option value={60}>1 hour before</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Notes / Syllabus
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
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
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{loading ? 'Adding Event...' : 'Schedule Event'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
