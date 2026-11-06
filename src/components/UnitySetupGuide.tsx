import React from 'react';

export const UnitySetupGuide: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-wider text-rose-400 font-mono">
          Meta XR Core SDK v81+ & Unity 2022.3+ LTS Architecture Guide
        </div>
        <h3 className="text-xl font-semibold text-white tracking-tight mt-1">
          Unity Inspector Wiring & Scene Integration
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Complete blueprint for dropping <code className="text-rose-300 font-mono">PlacentaSyncInteractionController.cs</code> directly into your Unity XR scene.
        </p>
      </div>

      {/* Grid: Hierarchy vs Inspector Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hierarchy Tree */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-mono font-medium text-slate-300">Scene Hierarchy Layout</span>
            <span className="text-[11px] text-slate-500 font-mono">OVRCameraRig Structure</span>
          </div>

          <div className="font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <div className="text-sky-400 font-semibold">▾ PlacentaSync_Sanctuary (Root)</div>
            <div className="pl-4 text-slate-400">▾ OVRCameraRig [Meta XR SDK v81+]</div>
            <div className="pl-8 text-slate-400">▾ TrackingSpace</div>
            <div className="pl-12 text-slate-300">├ CenterEyeAnchor (Camera.main)</div>
            <div className="pl-12 text-slate-400">├ LeftHandAnchor</div>
            <div className="pl-12 text-rose-300 font-semibold">
              └ RightHandAnchor <span className="text-slate-500">→ [Assigned to rightHandAnchor]</span>
            </div>
            <div className="pl-16 text-slate-400">├ InteractionRay (LineRenderer)</div>
            <div className="pl-16 text-slate-400">└ ReticleCursor (World Mesh + ReticleSafeMat)</div>
            <div className="pl-4 text-emerald-400 font-semibold mt-2">
              ▾ PlacentaSync_Controller [PlacentaSyncInteractionController.cs]
            </div>
            <div className="pl-8 text-slate-300">
              ├ DailyCheckIn_Panel (Canvas WorldSpace, CanvasGroup, GraphicRaycaster)
            </div>
            <div className="pl-8 text-slate-300">
              └ BreatheWithBaby_Visualizer (GameObject, TactileBreatheVisualizer.cs)
            </div>
            <div className="pl-12 text-slate-400">├ RespirationOrb (SphereMesh + Emissive Shader)</div>
            <div className="pl-12 text-slate-400">└ AmnioticParticleAura (ParticleSystem)</div>
          </div>
        </div>

        {/* Inspector Fields Table */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-mono font-medium text-slate-300">Inspector Properties Reference</span>
            <span className="text-[11px] text-slate-500 font-mono">Serialized Fields</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="pb-1.5">Property</th>
                  <th className="pb-1.5">Type</th>
                  <th className="pb-1.5">Recommended Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-1.5 text-rose-300">rightHandAnchor</td>
                  <td className="py-1.5 text-slate-400">Transform</td>
                  <td className="py-1.5 text-slate-200">TrackingSpace/RightHandAnchor</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-rose-300">dailyCheckInCanvasGroup</td>
                  <td className="py-1.5 text-slate-400">CanvasGroup</td>
                  <td className="py-1.5 text-slate-200">DailyCheckIn Canvas</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-rose-300">breatheWithBabyVisualizer</td>
                  <td className="py-1.5 text-slate-400">GameObject</td>
                  <td className="py-1.5 text-slate-200">BreatheWithBaby_Visualizer</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-rose-300">stateTransitionDuration</td>
                  <td className="py-1.5 text-slate-400">float</td>
                  <td className="py-1.5 text-emerald-400">0.45 seconds</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-rose-300">MAX_SEATED_REACH_METERS</td>
                  <td className="py-1.5 text-slate-400">const float</td>
                  <td className="py-1.5 text-amber-300">0.6096f (2.0 feet)</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-rose-300">DIRECT_PINCH_THRESHOLD</td>
                  <td className="py-1.5 text-slate-400">const float</td>
                  <td className="py-1.5 text-emerald-400">0.12f (12 cm)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Airplane-Seat Seated Ergonomics Clinical Rationale */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Clinical & Spatial Rationale: The "Airplane-Seat" Ergonomic Standard
        </h4>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            During the 2nd and 3rd trimesters, expectant mothers experience biomechanical shifts—including lordosis, pelvic girdle softening from relaxin, and reduced forward thoracic flexion. Traditional VR interactions that require reaching forward 1.0m+ or flailing arms cause immediate postural destabilization and abdominal compression.
          </p>
          <p>
            <strong className="text-rose-300">The PlacentaSync Ergonomic Rule:</strong> All UI elements, interactable sliders, and respiration tactile foci are restricted to a <span className="font-mono text-rose-200">0.6096m (2-foot)</span> envelope measured from the hand anchor. If a mother attempts an over-extended gesture, the raycast clamps gracefully to the boundary and returns gentle haptic micro-feedback, keeping the mother in full parasympathetic repose without lumbar torque.
          </p>
        </div>
      </div>
    </div>
  );
};
