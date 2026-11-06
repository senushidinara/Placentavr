import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlacentaSyncState } from '../types/placentaSync';

interface SpatialViewport3DProps {
  currentState: PlacentaSyncState;
  onToggleState: () => void;
  onLog: (channel: 'Sanctuary' | 'StateSwap' | 'Ergonomics' | 'Input' | 'Haptics', level: 'info' | 'warn' | 'success', message: string) => void;
  handDistance: number;
  setHandDistance: (dist: number) => void;
  isPinching: boolean;
  onPinchTrigger: () => void;
  viewMode: 'firstPerson' | 'ergonomicRig';
  setViewMode: (mode: 'firstPerson' | 'ergonomicRig') => void;
}

export const SpatialViewport3D: React.FC<SpatialViewport3DProps> = ({
  currentState,
  onToggleState,
  onLog,
  handDistance,
  setHandDistance,
  isPinching,
  onPinchTrigger,
  viewMode,
  setViewMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(currentState);
  stateRef.current = currentState;

  const [respirationPhase, setRespirationPhase] = useState<string>('Inhale');
  const [breatheSeconds, setBreatheSeconds] = useState<number>(4);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mesh refs for animation
  const handAnchorMeshRef = useRef<THREE.Group | null>(null);
  const rayLineRef = useRef<THREE.Line | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const breatheOrbRef = useRef<THREE.Mesh | null>(null);
  const breatheAuraParticlesRef = useRef<THREE.Points | null>(null);
  const dailyPanelMeshRef = useRef<THREE.Group | null>(null);
  const breathePanelMeshRef = useRef<THREE.Group | null>(null);
  const clampIndicatorRef = useRef<THREE.Mesh | null>(null);

  // Animation values
  const transitionProgress = useRef<number>(currentState === 'DailyCheckIn' ? 0 : 1);
  const breatheTimer = useRef<number>(0);

  // Seated ergonomic constant
  const MAX_REACH = 0.6096; // 2.0 feet

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.45);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 50);
    cameraRef.current = camera;
    if (viewMode === 'firstPerson') {
      camera.position.set(0, 0.05, 0); // eye level of seated mother
      camera.lookAt(0, 0, 0.6);
    } else {
      camera.position.set(0.75, 0.45, 0.35); // ergonomic profile view
      camera.lookAt(0, 0, 0.35);
    }

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x2d3748, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    keyLight.position.set(1, 2, 1);
    scene.add(keyLight);

    const warmUnderGlow = new THREE.PointLight(0xf472b6, 2.0, 3.0);
    warmUnderGlow.position.set(0, -0.2, 0.45);
    scene.add(warmUnderGlow);

    // 1. Seated Ergonomic Safety Envelope (0.6096m radius sphere)
    const sphereGeo = new THREE.SphereGeometry(MAX_REACH, 32, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const ergonomicSphere = new THREE.Mesh(sphereGeo, sphereMat);
    ergonomicSphere.position.set(0, 0, 0);
    scene.add(ergonomicSphere);

    // Floor grid & concentric seated safe rings
    const gridHelper = new THREE.GridHelper(2, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.55;
    scene.add(gridHelper);

    // 0.6m Reach Ring on floor
    const ringGeo = new THREE.RingGeometry(MAX_REACH - 0.005, MAX_REACH + 0.005, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const reachFloorRing = new THREE.Mesh(ringGeo, ringMat);
    reachFloorRing.rotation.x = Math.PI / 2;
    reachFloorRing.position.y = -0.54;
    scene.add(reachFloorRing);

    // Seated Chair & Mother Silhouette Reference
    const chairGroup = new THREE.Group();
    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.65, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    chairBack.position.set(0, 0.1, -0.22);
    chairGroup.add(chairBack);

    const chairSeat = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.06, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    chairSeat.position.set(0, -0.2, -0.05);
    chairGroup.add(chairSeat);

    // Armrests (illustrates the "airplane seat" constrained space)
    const armrestLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.18, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    armrestLeft.position.set(-0.24, -0.08, -0.05);
    chairGroup.add(armrestLeft);

    const armrestRight = armrestLeft.clone();
    armrestRight.position.x = 0.24;
    chairGroup.add(armrestRight);

    scene.add(chairGroup);

    // 2. Right Hand Anchor & Stylized Spatial Pointer
    const handGroup = new THREE.Group();
    handAnchorMeshRef.current = handGroup;

    // Stylized hand palm & pointing index
    const palmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.02, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3, metalness: 0.2 })
    );
    handGroup.add(palmMesh);

    const indexMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.045),
      new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0x881337 })
    );
    indexMesh.rotation.x = Math.PI / 2;
    indexMesh.position.set(0.015, 0, 0.04);
    handGroup.add(indexMesh);

    scene.add(handGroup);

    // 3. Ergonomic Raycast Line
    const rayPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0.45)];
    const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
    const rayMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.85 });
    const rayLine = new THREE.Line(rayGeo, rayMat);
    rayLineRef.current = rayLine;
    scene.add(rayLine);

    // 4. Reticle Cursor
    const reticleGeo = new THREE.RingGeometry(0.012, 0.018, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticleRef.current = reticle;
    scene.add(reticle);

    // Clamped visual warning indicator ring
    const clampGeo = new THREE.RingGeometry(0.025, 0.03, 32);
    const clampMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const clampRing = new THREE.Mesh(clampGeo, clampMat);
    clampIndicatorRef.current = clampRing;
    scene.add(clampRing);

    // 5. Daily Check-In Spatial Panel (at comfortable 0.45m distance)
    const dailyPanelGroup = new THREE.Group();
    dailyPanelMeshRef.current = dailyPanelGroup;
    dailyPanelGroup.position.set(0, 0, 0.45);

    // Curved backing plane
    const panelBacking = new THREE.Mesh(
      new THREE.PlaneGeometry(0.48, 0.32),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.4,
        metalness: 0.3,
        transparent: true,
        opacity: 0.92,
      })
    );
    dailyPanelGroup.add(panelBacking);

    // Border highlight
    const panelBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.48, 0.32)),
      new THREE.LineBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.6 })
    );
    dailyPanelGroup.add(panelBorder);

    // Interactive button mockup inside the panel in 3D
    const btnMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.045, 0.01),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, emissive: 0x4c0519 })
    );
    btnMesh.position.set(0, -0.09, 0.01);
    dailyPanelGroup.add(btnMesh);

    scene.add(dailyPanelGroup);

    // 6. Breathe with Baby Tactile Visualizer Orb (Center at 0.45m)
    const breatheGroup = new THREE.Group();
    breathePanelMeshRef.current = breatheGroup;
    breatheGroup.position.set(0, 0, 0.45);

    // Bioluminescent Tactile Respiration Orb
    const orbGeo = new THREE.SphereGeometry(0.12, 48, 48);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0x9f1239,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    const breatheOrb = new THREE.Mesh(orbGeo, orbMat);
    breatheOrbRef.current = breatheOrb;
    breatheGroup.add(breatheOrb);

    // Inner glowing core
    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffedd5, transparent: true, opacity: 0.95 })
    );
    breatheGroup.add(innerCore);

    // Amniotic Particle Aura
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 0.16 + Math.random() * 0.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfecdd3,
      size: 0.008,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    breatheAuraParticlesRef.current = particles;
    breatheGroup.add(particles);

    scene.add(breatheGroup);

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // State transition animation
      const targetTransition = stateRef.current === 'DailyCheckIn' ? 0 : 1;
      transitionProgress.current = THREE.MathUtils.lerp(transitionProgress.current, targetTransition, delta * 5.0);
      const t = transitionProgress.current;

      // Cross-fade panels
      if (dailyPanelMeshRef.current) {
        dailyPanelMeshRef.current.scale.setScalar(1 - t * 0.2);
        dailyPanelMeshRef.current.position.y = -t * 0.15;
        dailyPanelMeshRef.current.visible = t < 0.98;
      }

      if (breathePanelMeshRef.current) {
        breathePanelMeshRef.current.scale.setScalar(0.7 + t * 0.3);
        breathePanelMeshRef.current.position.y = (1 - t) * 0.15;
        breathePanelMeshRef.current.visible = t > 0.02;
      }

      // Procedural Respiration Breathing Cycle (4s Inhale, 4s Hold, 4s Exhale, 4s Rest)
      breatheTimer.current = (breatheTimer.current + delta) % 16.0;
      const bTime = breatheTimer.current;
      let scaleMult = 1.0;
      let phaseName = 'Inhale';
      let secLeft = 4 - Math.floor(bTime % 4);

      if (bTime < 4.0) {
        // Inhale 0 to 4
        phaseName = 'Inhale (Deeply)';
        const progress = bTime / 4.0;
        scaleMult = 0.85 + 0.45 * Math.sin((progress * Math.PI) / 2);
      } else if (bTime < 8.0) {
        // Hold 4 to 8
        phaseName = 'Hold (Connect)';
        scaleMult = 1.3 + 0.03 * Math.sin(elapsed * 4); // subtle fetal heartbeat ripple
      } else if (bTime < 12.0) {
        // Exhale 8 to 12
        phaseName = 'Exhale (Softly)';
        const progress = (bTime - 8.0) / 4.0;
        scaleMult = 1.3 - 0.45 * Math.sin((progress * Math.PI) / 2);
      } else {
        // Rest 12 to 16
        phaseName = 'Rest (Bond)';
        scaleMult = 0.85;
      }

      setRespirationPhase(phaseName);
      setBreatheSeconds(secLeft);

      if (breatheOrbRef.current && t > 0.05) {
        breatheOrbRef.current.scale.setScalar(scaleMult);
        breatheOrbRef.current.rotation.y = elapsed * 0.3;
        breatheOrbRef.current.rotation.x = elapsed * 0.15;
      }

      if (breatheAuraParticlesRef.current && t > 0.05) {
        breatheAuraParticlesRef.current.rotation.y = -elapsed * 0.25;
      }

      // Position hand anchor
      // In seated airplane ergonomic mode, right hand anchor is typically offset slightly to the right (+0.12m)
      if (handAnchorMeshRef.current) {
        handAnchorMeshRef.current.position.set(0.12, -0.06, handDistance);
      }

      // Process ergonomic raycast endpoint and 0.6m clamp
      const handPos = new THREE.Vector3(0.12, -0.06, handDistance);
      const isClamped = handDistance > MAX_REACH;

      let rayEndDist = 0.45; // targeting the panel at 0.45m
      let rayTargetPos = new THREE.Vector3(0, 0, 0.45);

      if (isClamped) {
        // Ray clamped to 0.6096m safety boundary
        const dir = new THREE.Vector3().subVectors(rayTargetPos, handPos).normalize();
        rayTargetPos = handPos.clone().add(dir.multiplyScalar(0.1));
      }

      if (rayLineRef.current) {
        const positions = rayLineRef.current.geometry.attributes.position.array as Float32Array;
        positions[0] = handPos.x;
        positions[1] = handPos.y;
        positions[2] = handPos.z;
        positions[3] = rayTargetPos.x;
        positions[4] = rayTargetPos.y;
        positions[5] = rayTargetPos.z;
        rayLineRef.current.geometry.attributes.position.needsUpdate = true;

        const rayMat = rayLineRef.current.material as THREE.LineBasicMaterial;
        rayMat.color.setHex(isClamped ? 0xf59e0b : 0xf43f5e);
      }

      if (reticleRef.current) {
        reticleRef.current.position.copy(rayTargetPos);
        reticleRef.current.lookAt(camera.position);
        const reticleMat = reticleRef.current.material as THREE.MeshBasicMaterial;
        reticleMat.color.setHex(isClamped ? 0xf59e0b : 0xf43f5e);
      }

      if (clampIndicatorRef.current) {
        clampIndicatorRef.current.position.copy(rayTargetPos);
        clampIndicatorRef.current.lookAt(camera.position);
        const clampMat = clampIndicatorRef.current.material as THREE.MeshBasicMaterial;
        clampMat.opacity = isClamped ? 0.8 : 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [viewMode]);

  // Update camera on viewMode toggle
  useEffect(() => {
    if (!cameraRef.current) return;
    if (viewMode === 'firstPerson') {
      cameraRef.current.position.set(0, 0.05, 0);
      cameraRef.current.lookAt(0, 0, 0.5);
    } else {
      cameraRef.current.position.set(0.78, 0.42, 0.35);
      cameraRef.current.lookAt(0, -0.05, 0.35);
    }
  }, [viewMode]);

  const handleSimulatePinch = () => {
    onPinchTrigger();
  };

  const isOutOfReach = handDistance > MAX_REACH;

  return (
    <div className="relative w-full h-[460px] lg:h-[540px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs backdrop-blur-md">
            <span className="text-slate-400">Ergonomic Radius:</span>
            <span className={`font-mono font-semibold ${isOutOfReach ? 'text-amber-400' : 'text-rose-400'}`}>
              {(MAX_REACH * 3.28084).toFixed(1)} ft ({MAX_REACH.toFixed(2)}m)
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs backdrop-blur-md">
            <span className="text-slate-400">Right Hand Reach:</span>
            <span className={`font-mono font-semibold ${isOutOfReach ? 'text-amber-400' : 'text-emerald-400'}`}>
              {handDistance.toFixed(2)}m {isOutOfReach ? '⚠ CLAMPED' : '✓ SAFE'}
            </span>
          </div>
        </div>

        {/* View Mode Segmented Switch */}
        <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg pointer-events-auto backdrop-blur-md">
          <button
            onClick={() => setViewMode('ergonomicRig')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'ergonomicRig' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Seated Ergonomic Rig View
          </button>
          <button
            onClick={() => setViewMode('firstPerson')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'firstPerson' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mother Seated POV (VR Headset)
          </button>
        </div>
      </div>

      {/* Floating State Info Badge (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto flex flex-col gap-2 max-w-xs">
        <div className="p-3 bg-slate-900/90 border border-slate-800/90 rounded-xl backdrop-blur-md text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Spatial Active State</span>
            <span className="font-mono text-slate-500">OVRCameraRig v81</span>
          </div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {currentState === 'DailyCheckIn' ? 'Daily Check-In Panel' : 'Breathe with Baby Visualizer'}
          </div>

          {currentState === 'BreatheWithBaby' && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-rose-300 flex items-center justify-between">
              <span>{respirationPhase}</span>
              <span className="font-mono">{breatheSeconds}s remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Testing Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto flex items-center gap-3">
        {/* Distance Slider */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md text-xs">
          <span className="text-slate-400 whitespace-nowrap">Hand Reach:</span>
          <input
            type="range"
            min="0.20"
            max="0.85"
            step="0.01"
            value={handDistance}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setHandDistance(val);
              if (val > MAX_REACH) {
                onLog('Ergonomics', 'warn', `Hand anchor extension (${val.toFixed(2)}m) exceeds 0.60m seated threshold. Raycast clamped.`);
              }
            }}
            className="w-24 accent-rose-500 cursor-pointer"
          />
          <span className="font-mono text-slate-300 w-10 text-right">{handDistance.toFixed(2)}m</span>
        </div>

        {/* Simulate Pinch Button (OVRInput trigger simulation) */}
        <button
          onClick={handleSimulatePinch}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-medium text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Simulate Hand Pinch (OVRInput)
        </button>

        {/* Toggle State Button */}
        <button
          onClick={onToggleState}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-medium text-xs rounded-xl border border-slate-700 transition-all whitespace-nowrap"
        >
          Toggle Sanctuary State
        </button>
      </div>
    </div>
  );
};
