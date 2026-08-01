import React, { useState } from 'react';
import {
  Play,
  Upload,
  FileText,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Camera,
  Layers,
  Check,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, PracticeMode, PracticeLevel, TestSettings, QuestionAnswerKey } from '../types';
import { useAppStore } from '../store/useAppStore';
import { parseAnswerKeyInput } from '../utils/answerKeyParser';

interface SetupModalProps {
  onStartTest: (settings: TestSettings) => void;
  onOpenAIPrompt: () => void;
  initialSettings?: TestSettings;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  onStartTest,
  onOpenAIPrompt,
  initialSettings,
}) => {
  const { lastSettings, unfinishedSession, clearUnfinishedSession } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    initialSettings?.subject || lastSettings.subject || 'Physics'
  );
  const [customSubject, setCustomSubject] = useState('');

  const [practiceType, setPracticeType] = useState<PracticeMode>(
    initialSettings?.mode || lastSettings.mode || 'Self Practice'
  );

  const [practiceLevel, setPracticeLevel] = useState<PracticeLevel>(
    initialSettings?.level || lastSettings.level || 'Level 1'
  );

  const [exerciseNumber, setExerciseNumber] = useState<string>(
    initialSettings?.exerciseNumber || lastSettings.exerciseNumber || ''
  );

  const [chapterName, setChapterName] = useState<string>(
    initialSettings?.chapterName || lastSettings.chapterName || ''
  );

  const [description, setDescription] = useState<string>(
    initialSettings?.description || lastSettings.description || ''
  );

  const [feedbackMode, setFeedbackMode] = useState<'test' | 'practice'>(
    initialSettings?.feedbackMode || lastSettings.feedbackMode || 'test'
  );

  const [questionCount, setQuestionCount] = useState<number>(
    initialSettings?.totalQuestions || lastSettings.totalQuestions || 30
  );
  const [customQCount, setCustomQCount] = useState<string>('');

  // Step 4: Add Answers
  const [answerEntryMode, setAnswerEntryMode] = useState<'now' | 'later' | 'paste' | 'image' | 'json'>(
    'now'
  );
  const [pastedSequence, setPastedSequence] = useState('');
  const [manualAnswers, setManualAnswers] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    const sourceKey = initialSettings?.answerKey || lastSettings.answerKey || [];
    sourceKey.forEach((k) => {
      map[k.q] = k.ans;
    });
    return map;
  });

  // Image scanner state
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [scannedPreview, setScannedPreview] = useState<string | null>(null);

  // Time Warning Thresholds (Default 3m = 180s caution, 10m = 600s urgent)
  const [cautionMinutes, setCautionMinutes] = useState(3);
  const [urgentMinutes, setUrgentMinutes] = useState(10);

  // Subject Options
  const subjects = [
    { id: 'Physics', label: 'Physics', icon: '⚡' },
    { id: 'Chemistry', label: 'Chemistry', icon: '🧪' },
    { id: 'Mathematics', label: 'Mathematics', icon: '📐' },
    { id: 'Biology', label: 'Biology', icon: '🧬' },
    { id: 'Other', label: 'Other Subject', icon: '📚' },
  ];

  // Practice Type Options
  const practiceTypes: { id: PracticeMode; label: string; desc: string }[] = [
    { id: 'Exercise', label: 'Exercise', desc: 'Standard textbook problem set' },
    { id: 'Self Practice', label: 'Self Practice', desc: 'Custom paced question practice' },
    { id: 'PYQ', label: 'PYQ (Past Year)', desc: 'Previous years exam questions' },
    { id: 'Mock Test', label: 'Mock Test', desc: 'Full timed examination simulation' },
    { id: 'Custom', label: 'Custom', desc: 'Flexible custom set' },
  ];

  // Parse pasted sequence (supports options A-D, numerical/integer values, and JSON)
  const handleParsePastedSequence = (text: string) => {
    setPastedSequence(text);
    const parsedList = parseAnswerKeyInput(text, questionCount);
    const map: Record<number, string> = {};
    parsedList.forEach((item) => {
      map[item.q] = item.ans;
    });
    setManualAnswers((prev) => ({ ...prev, ...map }));
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setScannedPreview(reader.result as string);
      setIsScanningImage(true);

      // Simulate AI answer scanner reading answers
      setTimeout(() => {
        setIsScanningImage(false);
        // Sample detected answers
        const autoKey: Record<number, string> = {};
        const options = ['A', 'B', 'C', 'D'];
        for (let i = 1; i <= questionCount; i++) {
          autoKey[i] = options[(i - 1) % 4];
        }
        setManualAnswers(autoKey);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  // Build Final Settings & Launch Practice
  const handleLaunch = () => {
    const effectiveSubject = selectedSubject === 'Other' && customSubject.trim() ? customSubject.trim() : selectedSubject;
    const effectiveQCount = customQCount ? parseInt(customQCount, 10) || 30 : questionCount;

    const answerKeyList: QuestionAnswerKey[] = Array.from({ length: effectiveQCount }, (_, i) => ({
      q: i + 1,
      ans: manualAnswers[i + 1] || '',
    }));

    const settings: TestSettings = {
      subject: effectiveSubject,
      mode: practiceType,
      level: practiceLevel,
      exerciseNumber: exerciseNumber.trim() || undefined,
      chapterName: chapterName.trim() || undefined,
      description: description.trim() || undefined,
      totalQuestions: effectiveQCount,
      targetTimePerQuestion: cautionMinutes * 60,
      cautionThreshold: cautionMinutes * 60,
      urgentThreshold: urgentMinutes * 60,
      soundEnabled: true,
      ambientSound: 'none',
      volume: 0.7,
      answerKey: answerKeyList,
      enableNegativeMarking: true,
      feedbackMode,
    };

    onStartTest(settings);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24 space-y-6">
      {/* Active Unfinished Session Banner */}
      {unfinishedSession && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="font-bold text-sm">Half-Attempted Session in Progress!</div>
              <p className="text-slate-600 dark:text-amber-300/80">
                {unfinishedSession.settings.subject} • {unfinishedSession.settings.exerciseNumber ? `Ex ${unfinishedSession.settings.exerciseNumber}` : unfinishedSession.settings.mode} (Question {unfinishedSession.currentQ}/{unfinishedSession.settings.totalQuestions} • {Math.floor(unfinishedSession.totalSessionTime / 60)}m spent)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onStartTest(unfinishedSession.settings)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              Resume Session
            </button>
            <button
              onClick={clearUnfinishedSession}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 font-semibold rounded-xl transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Step Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        {[
          { stepNum: 1, label: 'Subject' },
          { stepNum: 2, label: 'Type & Level' },
          { stepNum: 3, label: 'Questions' },
          { stepNum: 4, label: 'Answers' },
        ].map((s, idx) => {
          const isDone = step > s.stepNum;
          const isCurrent = step === s.stepNum;
          return (
            <React.Fragment key={s.stepNum}>
              <button
                onClick={() => setStep(s.stepNum as any)}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                  isCurrent
                    ? 'text-blue-600 dark:text-cyan-400'
                    : isDone
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-md shadow-blue-500/20'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.stepNum}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < 3 && <div className="h-0.5 flex-1 mx-2 bg-slate-200 dark:bg-slate-800" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
        >
          {/* STEP 1: Subject Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Step 1: Select Subject</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Which subject are you practicing today?</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subjects.map((sub) => {
                  const isSelected = selectedSubject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-2 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-cyan-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="text-3xl">{sub.icon}</div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{sub.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSubject === 'Other' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter Subject Name</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="e.g. Organic Chemistry / Mock Paper 1"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span>Next: Practice Type</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Practice Type & Level */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Step 2: Practice Type & Level</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select how you want to practice</p>
              </div>

              <div className="space-y-3">
                {practiceTypes.map((pt) => {
                  const isSelected = practiceType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => setPracticeType(pt.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-cyan-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{pt.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{pt.desc}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-cyan-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Exercise / Chapter Section Number Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Exercise / Chapter No. <span className="text-slate-400 font-normal">(e.g. 7.1, 3.4, Ex 12.2)</span>
                  </label>
                  {exerciseNumber && (
                    <button
                      type="button"
                      onClick={() => setExerciseNumber('')}
                      className="text-[11px] font-semibold text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={exerciseNumber}
                  onChange={(e) => setExerciseNumber(e.target.value)}
                  placeholder="e.g. 7.1 or 3.4"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Quick Suggestion Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Quick pick:</span>
                  {['7.1', '3.4', '1.2', '5.3', '12.1', 'Ex 4.2'].map((exVal) => (
                    <button
                      key={exVal}
                      type="button"
                      onClick={() => setExerciseNumber(exVal)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        exerciseNumber === exVal
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {exVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter Name & Description Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Chapter Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="e.g. Rotational Motion / Electrostatics"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Session Description / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Speed focus on numericals"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Level choices if applicable */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Level 1', 'Level 2', 'Level 3'] as PracticeLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setPracticeLevel(lvl)}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-colors ${
                        practiceLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Mode: Test vs Practice */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Execution & Feedback Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackMode('test')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      feedbackMode === 'test'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-cyan-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm flex items-center justify-between text-slate-900 dark:text-white">
                      <span>📝 Test Mode</span>
                      {feedbackMode === 'test' && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Real exam simulation. Answers & scorecards revealed at the end.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackMode('practice')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      feedbackMode === 'practice'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm flex items-center justify-between text-slate-900 dark:text-white">
                      <span>🎯 Practice Mode (Instant)</span>
                      {feedbackMode === 'practice' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Options highlight immediately (Green/Red) + Search Google for solutions.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span>Next: Question Count</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Question Count & Pace Warnings */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Step 3: Question Count & Pace</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">How many questions are you solving?</p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setQuestionCount(num);
                      setCustomQCount('');
                    }}
                    className={`py-4 rounded-2xl border font-black text-lg transition-all ${
                      questionCount === num && !customQCount
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {num} <span className="text-xs font-normal">Q</span>
                  </button>
                ))}

                <div className="col-span-1">
                  <input
                    type="number"
                    value={customQCount}
                    onChange={(e) => setCustomQCount(e.target.value)}
                    placeholder="Custom"
                    className="w-full h-full py-4 px-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pace Warning Thresholds Settings */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Pace Reminder Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold">Gentle Caution Reminder</label>
                    <select
                      value={cautionMinutes}
                      onChange={(e) => setCautionMinutes(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      <option value={2}>After 2 minutes</option>
                      <option value={3}>After 3 minutes (Standard)</option>
                      <option value={4}>After 4 minutes</option>
                      <option value={5}>After 5 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold">Strong Urgent Reminder</label>
                    <select
                      value={urgentMinutes}
                      onChange={(e) => setUrgentMinutes(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      <option value={7}>After 7 minutes</option>
                      <option value={10}>After 10 minutes (Standard)</option>
                      <option value={15}>After 15 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span>Next: Add Answers</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Add Answers */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Step 4: Add Answers</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Optionally add answer key now or during/after practice
                </p>
              </div>

              {/* Entry Mode Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-semibold">
                {[
                  { id: 'now', label: 'Manual / Numerical' },
                  { id: 'paste', label: 'Paste / AI JSON' },
                  { id: 'image', label: 'Upload Image' },
                  { id: 'later', label: 'Add Later' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAnswerEntryMode(tab.id as any)}
                    className={`py-2 rounded-xl transition-colors ${
                      answerEntryMode === tab.id
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mode 1: Manual Entry Grid (Supports options A-D and Numerical values like 12.5) */}
              {answerEntryMode === 'now' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Supports Options A, B, C, D and Numerical / Decimal / Integer values (e.g. 12, 3.14, -5)</span>
                    <button
                      type="button"
                      onClick={onOpenAIPrompt}
                      className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Prompt & JSON Helper</span>
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {Array.from({ length: customQCount ? parseInt(customQCount, 10) || 30 : questionCount }, (_, idx) => {
                        const qNum = idx + 1;
                        const val = manualAnswers[qNum] || '';
                        return (
                          <div key={qNum} className="space-y-1 text-center">
                            <span className="text-[10px] text-slate-400 font-mono">Q{qNum}</span>
                            <input
                              type="text"
                              maxLength={10}
                              value={val}
                              onChange={(e) => {
                                const char = e.target.value.toUpperCase();
                                setManualAnswers((prev) => ({ ...prev, [qNum]: char }));
                              }}
                              placeholder="e.g. A / 12.5"
                              className="w-full h-9 text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Paste Sequence / AI JSON */}
              {answerEntryMode === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Paste Answer Sequence or AI JSON e.g. [{"{"}"q":1,"ans":"A"{"}"},{"{"}"q":2,"ans":"12.5"{"}"}] or 1:A 2:12.5
                    </label>
                    <button
                      type="button"
                      onClick={onOpenAIPrompt}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Get AI Prompt for ChatGPT</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={pastedSequence}
                    onChange={(e) => handleParsePastedSequence(e.target.value)}
                    placeholder='Paste here e.g. ABCDABCD or [{"q":1,"ans":"A"},{"q":2,"ans":"12.5"}]...'
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Detected {Object.keys(manualAnswers).filter((k) => manualAnswers[Number(k)]).length} answers automatically!
                  </p>
                </div>
              )}

              {/* Mode 3: Image Scanner */}
              {answerEntryMode === 'image' && (
                <div className="space-y-4 text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <Camera className="w-8 h-8 mx-auto text-blue-500 opacity-80" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Answer-Key Photo</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Upload an image of your test key. You can review detected answers before starting.
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="answer-key-image-upload"
                  />
                  <label
                    htmlFor="answer-key-image-upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 font-bold text-xs border border-blue-200 dark:border-blue-900 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Image</span>
                  </label>

                  {isScanningImage && (
                    <div className="text-xs font-bold text-blue-600 dark:text-cyan-400 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Reading answers from image...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 4: Add Later */}
              {answerEntryMode === 'later' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">No problem!</p>
                  <p>You can start your timer right away. You can input or verify answers anytime during or after your practice session.</p>
                </div>
              )}

              {/* Launch Practice Button */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Back
                </button>

                <button
                  onClick={handleLaunch}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Practice Session</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
