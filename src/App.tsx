import { useState, useCallback } from 'react';
import { PlacentaSyncState, StructuredLog, MaternalMetrics } from './types/placentaSync';
import { PRIMARY_CSHARP_SCRIPT } from './data/csharpScript';
import { Header } from './components/Header';
import { SpatialViewport3D } from './components/SpatialViewport3D';
import { CodeViewer } from './components/CodeViewer';
import { DailyCheckInPanelPreview } from './components/DailyCheckInPanelPreview';
import { BreatheWithBabyVisualizerPreview } from './components/BreatheWithBabyVisualizerPreview';
import { StructuredLogViewer } from './components/StructuredLogViewer';
import { UnitySetupGuide } from './components/UnitySetupGuide';

// Web Audio API soft sound synthesizer (simulating Unity AudioSource clips)
function playSynthesizedFeedback(type: 'pinch' | 'chime' | 'alert') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'pinch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'ui' | 'guide'>('simulator');
  const [currentState, setCurrentState] = useState<PlacentaSyncState>('DailyCheckIn');
  const [handDistance, setHandDistance] = useState<number>(0.42); // comfortable 0.42m seated reach
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'firstPerson' | 'ergonomicRig'>('ergonomicRig');
  const [copiedPrimary, setCopiedPrimary] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<MaternalMetrics>({
    gestationalWeek: 28,
    gestationalDay: 4,
    fetalHeartRateBpm: 142,
    maternalHeartRateBpm: 72,
    kickCountToday: 8,
    hydrationOz: 64,
    hydrationTargetOz: 80,
    selectedMood: 'Calm',
    selectedSymptoms: ['Light Braxton Hicks', 'Healthy Energy'],
  });

  const [logs, setLogs] = useState<StructuredLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString() + '.102',
      channel: 'Sanctuary',
      level: 'info',
      message:
        'Sanctuary initialized successfully. Initial State: DailyCheckIn | Ergonomic Max Reach: 0.610m (2.0 ft, Airplane-Seat Compliant) | Direct Pinch Distance: 0.120m | Meta XR SDK v81+ Hand Anchor: RightHandAnchor',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString() + '.115',
      channel: 'Sanctuary',
      level: 'info',
      message:
        'LayerMask configured for spatial UI & tactile visualizer. Target frame rate: 90Hz (Quest 3/3S). AudioSource spatialized (0.85).',
    },
    {
      id: 'init-3',
      timestamp: new Date().toLocaleTimeString() + '.140',
      channel: 'Ergonomics',
      level: 'info',
      message:
        'Ergonomic boundary active: radius restricted to 0.6096m from rightHandAnchor to eliminate maternal lumbar strain.',
    },
  ]);

  const addLog = useCallback(
    (
      channel: 'Sanctuary' | 'StateSwap' | 'Ergonomics' | 'Input' | 'Haptics',
      level: 'info' | 'warn' | 'success',
      message: string
    ) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const newEntry: StructuredLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        channel,
        level,
        message,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
    },
    []
  );

  const handleToggleState = useCallback(() => {
    const nextState = currentState === 'DailyCheckIn' ? 'BreatheWithBaby' : 'DailyCheckIn';
    setCurrentState(nextState);
    playSynthesizedFeedback('chime');

    addLog(
      'StateSwap',
      'info',
      `Transitioning [${currentState}] -> [${nextState}] | Duration: 0.45s | Easing: SmoothStep | Visualizer alpha cross-fade active.`
    );
  }, [currentState, addLog]);

  const handlePinchTrigger = useCallback(() => {
    setIsPinching(true);
    setTimeout(() => setIsPinching(false), 200);

    const isOutOfReach = handDistance > 0.6096;

    if (isOutOfReach) {
      playSynthesizedFeedback('alert');
      addLog(
        'Ergonomics',
        'warn',
        `Pinch interaction rejected: Target distance ${handDistance.toFixed(2)}m exceeds seated safety envelope of 0.61m. Clamping interaction & triggering haptic whisper.`
      );
    } else {
      playSynthesizedFeedback('pinch');
      addLog(
        'Input',
        'success',
        `Pinch confirmed via [OVRInput.Button.SecondaryIndexTrigger] at WorldPos: (0.12, -0.06, ${handDistance.toFixed(2)}) | Reach: 0.60m Safe Seated Radius.`
      );
    }
  }, [handDistance, addLog]);

  const handleCopyPrimary = () => {
    navigator.clipboard.writeText(PRIMARY_CSHARP_SCRIPT.code);
    setCopiedPrimary(true);
    addLog('Sanctuary', 'success', 'Copied PlacentaSyncInteractionController.cs to clipboard.');
    setTimeout(() => setCopiedPrimary(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (§2) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCopyPrimary={handleCopyPrimary}
        copiedPrimary={copiedPrimary}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Technical Specification Validation Hero Strip */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
                <span>Meta XR SDK v81+ Production Architecture</span>
                <span>·</span>
                <span>PlacentaSync.VR</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                PlacentaSyncInteractionController.cs
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                Hands-first, seated-optimized spatial maternal care companion with strict 2-foot (~0.60m) airplane-seat ergonomic bounds, smooth Daily Check-In to Breathe with Baby transitions, and dual OVRInput / editor fallback handling.
              </p>
            </div>

            {/* Spec Checklist Pills/Badges */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 text-xs font-mono shrink-0">
              <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Namespace: <span className="text-rose-300">PlacentaSync.VR</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Reach Limit: <span className="text-amber-300">0.6096m (2.0 ft)</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                SDK: <span className="text-emerald-300">Meta XR Core v81+</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Content Display */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* 3D Viewport */}
            <div>
              <SpatialViewport3D
                currentState={currentState}
                onToggleState={handleToggleState}
                onLog={addLog}
                handDistance={handDistance}
                setHandDistance={setHandDistance}
                isPinching={isPinching}
                onPinchTrigger={handlePinchTrigger}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>

            {/* 2-Column Layout: Live Spatial Panel Preview + Structured Log Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Maternal UI State Preview */}
              <div className="lg:col-span-5">
                {currentState === 'DailyCheckIn' ? (
                  <DailyCheckInPanelPreview
                    metrics={metrics}
                    onUpdateMetrics={setMetrics}
                    onTransitionToBreathe={handleToggleState}
                    onPinchEffect={handlePinchTrigger}
                  />
                ) : (
                  <BreatheWithBabyVisualizerPreview
                    metrics={metrics}
                    onReturnToDailyCheckIn={handleToggleState}
                    onPinchEffect={handlePinchTrigger}
                  />
                )}
              </div>

              {/* Right Column: Structured Console and Ergonomics Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                <StructuredLogViewer logs={logs} onClearLogs={() => setLogs([])} />

                {/* Quick Spec Explainer Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Ergonomic Validation Test Matrix</span>
                    <span className="font-mono text-rose-400">Airplane-Seat Verified</span>
                  </div>
                  <p className="text-slate-400">
                    Test the reach slider above: when extending beyond <code className="text-amber-300 font-mono">0.60m</code>, the interaction ray and reticle clamp to the 2.0 ft boundary, preventing pregnant mothers from leaning forward or colliding with tray tables / chair armrests.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block">Direct Touch</span>
                      <span className="text-emerald-400 font-bold">&le; 0.12m</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block">Comfort Raycast</span>
                      <span className="text-sky-400 font-bold">0.12m – 0.60m</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block">Clamp Safety</span>
                      <span className="text-amber-400 font-bold">&gt; 0.6096m</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block">State Fade</span>
                      <span className="text-purple-400 font-bold">0.45s Ease</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <CodeViewer onLog={addLog} />
          </div>
        )}

        {activeTab === 'ui' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <DailyCheckInPanelPreview
              metrics={metrics}
              onUpdateMetrics={setMetrics}
              onTransitionToBreathe={handleToggleState}
              onPinchEffect={handlePinchTrigger}
            />
            <BreatheWithBabyVisualizerPreview
              metrics={metrics}
              onReturnToDailyCheckIn={handleToggleState}
              onPinchEffect={handlePinchTrigger}
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <UnitySetupGuide />
          </div>
        )}
      </main>

      {/* Clean Footer (§1.B) */}
      <footer className="border-t border-slate-800 py-6 px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            PlacentaSync VR · Meta XR SDK v81+ Seated Maternal Care Spatial Companion
          </div>
          <div className="flex items-center gap-4">
            <span>Unity 2022.3 LTS & Unity 6</span>
            <span>·</span>
            <span>Zero 3rd-Party Dependencies</span>
            <span>·</span>
            <span>TextMeshPro & Unity UI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
