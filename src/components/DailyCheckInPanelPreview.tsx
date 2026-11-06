import React from 'react';
import { MaternalMetrics } from '../types/placentaSync';

interface DailyCheckInPanelPreviewProps {
  metrics: MaternalMetrics;
  onUpdateMetrics: (updater: (prev: MaternalMetrics) => MaternalMetrics) => void;
  onTransitionToBreathe: () => void;
  onPinchEffect: () => void;
}

export const DailyCheckInPanelPreview: React.FC<DailyCheckInPanelPreviewProps> = ({
  metrics,
  onUpdateMetrics,
  onTransitionToBreathe,
  onPinchEffect,
}) => {
  const moods: Array<MaternalMetrics['selectedMood']> = ['Calm', 'Tired', 'Nesting', 'Anxious', 'Grateful', 'Restless'];

  const symptomsList = [
    'Light Braxton Hicks',
    'Mild Ankle Swelling',
    'Pelvic Pressure',
    'Back Fatigue',
    'Heartburn',
    'Healthy Energy',
  ];

  const handleMoodSelect = (mood: MaternalMetrics['selectedMood']) => {
    onPinchEffect();
    onUpdateMetrics((prev) => ({ ...prev, selectedMood: mood }));
  };

  const handleToggleSymptom = (symptom: string) => {
    onPinchEffect();
    onUpdateMetrics((prev) => {
      const exists = prev.selectedSymptoms.includes(symptom);
      return {
        ...prev,
        selectedSymptoms: exists
          ? prev.selectedSymptoms.filter((s) => s !== symptom)
          : [...prev.selectedSymptoms, symptom],
      };
    });
  };

  const handleIncrementKick = () => {
    onPinchEffect();
    onUpdateMetrics((prev) => ({ ...prev, kickCountToday: prev.kickCountToday + 1 }));
  };

  const handleDecrementKick = () => {
    onPinchEffect();
    onUpdateMetrics((prev) => ({ ...prev, kickCountToday: Math.max(0, prev.kickCountToday - 1) }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
      {/* Panel Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-rose-400 font-mono">
              Unity Canvas · PlacentaSync UI
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight">
              Daily Maternal Check-In
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Week {metrics.gestationalWeek}, Day {metrics.gestationalDay} · 3rd Trimester Sanctuary
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-2.5 py-1 bg-rose-500/10 text-rose-300 rounded border border-rose-500/20">
              0.45m Focal Distance
            </span>
          </div>
        </div>

        {/* Fetal Movement / Kick Counter */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Fetal Movement (Kick Counter)</span>
              <span className="text-2xl font-bold text-white font-mono">{metrics.kickCountToday} kicks</span>
              <span className="text-xs text-emerald-400 block mt-0.5">Healthy activity session confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrementKick}
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                title="Decrement Kick"
              >
                -
              </button>
              <button
                onClick={handleIncrementKick}
                className="w-10 h-10 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-all shadow-md shadow-rose-900/40"
                title="Increment Kick"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Mood Logging */}
        <div className="mb-4">
          <span className="text-xs font-medium text-slate-300 block mb-2">How are you feeling right now?</span>
          <div className="grid grid-cols-3 gap-2">
            {moods.map((mood) => {
              const isSelected = metrics.selectedMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium text-center transition-all ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-sm'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms Checklist */}
        <div className="mb-4">
          <span className="text-xs font-medium text-slate-300 block mb-2">Logged Physical Sensations</span>
          <div className="grid grid-cols-2 gap-2">
            {symptomsList.map((sym) => {
              const isChecked = metrics.selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  onClick={() => handleToggleSymptom(sym)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs text-left transition-all flex items-center gap-2 ${
                    isChecked
                      ? 'bg-slate-800 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-950/40 text-slate-400 border border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                    isChecked ? 'bg-rose-600 text-white' : 'border border-slate-600'
                  }`}>
                    {isChecked ? '✓' : ''}
                  </span>
                  <span className="truncate">{sym}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Action Button (Triggers State Transition in C# Controller) */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={onTransitionToBreathe}
          className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] text-white font-medium text-sm rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Begin "Breathe with Baby" Tactile Session</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>Hands-First Raycast Action</span>
          <span>Calls PlacentaSyncInteractionController.TransitionToState()</span>
        </div>
      </div>
    </div>
  );
};
