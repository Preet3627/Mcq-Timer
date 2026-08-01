import React, { useState } from 'react';
import { School, Lock, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, BookOpen, User, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ASHADEEP_PASSWORD } from '../data/ashadeepSchedule';
import { SchoolProfile } from '../types';

interface SchoolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolSelectionModal: React.FC<SchoolSelectionModalProps> = ({ isOpen, onClose }) => {
  const { schoolProfile, setSchoolProfile, restoreDefaultTimetable } = useAppStore();

  const [selectedType, setSelectedType] = useState<'ashadeep' | 'custom' | 'guest'>(
    schoolProfile?.schoolType || 'ashadeep'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [customName, setCustomName] = useState(
    schoolProfile?.schoolType === 'custom' ? schoolProfile.schoolName : ''
  );
  const [stream, setStream] = useState<'JEE' | 'NEET'>(schoolProfile?.stream || 'JEE');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setPasswordError('');

    if (selectedType === 'ashadeep') {
      if (passwordInput.trim() !== ASHADEEP_PASSWORD) {
        setPasswordError(`Incorrect password for Ashadeep IIT. (Password is ${ASHADEEP_PASSWORD})`);
        return;
      }

      const profile: SchoolProfile = {
        schoolType: 'ashadeep',
        schoolName: 'Ashadeep IIT & NEET Group',
        stream: stream,
        isVerified: true,
      };

      setSchoolProfile(profile);
      if (stream === 'JEE') {
        restoreDefaultTimetable();
      }
      onClose();
    } else if (selectedType === 'custom') {
      if (!customName.trim()) {
        setPasswordError('Please enter your school or institute name.');
        return;
      }
      const profile: SchoolProfile = {
        schoolType: 'custom',
        schoolName: customName.trim(),
        stream: stream,
        isVerified: false,
      };
      setSchoolProfile(profile);
      onClose();
    } else {
      const profile: SchoolProfile = {
        schoolType: 'guest',
        schoolName: 'Guest Student',
        stream: 'JEE',
        isVerified: true,
      };
      setSchoolProfile(profile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-6 my-8 animate-in fade-in zoom-in duration-200">
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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <School className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Institution & Academic Stream
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              Select Your School & Batch
            </h2>
          </div>
        </div>

        {/* Options Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Ashadeep IIT */}
          <button
            type="button"
            onClick={() => {
              setSelectedType('ashadeep');
              setPasswordError('');
            }}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
              selectedType === 'ashadeep'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className={`w-5 h-5 ${selectedType === 'ashadeep' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              {selectedType === 'ashadeep' && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </div>
            <div className="mt-3">
              <div className="font-bold text-sm leading-tight">Ashadeep IIT</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Password Locked</div>
            </div>
          </button>

          {/* Option 2: Custom School */}
          <button
            type="button"
            onClick={() => {
              setSelectedType('custom');
              setPasswordError('');
            }}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
              selectedType === 'custom'
                ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 ring-2 ring-purple-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <BookOpen className={`w-5 h-5 ${selectedType === 'custom' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
              {selectedType === 'custom' && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
            </div>
            <div className="mt-3">
              <div className="font-bold text-sm leading-tight">Custom School</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">User-Defined</div>
            </div>
          </button>

          {/* Option 3: Guest Mode */}
          <button
            type="button"
            onClick={() => {
              setSelectedType('guest');
              setPasswordError('');
            }}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
              selectedType === 'guest'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <User className={`w-5 h-5 ${selectedType === 'guest' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              {selectedType === 'guest' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div className="mt-3">
              <div className="font-bold text-sm leading-tight">Guest Mode</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Quick Practice</div>
            </div>
          </button>
        </div>

        {/* Conditional Details Form */}
        {selectedType === 'ashadeep' && (
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-4">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Ashadeep Student Authorization</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                School Access Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder={`Enter password (e.g. ${ASHADEEP_PASSWORD})`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authorized password for Ashadeep JEE/NEET Sankalp Batch students.
              </p>
            </div>

            {/* Stream Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Entrance Exam Stream
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStream('JEE')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    stream === 'JEE'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>JEE Main & Advanced</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStream('NEET')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    stream === 'NEET'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>NEET Medical</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'custom' && (
          <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                School or Coaching Institute Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Delhi Public School / Allen Kota"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Stream
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStream('JEE')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                    stream === 'JEE'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  JEE Aspirant
                </button>
                <button
                  type="button"
                  onClick={() => setStream('NEET')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                    stream === 'NEET'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  NEET Aspirant
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'guest' && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white">
              Guest Mode Active
            </p>
            <p>
              You can track practice timers and solve questions without specific school timetable locks. You can switch to Ashadeep IIT anytime from Settings.
            </p>
          </div>
        )}

        {/* Error Feedback */}
        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Confirm & Load Planner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
