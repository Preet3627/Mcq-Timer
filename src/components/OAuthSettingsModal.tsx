import React, { useState } from 'react';
import { Settings, Shield, HardDrive, Calendar, Check, AlertCircle, Copy, ExternalLink, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';

interface OAuthSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OAuthSettingsModal: React.FC<OAuthSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    googleClientId,
    setGoogleClientId,
    loginWithGoogle,
    signOut,
    syncToCloud,
    restoreFromCloud,
    syncState,
    lastSyncedAt,
    syncError,
  } = useAppStore();

  const [inputClientId, setInputClientId] = useState(googleClientId);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleClientId(inputClientId.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const copyVercelEnvSnippet = () => {
    const snippet = `VITE_GOOGLE_CLIENT_ID=${inputClientId.trim()}\nVITE_APP_URL=${window.location.origin}`;
    navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-purple-600/20 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Google Auth & Vercel .env Config</h3>
                <p className="text-xs text-slate-400">
                  Manage personal Google Account sync (Drive & Calendar) & OAuth Client ID
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
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* User Account Card */}
            <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border border-cyan-500/40"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">
                    {user ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-100">
                    {user ? user.name : 'Not Signed In'}
                  </div>
                  <p className="text-xs text-slate-400">
                    {user ? user.email : 'Sign in to sync backup & calendar to your own Google account'}
                  </p>
                  {lastSyncedAt && (
                    <p className="text-[10px] text-cyan-400 mt-0.5">
                      Last Drive Sync: {lastSyncedAt}
                    </p>
                  )}
                </div>
              </div>

              <div>
                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncToCloud()}
                      disabled={syncState === 'syncing'}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>{syncState === 'syncing' ? 'Syncing...' : 'Sync Drive'}</span>
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold text-xs rounded-xl"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => loginWithGoogle()}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
                  >
                    Sign in with Google
                  </button>
                )}
              </div>
            </div>

            {syncError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

            {/* Custom Google Client ID Setup Form */}
            <form onSubmit={handleSaveClientId} className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">
                    Google OAuth Client ID (Vercel / Production)
                  </label>
                  {saveSuccess && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Client ID Updated!
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Each user authenticates with their own Google account. Drive backup is written to their personal Google Drive as <code className="text-cyan-400 font-mono">jee_neet_mcq_timer_backup.json</code>.
                </p>
              </div>
            </form>

            {/* Vercel Environment Snippet Section */}
            <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Vercel Environment Setup (.env)
                </span>
                <button
                  onClick={copyVercelEnvSnippet}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-xs text-cyan-400 font-mono rounded-lg border border-white/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedEnv ? 'Copied!' : 'Copy .env'}</span>
                </button>
              </div>

              <pre className="p-3 bg-black/60 rounded-xl font-mono text-xs text-cyan-300/90 border border-white/5 overflow-x-auto">
{`# .env for Vercel / Production Deployment
VITE_GOOGLE_CLIENT_ID=${inputClientId.trim()}
VITE_APP_URL=${window.location.origin}`}
              </pre>

              <div className="text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">How to create Client ID in Google Cloud Console:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                  <li>Go to Google Cloud Console → Credentials → Create Credentials → OAuth Client ID</li>
                  <li>Select <strong className="text-slate-200">Web Application</strong></li>
                  <li>Add Authorized JavaScript Origins: <code className="text-cyan-300 font-mono">{window.location.origin}</code></li>
                  <li>Enable Google Drive API & Google Calendar API in your Google Cloud Project</li>
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
