import React, { useState, useEffect } from 'react';
import { MaternalMetrics } from '../types/placentaSync';

interface BreatheWithBabyVisualizerPreviewProps {
  metrics: MaternalMetrics;
  onReturnToDailyCheckIn: () => void;
  onPinchEffect: () => void;
}

export const BreatheWithBabyVisualizerPreview: React.FC<BreatheWithBabyVisualizerPreviewProps> = ({
  metrics,
  onReturnToDailyCheckIn,
  onPinchEffect,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);

  const phases = [
    { name: 'Inhale Deeply', sub: 'Expand diaphragm and fill belly with warmth', duration: 4 },
    { name: 'Hold & Connect', sub: 'Feel baby resting against your amniotic cushion', duration: 4 },
    { name: 'Exhale Softly', sub: 'Release cortisol, soften shoulders and jaw', duration: 4 },
    { name: 'Rest in Bond', sub: 'Listen to the dual heartbeat cadence', duration: 4 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setPhaseIndex((curr) => (curr + 1) % phases.length);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPhase = phases[phaseIndex];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-rose-400 font-mono">
              Tactile Visualizer · Seated Safe
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight">
              Breathe with Baby
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Parasympathetic Vagus Nerve Synchronization (4-4-4-4 Box Cadence)
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">
              Active Respiration Orb
            </span>
          </div>
        </div>

        {/* Breathing Orb Dynamic Card */}
        <div className="relative overflow-hidden bg-gradient-to-b from-rose-950/30 to-slate-950/80 border border-rose-500/20 rounded-2xl p-6 text-center mb-5">
          {/* Animated Glow Halo */}
          <div className="relative mx-auto w-32 h-32 flex items-center justify-center my-2">
            <div
              className={`absolute inset-0 rounded-full bg-rose-500/20 blur-xl transition-all duration-1000 ${
                phaseIndex === 0 ? 'scale-125 bg-rose-500/30' : phaseIndex === 1 ? 'scale-150 bg-amber-500/30' : phaseIndex === 2 ? 'scale-100 bg-rose-500/20' : 'scale-90 bg-slate-500/20'
              }`}
            />
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 via-rose-400 to-amber-200 shadow-xl shadow-rose-950/60 flex flex-col items-center justify-center text-white transition-transform duration-1000 ${
                phaseIndex === 0 ? 'scale-110' : phaseIndex === 1 ? 'scale-120 ring-4 ring-rose-300/40' : phaseIndex === 2 ? 'scale-95' : 'scale-90'
              }`}
            >
              <span className="text-2xl font-bold font-mono">{secondsRemaining}s</span>
              <span className="text-[10px] uppercase tracking-wider opacity-90">{currentPhase.name.split(' ')[0]}</span>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-white mt-2">{currentPhase.name}</h4>
          <p className="text-xs text-rose-200/80 max-w-xs mx-auto mt-1">{currentPhase.sub}</p>
        </div>

        {/* Dual Heartbeat Telemetry (Maternal & Fetal Synchrony) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Maternal Heart Rate</span>
              <span className="text-rose-400 font-mono">Resting</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white font-mono">{metrics.maternalHeartRateBpm}</span>
              <span className="text-xs text-slate-400 font-mono">BPM</span>
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">Vagal tone stabilized</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Fetal Doppler Cadence</span>
              <span className="text-amber-400 font-mono">Optimal</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white font-mono">{metrics.fetalHeartRateBpm}</span>
              <span className="text-xs text-slate-400 font-mono">BPM</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Accelerations responsive</span>
          </div>
        </div>
      </div>

      {/* Return Action */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => {
            onPinchEffect();
            onReturnToDailyCheckIn();
          }}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-medium text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Return to Daily Check-In Panel</span>
        </button>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>Smooth Cross-Fade Coroutine</span>
          <span>Duration: 0.45s</span>
        </div>
      </div>
    </div>
  );
};
