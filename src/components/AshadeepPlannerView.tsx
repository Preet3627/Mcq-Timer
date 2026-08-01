import React, { useState } from 'react';
import {
  Calendar,
  Search,
  RotateCcw,
  Sparkles,
  CalendarCheck,
  Edit3,
  Trash2,
  BookOpen,
  Award,
  Check,
  AlertCircle,
  Clock,
  Plus,
  Filter,
  Layers,
  RefreshCw,
  Lock,
  BrainCircuit,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  ASHADEEP_HEADER,
  PHYSICS_CHAPTERS,
  MATHS_CHAPTERS,
  CHEM_CHAPTERS,
  ChapterProgress,
} from '../data/ashadeepSchedule';
import { AshadeepExamEvent } from '../types';

export const AshadeepPlannerView: React.FC = () => {
  const {
    schoolProfile,
    customTimetable,
    restoreDefaultTimetable,
    updateTimetableEvent,
    addCustomTimetableEvent,
    deleteTimetableEvent,
    scheduleCalendarEvent,
    user,
    setShowSchoolModal,
    setShowAIPlannerModal,
    clearGoogleCalendarEvents,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'exams' | 'syllabus'>('exams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // Sync state
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Edit Event Modal state
  const [editingEvent, setEditingEvent] = useState<AshadeepExamEvent | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editSyllabus, setEditSyllabus] = useState('');

  // Add Event Modal state
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<AshadeepExamEvent['type']>('Weekly Test');
  const [newSubject, setNewSubject] = useState('Maths');
  const [newSyllabus, setNewSyllabus] = useState('');
  const [newDate, setNewDate] = useState('2026-08-15');

  // Filter timetable
  const filteredEvents = customTimetable.filter((ev) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      ev.code.toLowerCase().includes(q) ||
      ev.syllabus.toLowerCase().includes(q) ||
      ev.subject.toLowerCase().includes(q);

    const matchesType =
      selectedType === 'All' ||
      (selectedType === 'Weekly' && ev.type === 'Weekly Test') ||
      (selectedType === 'Kota' && ev.type === 'Kota Test') ||
      (selectedType === 'Unit' && ev.type === 'Unit Test / RRT') ||
      (selectedType === 'AITS' && ev.type === 'AITS') ||
      (selectedType === 'FST' && ev.type === 'Full Test');

    const matchesSubject =
      selectedSubject === 'All' ||
      ev.subject.toLowerCase().includes(selectedSubject.toLowerCase());

    return matchesQuery && matchesType && matchesSubject;
  });

  // 1-Click Sync All to Google Calendar
  const handleBatchSyncCalendar = async () => {
    if (!user || !user.accessToken) {
      setSyncStatusMsg('Please sign in with Google in Settings first to sync events to your Google Calendar.');
      setTimeout(() => setSyncStatusMsg(null), 4000);
      return;
    }

    setIsSyncingAll(true);
    setSyncStatusMsg('Scheduling exam events to Google Calendar...');

    let syncedCount = 0;
    try {
      // Sync top upcoming / filtered 15 events to avoid hit rate limits
      const eventsToSync = filteredEvents.slice(0, 15);

      for (const ev of eventsToSync) {
        if (!ev.calendarEventId) {
          const startTime = ev.startTime || '09:00';
          const startIso = `${ev.date}T${startTime}:00Z`;
          const endIso = `${ev.date}T12:00:00Z`;

          const res = await scheduleCalendarEvent({
            title: `[Ashadeep] ${ev.code} - ${ev.subject}`,
            description: `Exam Code: ${ev.code}\nType: ${ev.type}\nSubject: ${ev.subject}\nSyllabus: ${ev.syllabus}\nAshadeep JEE/NEET 2026-27 Planner`,
            startIso,
            endIso,
            reminderMinutes: 30,
          });

          updateTimetableEvent({
            ...ev,
            calendarEventId: res.id,
          });
          syncedCount++;
        }
      }

      setSyncStatusMsg(
        syncedCount > 0
          ? `Successfully scheduled ${syncedCount} exam events to Google Calendar with reminders!`
          : `All selected exam events are already synced to Google Calendar.`
      );
    } catch (err: any) {
      console.error('Batch sync error:', err);
      setSyncStatusMsg(`Calendar Sync Error: ${err.message || 'Failed to sync'}`);
    } finally {
      setIsSyncingAll(false);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    }
  };

  const handleClearCalendarSync = async () => {
    await clearGoogleCalendarEvents();
    setSyncStatusMsg('Google Calendar sync IDs cleared locally. You can schedule them again with 1-click.');
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const isAshadeepVerified =
    schoolProfile?.schoolType === 'ashadeep' && schoolProfile?.isVerified;

  const handleRestoreDefault = () => {
    if (!isAshadeepVerified) {
      alert(
        'Official Ashadeep 2026-27 schedule is only available for verified Ashadeep IIT students. Please select Ashadeep IIT and enter authorization password.'
      );
      setShowSchoolModal(true);
      return;
    }
    if (
      window.confirm(
        'Are you sure you want to restore the official Ashadeep 2026-27 timetable? Any custom edits will be reset.'
      )
    ) {
      restoreDefaultTimetable();
      setSyncStatusMsg('Timetable restored to official Ashadeep JEE Sankalp Batch 2026-27 schedule!');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  const openEditModal = (ev: AshadeepExamEvent) => {
    setEditingEvent(ev);
    setEditDate(ev.date);
    setEditTime(ev.startTime || '09:00');
    setEditSyllabus(ev.syllabus);
  };

  const handleSaveEdit = () => {
    if (!editingEvent) return;
    updateTimetableEvent({
      ...editingEvent,
      date: editDate,
      startTime: editTime,
      syllabus: editSyllabus,
      isCustomized: true,
    });
    setEditingEvent(null);
  };

  const handleCreateNewEvent = () => {
    if (!newCode || !newSyllabus) return;
    const event: AshadeepExamEvent = {
      id: `custom-${Date.now()}`,
      code: newCode.toUpperCase(),
      type: newType,
      subject: newSubject,
      syllabus: newSyllabus,
      date: newDate,
      startTime: '09:00',
      endTime: '12:00',
      isCustomized: true,
    };
    addCustomTimetableEvent(event);
    setIsAddingEvent(false);
    setNewCode('');
    setNewSyllabus('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      {isAshadeepVerified ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/20 shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  {ASHADEEP_HEADER.subtitle}
                </span>

                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                  {schoolProfile?.schoolName || 'Ashadeep IIT Group'} ({schoolProfile?.stream || 'JEE'})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {ASHADEEP_HEADER.title}
              </h1>

              <p className="text-sm text-slate-300 font-medium">
                {ASHADEEP_HEADER.year} • {ASHADEEP_HEADER.batch} •{' '}
                <span className="text-amber-300 font-bold">{ASHADEEP_HEADER.mission}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAIPlannerModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md"
              >
                <BrainCircuit className="w-4 h-4 text-slate-950" />
                <span>AI Planner & JSON Engine</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSchoolModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Change School / Stream</span>
              </button>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-white/10 relative z-10">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Lectures</div>
              <div className="text-xl font-black text-white mt-0.5">{ASHADEEP_HEADER.totalLectures}</div>
              <div className="text-[10px] text-slate-400">Board + JEE</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Examinations</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{ASHADEEP_HEADER.totalExams}</div>
              <div className="text-[10px] text-slate-400">58 JMWT, 12 Kota, 30 RRT</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Physics Lec</div>
              <div className="text-xl font-black text-cyan-300 mt-0.5">{ASHADEEP_HEADER.physicsLectures}</div>
              <div className="text-[10px] text-slate-400">14 Chapters</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Maths Lec</div>
              <div className="text-xl font-black text-purple-300 mt-0.5">{ASHADEEP_HEADER.mathsLectures}</div>
              <div className="text-[10px] text-slate-400">15 Chapters</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Chemistry Lec</div>
              <div className="text-xl font-black text-emerald-300 mt-0.5">{ASHADEEP_HEADER.chemLectures}</div>
              <div className="text-[10px] text-slate-400">12 Chapters</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">AITS & FST</div>
              <div className="text-xl font-black text-rose-300 mt-0.5">38 Tests</div>
              <div className="text-[10px] text-slate-400">20 AITS + 18 FST</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-xl relative overflow-hidden space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{schoolProfile?.schoolType === 'custom' ? 'Custom School Mode' : 'Guest Mode'}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                  {schoolProfile?.schoolName || 'Guest Student'} ({schoolProfile?.stream || 'JEE'})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Personal MCQ & Exam Schedule Planner
              </h1>

              <p className="text-sm text-slate-300 font-medium">
                Custom study planner for competitive entrance exam prep. Add your own mock tests and exam dates below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSchoolModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Ashadeep Schedule</span>
              </button>
            </div>
          </div>

          {/* Guest Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 relative z-10">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Scheduled Custom Events</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{customTimetable.length}</div>
              <div className="text-[10px] text-slate-400">User Defined</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Exam Stream</div>
              <div className="text-xl font-black text-cyan-300 mt-0.5">{schoolProfile?.stream || 'JEE'}</div>
              <div className="text-[10px] text-slate-400">Target Preparation</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Ashadeep Schedule Status</div>
              <div className="text-xl font-black text-rose-300 mt-0.5">Locked</div>
              <div className="text-[10px] text-slate-400">Password Required</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification Status Bar */}
      {syncStatusMsg && (
        <div className="p-4 rounded-2xl bg-indigo-900/90 text-indigo-100 border border-indigo-700 text-xs font-medium flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        </div>
      )}

      {/* Main Tabs and Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'exams'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Annual Exam Planner ({customTimetable.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'syllabus'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span>Chapter Syllabus Tracker</span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Restore Button */}
          <button
            type="button"
            onClick={handleRestoreDefault}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Restore original Ashadeep JEE 2026-27 schedule"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Restore Timetable</span>
          </button>

          {/* Google Calendar Batch Sync Button */}
          <button
            type="button"
            onClick={handleBatchSyncCalendar}
            disabled={isSyncingAll}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <CalendarCheck className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : '1-Click Calendar Schedule'}</span>
          </button>

          {/* Clear Calendar Sync Button */}
          <button
            type="button"
            onClick={handleClearCalendarSync}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Reset calendar event IDs to re-sync"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Calendar Sync</span>
          </button>
        </div>
      </div>

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exam code, chapter or syllabus..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
              {['All', 'Weekly', 'Kota', 'Unit', 'AITS', 'FST'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1">
              {['All', 'Maths', 'Physics', 'Chemistry'].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedSubject === subj
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddingEvent(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Exam</span>
            </button>
          </div>

          {/* Exam Table List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase font-bold text-[10px] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Date & Day</th>
                    <th className="px-4 py-3">Exam Code</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 min-w-[280px]">Syllabus Coverage</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <div className="max-w-md mx-auto space-y-3">
                          <Calendar className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {isAshadeepVerified
                              ? 'No exam records matching your filter.'
                              : 'No Exam Events Scheduled Yet'}
                          </div>
                          <p className="text-xs text-slate-500">
                            {isAshadeepVerified
                              ? 'Try resetting your search query or subject filters.'
                              : 'Click "+ Add Custom Exam" to build your personal timetable, or enter the Ashadeep student password to unlock the official 2026-27 schedule.'}
                          </p>
                          {!isAshadeepVerified && (
                            <button
                              type="button"
                              onClick={() => setShowSchoolModal(true)}
                              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Unlock Official Ashadeep Schedule</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {ev.date}
                          {ev.isCustomized && (
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Custom
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-black text-blue-600 dark:text-blue-400 font-mono">
                          {ev.code}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              ev.type === 'Weekly Test'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                : ev.type === 'Kota Test'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : ev.type === 'AITS'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {ev.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          {ev.subject}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                          {ev.syllabus}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditModal(ev)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                            title="Edit exam details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTimetableEvent(ev.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all"
                            title="Delete exam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SYLLABUS TAB */}
      {activeTab === 'syllabus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Physics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                PHY
              </span>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Physics (14 Ch)</h3>
                <p className="text-[10px] text-slate-400">Board: 161 Lec • JEE: 100 Lec</p>
              </div>
            </div>

            <div className="space-y-3">
              {PHYSICS_CHAPTERS.map((ch) => (
                <div key={ch.chNo} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Ch {ch.chNo}. {ch.name}</span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">{ch.lecJee} JEE Lec</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                    <span>Board End: {ch.boardEndDate}</span>
                    <span>JEE End: {ch.jeeEndDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maths */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-bold text-xs">
                MATH
              </span>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Mathematics (15 Ch)</h3>
                <p className="text-[10px] text-slate-400">Board: 217 Lec • JEE: 103 Lec</p>
              </div>
            </div>

            <div className="space-y-3">
              {MATHS_CHAPTERS.map((ch) => (
                <div key={ch.chNo} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Ch {ch.chNo}. {ch.name}</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">{ch.lecJee} JEE Lec</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                    <span>Board End: {ch.boardEndDate}</span>
                    <span>JEE End: {ch.jeeEndDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chemistry */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                CHEM
              </span>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Chemistry (12 Ch)</h3>
                <p className="text-[10px] text-slate-400">Board: 145 Lec • JEE: 115 Lec</p>
              </div>
            </div>

            <div className="space-y-3">
              {CHEM_CHAPTERS.map((ch) => (
                <div key={ch.chNo} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Ch {ch.chNo}. {ch.name}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{ch.lecJee} JEE Lec</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                    <span>Board End: {ch.boardEndDate}</span>
                    <span>JEE End: {ch.jeeEndDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Edit Exam: {editingEvent.code}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Time</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Syllabus Details</label>
                <textarea
                  value={editSyllabus}
                  onChange={(e) => setEditSyllabus(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Add Custom Exam / Test
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. JMWT-59 or MOCK-01"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Weekly Test">Weekly Test</option>
                    <option value="Kota Test">Kota Test</option>
                    <option value="Unit Test / RRT">Unit Test / RRT</option>
                    <option value="AITS">AITS</option>
                    <option value="Full Test">Full Test</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Maths">Maths</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="CPM">CPM (Combined)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Syllabus</label>
                <textarea
                  value={newSyllabus}
                  onChange={(e) => setNewSyllabus(e.target.value)}
                  rows={3}
                  placeholder="Chapter topics..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingEvent(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewEvent}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Add Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
