export type PlacentaSyncState = 'DailyCheckIn' | 'BreatheWithBaby';

export interface StructuredLog {
  id: string;
  timestamp: string;
  channel: 'Sanctuary' | 'StateSwap' | 'Ergonomics' | 'Input' | 'Haptics';
  level: 'info' | 'warn' | 'success';
  message: string;
  details?: Record<string, any>;
}

export interface MaternalMetrics {
  gestationalWeek: number;
  gestationalDay: number;
  fetalHeartRateBpm: number;
  maternalHeartRateBpm: number;
  kickCountToday: number;
  hydrationOz: number;
  hydrationTargetOz: number;
  selectedMood: 'Calm' | 'Tired' | 'Nesting' | 'Anxious' | 'Grateful' | 'Restless';
  selectedSymptoms: string[];
}

export interface HandAnchorState {
  x: number; // in meters (-0.3 to 0.3)
  y: number; // in meters (-0.2 to 0.3)
  z: number; // distance forward from chest (0.15 to 0.9m)
  isPinching: boolean;
  distanceFromAnchor: number;
  isWithinErgonomicBounds: boolean; // <= 0.6096m (2 feet)
  isHoveringInteractable: boolean;
}
