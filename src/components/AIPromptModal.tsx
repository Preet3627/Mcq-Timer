import React, { useState } from 'react';
import { Copy, Check, Sparkles, X, FileText, ArrowRight, UploadCloud, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIAnswerKeyPrompt } from '../utils/answerKeyParser';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
  totalQuestions?: number;
  onImportJSON?: (jsonString: string) => void;
}

export const AIPromptModal: React.FC<AIPromptModalProps> = ({
  isOpen,
  onClose,
  subject = 'Physics',
  totalQuestions = 30,
  onImportJSON
}) => {
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const promptText = getAIAnswerKeyPrompt(subject, totalQuestions);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyJSON = () => {
    setErrorMsg('');
    if (!jsonInput.trim()) {
      setErrorMsg('Please paste valid JSON data first.');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput.trim());
      if (!Array.isArray(parsed) && typeof parsed !== 'object') {
        throw new Error('Must be a JSON array of answer objects');
      }
      if (onImportJSON) {
        onImportJSON(jsonInput.trim());
      }
      onClose();
    } catch (e: any) {
      setErrorMsg('Invalid JSON format. Make sure it looks like [{"q":1,"ans":"A"}]');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  AI Answer Key Convertor Helper
                </h3>
                <p className="text-xs text-slate-400">
                  Extract answer keys using Google Gemini or ChatGPT app in seconds
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-sm">
            {/* Steps Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-xs font-bold text-amber-400 mb-1">Step 1</div>
                <p className="text-xs text-slate-300">
                  Take a photo/screenshot of your test paper answer key on your phone.
                </p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-xs font-bold text-purple-400 mb-1">Step 2</div>
                <p className="text-xs text-slate-300">
                  Copy prompt below, open <b>Gemini App</b> or <b>ChatGPT</b>, attach screenshot & paste prompt.
                </p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="text-xs font-bold text-emerald-400 mb-1">Step 3</div>
                <p className="text-xs text-slate-300">
                  Copy the generated JSON output from Gemini/ChatGPT and paste it in Step 2 box below!
                </p>
              </div>
            </div>

            {/* Prompt Display Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Gemini / ChatGPT Prompt (Ready to Copy)
                </label>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg shadow-lg shadow-purple-600/20 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied Prompt!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Prompt
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-purple-200 leading-relaxed max-h-36 overflow-y-auto select-all">
                {promptText}
              </div>
            </div>

            {/* JSON Import Section */}
            {onImportJSON && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  Paste AI JSON Output Here
                </label>
                <textarea
                  rows={4}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Paste JSON here e.g. [{"q": 1, "ans": "A"}, {"q": 2, "ans": "C"}, ...]'
                  className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl font-mono text-xs text-emerald-300 focus:outline-none transition-colors placeholder:text-slate-600"
                />
                {errorMsg && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl"
            >
              Close
            </button>
            {onImportJSON && (
              <button
                onClick={handleApplyJSON}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
              >
                <span>Import Answer Key JSON</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
