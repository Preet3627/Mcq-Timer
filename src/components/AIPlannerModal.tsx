import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  X,
  FileText,
  Calendar,
  BarChart3,
  ExternalLink,
  Bot,
  BrainCircuit,
  HelpCircle,
  Lightbulb,
  Download,
  Upload,
  Plus,
  Trash2,
  Award,
  Layers,
  BookOpen,
  Code2,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateDynamicStudentPrompt } from '../utils/promptGenerator';
import { AIPlannerImportPayload, ExamScoreRecord } from '../types';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({ isOpen, onClose }) => {
  const {
    sessions,
    customTimetable,
    flashcards,
    schoolProfile,
    examScores,
    addExamScore,
    deleteExamScore,
    importAIPlannerPayload,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'scores'>('export');
  const [copied, setCopied] = useState(false);

  // JSON Import States
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPayload, setParsedPayload] = useState<AIPlannerImportPayload | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // New Exam Score Form State
  const [scoreExamCode, setScoreExamCode] = useState('');
  const [scoreExamName, setScoreExamName] = useState('');
  const [scoreSubject, setScoreSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'Overall'>('Physics');
  const [scoreVal, setScoreVal] = useState('');
  const [maxScoreVal, setMaxScoreVal] = useState('300');
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0]);
  const [scoreNotes, setScoreNotes] = useState('');

  if (!isOpen) return null;

  const dynamicPrompt = generateDynamicStudentPrompt(
    sessions,
    customTimetable,
    flashcards,
    schoolProfile,
    examScores
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(dynamicPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenLLM = (url: string) => {
    handleCopy();
    window.open(url, '_blank');
  };

  const handleAddExamScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreExamCode.trim()) return;

    const newRecord: ExamScoreRecord = {
      id: `score-${Date.now()}`,
      examCode: scoreExamCode.trim().toUpperCase(),
      examName: scoreExamName.trim() || scoreExamCode.trim(),
      subject: scoreSubject,
      score: parseFloat(scoreVal) || 0,
      maxScore: parseFloat(maxScoreVal) || 300,
      date: scoreDate || new Date().toISOString().split('T')[0],
      notes: scoreNotes.trim() || undefined,
    };

    addExamScore(newRecord);
    setScoreExamCode('');
    setScoreExamName('');
    setScoreVal('');
    setScoreNotes('');
  };

  const handleVerifyJson = () => {
    setParseError(null);
    setParsedPayload(null);
    setImportSuccessMsg(null);

    if (!jsonInput.trim()) {
      setParseError('Please paste an AI-generated JSON payload or code block.');
      return;
    }

    try {
      // Extract code block if wrapped in ```json ... ```
      let rawJson = jsonInput.trim();
      const codeBlockMatch = rawJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        rawJson = codeBlockMatch[1].trim();
      }

      const payload = JSON.parse(rawJson) as AIPlannerImportPayload;

      // Basic validation check
      if (
        !payload.flashcards &&
        !payload.customTimetable &&
        !payload.examScores &&
        !payload.motivationalQuotes &&
        !payload.presetPracticeSession &&
        !payload.schoolProfile
      ) {
        setParseError('JSON does not contain any recognizable QTickX AI Planner modules (flashcards, customTimetable, examScores, etc.).');
        return;
      }

      setParsedPayload(payload);
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message || 'Invalid JSON format'}. Make sure brackets and quotes are balanced.`);
    }
  };

  const handleApplyImport = () => {
    if (!parsedPayload) return;
    importAIPlannerPayload(parsedPayload);
    setImportSuccessMsg('Successfully imported AI Planner JSON payload! Version backup snapshot created.');
    setParsedPayload(null);
    setJsonInput('');
    setTimeout(() => {
      setImportSuccessMsg(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Planner & All-In-One Studio
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                Today: {new Date().toISOString().split('T')[0]}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              AI Study Assistant & All-In-One JSON Engine
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>1. Export AI Master Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Import AI JSON Payload</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scores')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'scores'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Log Exam Marks ({examScores.length})</span>
          </button>
        </div>

        {/* TAB 1: EXPORT PROMPT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  Live Context Attached: {new Date().toISOString().split('T')[0]}
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-300">
                  {customTimetable.length} Exams • {examScores.length} Score Logs • {flashcards.length} Cards
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Copy this prompt and paste it into ChatGPT, Gemini, or Claude. It directs the AI to evaluate your current exam dates, speed metrics, and test marks, and output tailored formula flashcards and a <strong>JSON block</strong> ready for 1-click import into QTickX!
              </p>
            </div>

            {/* Prompt Text Box */}
            <div className="relative">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Generated Prompt Context ({dynamicPrompt.length} chars)
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Prompt!' : 'Copy Prompt'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={dynamicPrompt}
                rows={8}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none resize-none shadow-inner"
              />
            </div>

            {/* Direct LLM Launch Shortcuts */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Launch with AI Mentors (Prompt copied automatically):
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenLLM('https://gemini.google.com/app')}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/50 hover:border-blue-500 dark:hover:border-blue-400 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Google Gemini</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenLLM('https://chatgpt.com/')}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/50 hover:border-emerald-500 dark:hover:border-emerald-400 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>ChatGPT</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenLLM('https://claude.ai/')}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-amber-950/50 hover:border-amber-500 dark:hover:border-amber-400 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <BrainCircuit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Claude AI</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT AI JSON PAYLOAD */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-xs text-purple-950 dark:text-purple-200 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Paste AI-Generated JSON Response</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Paste the JSON block outputted by Gemini/ChatGPT/Claude (or shared by a classmate). QTickX will parse and verify flashcards, upcoming exam timetables, prefilled practice sessions, and motivational quotes before adding them!
              </p>
            </div>

            {/* Textarea for JSON */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Raw JSON Payload or AI Code Block
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste raw JSON here, e.g.:&#10;{&#10;  "title": "Physics Formula Deck",&#10;  "flashcards": [{ "subject": "Physics", "front": "F = ma", "back": "Newton 2nd Law", "type": "formula" }]&#10;}'
                rows={6}
                className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleVerifyJson}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>Parse & Verify JSON</span>
              </button>
            </div>

            {/* Error Message */}
            {parseError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Success Message */}
            {importSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Parsed Preview Card */}
            {parsedPayload && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm">
                      {parsedPayload.title || 'AI Planner Package Preview'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {parsedPayload.description || 'Verified QTickX JSON Payload'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                    Ready to Import
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Flashcards</div>
                    <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                      {parsedPayload.flashcards?.length || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Exam Events</div>
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {parsedPayload.customTimetable?.length || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Exam Scores</div>
                    <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {parsedPayload.examScores?.length || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Preset Session</div>
                    <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {parsedPayload.presetPracticeSession ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={handleApplyImport}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Apply JSON Package & Save Safety Snapshot</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXAM MARKS LOG MANAGER */}
        {activeTab === 'scores' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Log JMWT / Kota / Practice Test Scores</span>
              </div>
              <p className="text-[11px] opacity-90">
                Log your actual exam scores so the AI Master Prompt can analyze your mark progression and weak subjects!
              </p>
            </div>

            {/* Add Score Form */}
            <form onSubmit={handleAddExamScoreSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Add Test Score Record</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Exam Code</label>
                  <input
                    type="text"
                    required
                    value={scoreExamCode}
                    onChange={(e) => setScoreExamCode(e.target.value)}
                    placeholder="e.g. JMWT-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500">Subject</label>
                  <select
                    value={scoreSubject}
                    onChange={(e: any) => setScoreSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Overall">Overall / Total</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500">Score Achieved</label>
                  <input
                    type="number"
                    required
                    value={scoreVal}
                    onChange={(e) => setScoreVal(e.target.value)}
                    placeholder="e.g. 240"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500">Max Score</label>
                  <input
                    type="number"
                    required
                    value={maxScoreVal}
                    onChange={(e) => setMaxScoreVal(e.target.value)}
                    placeholder="300 or 720"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm"
                >
                  Save Test Score
                </button>
              </div>
            </form>

            {/* Score List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Logged Scores ({examScores.length})
              </div>

              {examScores.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  No exam score records logged yet. Add your JMWT test scores above!
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {examScores.map((scoreRecord) => {
                    const pct = Math.round((scoreRecord.score / (scoreRecord.maxScore || 1)) * 100);
                    return (
                      <div
                        key={scoreRecord.id}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white">
                              {scoreRecord.examCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-[10px] text-slate-600 dark:text-slate-300">
                              {scoreRecord.subject}
                            </span>
                            <span className="text-[10px] text-slate-400">{scoreRecord.date}</span>
                          </div>
                          {scoreRecord.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {scoreRecord.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                              {scoreRecord.score}
                            </span>
                            <span className="text-slate-400 text-xs"> / {scoreRecord.maxScore}</span>
                            <div className="text-[10px] font-bold text-slate-500">{pct}%</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteExamScore(scoreRecord.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
