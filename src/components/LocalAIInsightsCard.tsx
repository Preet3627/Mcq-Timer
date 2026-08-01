import React, { useEffect, useState } from 'react';
import { Cpu, Zap, Activity, Award, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { runLocalTfInference, trainOnDeviceTFModel, TFJSModelPrediction } from '../utils/tfjsPredictor';

export const LocalAIInsightsCard: React.FC = () => {
  const { sessions } = useAppStore();

  const [prediction, setPrediction] = useState<TFJSModelPrediction | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainSuccess, setTrainSuccess] = useState(false);

  useEffect(() => {
    runLocalTfInference(sessions).then((res) => {
      setPrediction(res);
    });
  }, [sessions]);

  const handleTrainLocalModel = async () => {
    setIsTraining(true);
    setTrainSuccess(false);
    const ok = await trainOnDeviceTFModel(sessions);
    if (ok) {
      setTrainSuccess(true);
      const updated = await runLocalTfInference(sessions);
      setPrediction(updated);
      setTimeout(() => setTrainSuccess(false), 3000);
    }
    setIsTraining(false);
  };

  if (!prediction) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-indigo-500/20 shadow-xl relative overflow-hidden space-y-4">
      {/* Glow highlight background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                On-Device AI Engine
              </span>
              <span className="text-[10px] text-slate-400 font-mono">TensorFlow.js</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              Local TensorFlow Neural Pace Analysis
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTrainLocalModel}
          disabled={isTraining || sessions.length === 0}
          className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
          <span>{isTraining ? 'Training TF.js...' : 'Fine-Tune Local Model'}</span>
        </button>
      </div>

      {trainSuccess && (
        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Local TensorFlow.js model fine-tuned on {sessions.length} session logs in browser memory!</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        {/* Metric 1: Readiness Label */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Pace Status</span>
          </div>
          <div className="text-sm font-black text-amber-300 mt-1 line-clamp-1">
            {prediction.readinessLabel}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {prediction.confidencePct}% Model Confidence
          </div>
        </div>

        {/* Metric 2: Recommended Target Pace */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Optimal Target Pace</span>
          </div>
          <div className="text-lg font-black text-cyan-300 mt-0.5">
            {prediction.recommendedTargetTimeSec}s <span className="text-xs text-slate-400 font-normal">/ Q</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Target per JEE/NEET Question
          </div>
        </div>

        {/* Metric 3: Fatigue Risk Score */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Fatigue Index</span>
          </div>
          <div className="text-lg font-black text-rose-300 mt-0.5">
            {prediction.fatigueScore}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full ${
                prediction.fatigueScore > 60 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${prediction.fatigueScore}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Consistency Index */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pace Consistency</span>
          </div>
          <div className="text-lg font-black text-emerald-300 mt-0.5">
            {prediction.consistencyIndex}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Low time variance across set
          </div>
        </div>
      </div>
    </div>
  );
};
