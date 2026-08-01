import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { QTickLogo } from './QTickLogo';

interface SplashAnimationProps {
  onComplete: () => void;
}

export const SplashAnimation: React.FC<SplashAnimationProps> = ({ onComplete }) => {
  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const duration = prefersReducedMotion ? 600 : 1600;
    const timer = setTimeout(() => {
      onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white"
      >
        <QTickLogo variant="full" size="xl" showTagline />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#070b14] via-[#091024] to-[#05070f] text-white p-6 overflow-hidden"
    >
      {/* 3D ambient lighting ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.25 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute w-72 h-72 rounded-full bg-blue-500 blur-[80px] pointer-events-none"
      />

      {/* Main 3D Icon Container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          {/* Rotating 3D Gauge Ring */}
          <motion.svg
            viewBox="0 0 100 100"
            className="w-32 h-32 absolute -inset-4 pointer-events-none"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#splashGradient)"
              strokeWidth="4"
              strokeDasharray="210 60"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </motion.svg>

          {/* Core QTick Icon */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotateY: -30 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.7, delay: 0.1, type: 'spring', stiffness: 200 }}
            className="p-5 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl shadow-cyan-500/20"
          >
            <QTickLogo variant="icon" size="xl" />
          </motion.div>
        </div>

        {/* Wordmark & Tagline Fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center space-y-1"
        >
          <div className="text-3xl font-black tracking-tight">
            <span>Q</span>
            <span className="text-cyan-400">Tick</span>
            <span className="text-indigo-400 ml-0.5">X</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Practice smarter. Track every second.</p>
        </motion.div>
      </div>

      {/* Subtle loader bar at bottom */}
      <div className="absolute bottom-12 w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
        />
      </div>
    </motion.div>
  );
};
