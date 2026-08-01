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
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateDynamicStudentPrompt } from '../utils/promptGenerator';

interface PromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptGeneratorModal: React.FC<PromptGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { sessions, customTimetable, flashcards, schoolProfile } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dynamicPrompt = generateDynamicStudentPrompt(
    sessions,
    customTimetable,
    flashcards,
    schoolProfile
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 my-8 animate-in fade-in zoom-in duration-200">
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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              1-Click Smart Context Exporter
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              Dynamic AI Schedule & Analytics Prompt
            </h2>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Includes 1-Month Schedule + Speed Analytics + Weak Topics</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            Copy this dynamically generated prompt and paste it into ChatGPT, Gemini, or Claude. It guides external AI to give you personalized JEE/NEET study strategies, formula flashcards, and interactive QTickX practice deep-links!
          </p>
        </div>

        {/* Prompt Preview Box */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-500" />
              Generated Prompt Payload ({dynamicPrompt.length} chars)
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Payload!' : 'Copy Prompt'}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={dynamicPrompt}
            rows={10}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed focus:outline-none resize-none shadow-inner selection:bg-indigo-500 selection:text-white"
          />
        </div>

        {/* External AI Launchers */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Copy & Launch in External AI:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenLLM('https://gemini.google.com/')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span>Google Gemini</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenLLM('https://chatgpt.com/')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-500" />
                <span>ChatGPT</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenLLM('https://claude.ai/')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-500" />
                <span>Claude AI</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
