// Core MDR Game Types

export interface Point {
  x: number;
  y: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Four Tempers System
export type TemperType = 'WO' | 'FC' | 'DR' | 'MA';

export interface Temper {
  id: TemperType;
  fullName: string;
  description: string;
  color: string;
  targetNumbers: number[];
}

// Number Entity
export interface NumberEntity {
  id: string;
  value: number;
  position: Point;
  worldPosition: Point;
  temper: TemperType;
  color: string;
  baseColor: string;
  scale: number;
  isPinned: boolean;
  pinStrength: number;
  driftOffset: Point;
  targetColor: string;
  isScary: boolean;
  wellupIntensity: number;
}

// Cursor State
export interface CursorState {
  position: Point;
  worldPosition: Point;
  mode: 'exploration' | 'pinpoint';
  velocity: Vector2;
  targetPosition: Point;
  isMoving: boolean;
  glowIntensity: number;
}

// Lasso State
export interface LassoState {
  points: Point[];
  isActive: boolean;
  isClosed: boolean;
  capturedNumbers: string[];
  centerPoint: Point;
}

// Game State
export interface GameState {
  session: {
    id: string;
    fileName: string;
    startTime: number;
    progress: number;
    targetTemper: TemperType | null;
    capturedNumbers: string[];
    score: number;
    combo: number;
  };
  world: {
    viewport: Rectangle;
    worldSize: { width: number; height: number };
    scale: number;
    numbers: NumberEntity[];
    gridSize: { cols: number; rows: number };
  };
  cursor: CursorState;
  lasso: LassoState;
  ui: {
    statusBar: {
      isVisible: boolean;
      progress: number;
      timeElapsed: string;
    };
    bottomBar: {
      activeTemper: TemperType | null;
      temperProgress: Record<TemperType, number>;
      isComplete: Record<TemperType, boolean>;
    };
    feedback: {
      isVisible: boolean;
      type: 'success' | 'failure' | 'neutral';
      message: string;
      timestamp: number;
    };
  };
}

// Input State
export interface InputState {
  touchPosition: Point | null;
  touchStartTime: number | null;
  touchDuration: number;
  isPinpointMode: boolean;
  steeringInput: Vector2;
  lastPanDelta: Vector2;
}

// Animation State
export interface AnimationState {
  frameCount: number;
  lastFrameTime: number;
  fps: number;
  isRunning: boolean;
}

// Feedback Types
export interface FeedbackOptions {
  visual: {
    duration: number;
    intensity: number;
    color: string;
  };
  audio: {
    frequency: number | number[];
    duration: number;
    type: 'harmonic' | 'discordant' | 'system';
  };
  haptic: {
    pattern: 'success' | 'failure' | 'light' | 'sharp';
    intensity: number;
    duration: number;
  };
}

// Performance Metrics
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  inputLatency: number;
  memoryUsage: number;
  renderTime: number;
}

// Game Configuration
export interface GameConfig {
  world: {
    gridSize: { cols: number; rows: number };
    cellSize: number;
    cellSpacing: number;
    numberDensity: number;
  };
  cursor: {
    maxVelocity: number;
    acceleration: number;
    friction: number;
    glowRadius: number;
  };
  lasso: {
    width: number;
    opacity: number;
    autoCloseDistance: number;
    minimumLoopSize: number;
  };
  animation: {
    targetFPS: number;
    numberDriftSpeed: number;
    breathingAmplitude: number;
    breathingFrequency: number;
  };
  feedback: {
    success: FeedbackOptions;
    failure: FeedbackOptions;
    modeSwitch: FeedbackOptions;
  };
}