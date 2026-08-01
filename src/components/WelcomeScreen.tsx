import React, { useState } from 'react';
import { ShieldCheck, Sparkles, AlertCircle, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { QTickLogo } from './QTickLogo';
import { useAppStore } from '../store/useAppStore';

interface WelcomeScreenProps {
  onGuestContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGuestContinue }) => {
  const { loginWithGoogle, syncError } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(syncError);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in exception:', err);
      setErrorMessage(
        err.message || 'Could not sign in with Google. You can retry or explore as Guest.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center p-6 relative overflow-hidden transition-colors">
      {/* Soft background glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-md flex justify-between items-center pt-4 z-10">
        <QTickLogo variant="full" size="md" />
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800/40">
          JEE & NEET
        </span>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md my-auto py-8 z-10 space-y-8"
      >
        {/* Large Logo & Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800">
            <QTickLogo variant="icon" size="xl" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Practice smarter.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Track every second.
              </span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              Simple MCQ practice timer and speed analytics designed for JEE and NEET students.
            </p>
          </div>
        </div>

        {/* Feature Highlights Pill List */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-sm">
          {[
            { title: 'Per-Question Time Tracking', desc: 'Know exact seconds spent on each question' },
            { title: 'Pace Warning System', desc: 'Gentle alerts for questions taking too long' },
            { title: 'Accuracy & Speed Trends', desc: 'Track your progress and practice history' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-left">
              <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Error Notification Banner if sign-in fails */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p>{errorMessage}</p>
              <button
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Sign-In Again
              </button>
            </div>
          </div>
        )}

        {/* Sign In Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in with Google...</span>
              </>
            ) : (
              <>
                {/* Google G Logo SVG */}
                <svg className="w-5 h-5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.26v3.15C3.24 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.2.01 10.03.01 12c0 1.97.45 3.8 1.25 5.39l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.24 2.7 1.26 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Guest Mode fallback */}
          <button
            onClick={onGuestContinue}
            className="w-full py-3 px-4 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Explore as Guest (Local Data Only)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Your practice data stays connected to your own Google account.</span>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="w-full text-center text-[11px] text-slate-400 dark:text-slate-600 pb-2 z-10">
        QTickX Practice Companion • Built for JEE & NEET
      </div>
    </div>
  );
};
