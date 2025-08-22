# MDR Severance-Inspired Design System

## Visual Language

### Color Palette
```typescript
const SeverancePalette = {
  // Base colors
  background: '#0a0f1a',        // Deep blue-black
  primaryText: '#00ffcc',       // Cyan numerals
  secondaryText: '#66ff99',     // Lighter green highlights
  focusGlow: '#00ffcc80',       // Soft cyan bloom (50% opacity)
  
  // Four Tempers classification colors
  woe: '#ff4444',               // WO - Red (fear, sadness)
  frolic: '#44ff44',            // FC - Green (joy, humor)  
  dread: '#ffaa44',             // DR - Orange (anxiety, worry)
  malice: '#aa44ff',            // MA - Purple (anger, spite)
  
  // UI elements
  statusBar: '#1a2030',         // Status strip background
  binActive: '#00ffcc',         // Active bin highlight
  binInactive: '#334455',       // Inactive bin color
  progress: '#00ffcc',          // Progress indicator
  
  // Interactive states
  cursorTrail: '#00ffcc66',     // Lasso trail (40% opacity)
  numberPinned: '#ffff0066',    // Pinned number highlight
  captureSuccess: '#44ff44',    // Success feedback
  captureFailure: '#ff4444',    // Failure feedback
} as const;
```

### Typography System
```typescript
const SeveranceTypography = {
  // Monospaced digits for grid consistency
  numberFont: {
    fontFamily: 'JetBrains Mono',  // or 'SF Mono', 'Consolas'
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
  },
  
  // UI text
  labelFont: {
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  // Status text
  statusFont: {
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
} as const;
```

## Layout Specifications

### Screen Composition
```typescript
interface SeveranceLayout {
  // Status strip (top)
  statusHeight: 40;              // Fixed height in pixels
  statusPadding: 16;             // Horizontal padding
  
  // Main grid area
  gridMargin: 16;                // Margin around grid
  cellSize: 24;                  // Fixed cell size for numbers
  cellSpacing: 2;                // Space between cells
  
  // Bottom control bar
  bottomBarHeight: 80;           // Height for bin controls
  binWidth: 60;                  // Width of each temper bin
  binHeight: 50;                 // Height of temper bins
  binSpacing: 8;                 // Space between bins
  
  // Progress indicator
  progressHeight: 4;             // Progress bar thickness
  progressMargin: 8;             // Space above bins
}
```

### Grid System
```typescript
interface GridSpecification {
  // World grid (larger than viewport)
  worldGridWidth: 50;            // Columns in world
  worldGridHeight: 80;           // Rows in world
  
  // Viewport (visible area)
  viewportCols: 15;              // Visible columns
  viewportRows: 25;              // Visible rows (portrait)
  
  // Grid behaviors
  numberDensity: 0.85;           // Percentage of cells filled
  clusterSize: { min: 3, max: 8 }; // Range of cluster sizes
  driftSpeed: 0.5;               // Base animation speed
}
```

## Four Tempers System

### Temper Classifications
```typescript
interface TemperSystem {
  tempers: {
    WO: {
      fullName: 'Woe',
      description: 'Fear, sadness, melancholy',
      color: '#ff4444',
      targetNumbers: [1, 3, 7, 13, 17], // Example scary numbers
    },
    FC: {
      fullName: 'Frolic', 
      description: 'Joy, humor, whimsy',
      color: '#44ff44',
      targetNumbers: [0, 5, 8, 21, 34], // Example joyful numbers
    },
    DR: {
      fullName: 'Dread',
      description: 'Anxiety, worry, apprehension', 
      color: '#ffaa44',
      targetNumbers: [2, 6, 11, 18, 23], // Example anxious numbers
    },
    MA: {
      fullName: 'Malice',
      description: 'Anger, spite, hatred',
      color: '#aa44ff', 
      targetNumbers: [4, 9, 14, 19, 27], // Example angry numbers
    }
  },
  
  // Session structure
  sessionTarget: 100;            // Numbers to capture per session
  quotaPerTemper: 25;            // Numbers needed per temper
  
  // Dynamic difficulty
  scaryNumberChance: 0.15;       // Probability of scary number spawn
  clusterWellupFrequency: 8000;  // ms between cluster events
}
```

## Animation Behaviors

### Number Drift System
```typescript
interface NumberAnimations {
  // Base drift behavior
  breatheAmplitude: 0.02;        // Subtle scale breathing
  breatheFrequency: 2.0;         // Breaths per second
  
  // Position drift
  positionDrift: 0.5;            // Max pixels of position drift
  driftFrequency: 0.3;           // Drift cycles per second
  
  // Cluster behaviors
  wellupAnimation: {
    duration: 1500,              // ms for wellup effect
    scaleIncrease: 1.3,          // Scale multiplier
    glowIntensity: 0.6,          // Glow effect strength
  },
  
  // Scary number emphasis
  scaryEmphasis: {
    scaleVariation: 0.15,        // Extra scale jitter
    colorShift: 0.1,             // Slight color shift
    pulseFrequency: 1.5,         // Pulses per second
  }
}
```

### Cursor & Lasso Effects
```typescript
interface CursorEffects {
  // Cursor glow
  cursorGlow: {
    radius: 8,                   // Glow radius in pixels
    intensity: 0.4,              // Glow opacity
    color: SeverancePalette.focusGlow,
  },
  
  // Lasso trail
  lassoTrail: {
    width: 2,                    // Trail thickness
    opacity: 0.6,               // Trail opacity
    fadeDistance: 100,           // Pixels before fade starts
    segmentLength: 3,            // Pixels between trail points
  },
  
  // Pinning effect
  numberPinning: {
    pinRadius: 20,               // Distance for pinning effect
    slowdownFactor: 0.2,         // Speed reduction when pinned
    highlightIntensity: 0.4,     // Visual highlight strength
    transitionDuration: 200,     // ms for pin/unpin transition
  }
}
```

## UI Component Specifications

### Status Bar Component
```typescript
interface StatusBarState {
  fileName: string;              // e.g., "TEMPER_SORT_A47.mdr"
  progress: number;              // 0-100 percentage complete
  timeElapsed: string;           // "00:03:45" format
  activeTemper: 'WO' | 'FC' | 'DR' | 'MA' | null;
}

// Example status display:
// "TEMPER_SORT_A47.mdr    67%    00:03:45    [FC]"
```

### Bottom Bin Controls
```typescript
interface TemperBinComponent {
  temper: keyof TemperSystem['tempers'];
  isActive: boolean;
  quota: number;                 // Numbers needed
  captured: number;              // Numbers captured so far
  isComplete: boolean;           // Quota reached
  
  // Visual states
  glowEffect: boolean;           // Active selection glow
  progressFill: number;          // 0-1 fill percentage
  pulseOnCapture: boolean;       // Brief pulse on successful capture
}
```

### Progress Indicator
```typescript
interface ProgressIndicator {
  overall: number;               // 0-100 overall session progress
  byTemper: {                    // Progress per temper
    WO: number;
    FC: number; 
    DR: number;
    MA: number;
  };
  
  // Visual representation
  segmentedBar: true;            // Show segments for each temper
  colorCoding: true;             // Use temper colors in progress
  animateProgress: true;         // Smooth transitions
}
```

## Interaction Refinements

### Gesture Behavior Updates
```typescript
interface SeveranceGestures {
  // Exploration cursor refinements
  cursorInertia: 0.92;           // Higher inertia for floating feel
  cursorGlowOnMovement: true;    // Glow intensifies with movement
  
  // Pinpoint mode adjustments
  steeringCenter: 'dynamic';     // Center follows initial touch
  steeringDeadzone: 0.08;        // Slightly larger deadzone
  crosshairVisual: true;         // Show crosshair in pinpoint mode
  
  // Lasso improvements
  autoCloseDistance: 15;         // Pixels to auto-close lasso
  minimumLoopSize: 40;           // Minimum viable lasso size
  pinningPreview: true;          // Show which numbers will be pinned
}
```

### Feedback System Enhancements
```typescript
interface SeveranceFeedback {
  // Success feedback (harmonic)
  success: {
    visualGlow: 300,             // ms glow duration
    hapticPattern: 'success',    // Smooth pulse
    audioTone: 'harmonic',       // Pleasant chord
    scorePopup: true,            // Brief +score display
  },
  
  // Failure feedback (discordant)
  failure: {
    visualShake: 150,            // ms shake duration  
    hapticPattern: 'error',      // Sharp buzz
    audioTone: 'discordant',     // Harsh tone
    lassoDissolve: true,         // Lasso dissolves on failure
  },
  
  // Mode transitions
  modeSwitch: {
    visualTransition: 200,       // ms for visual state change
    hapticTick: 'light',         // Subtle confirmation
    audioBeep: 'system',         // UI confirmation tone
  }
}
```

## Technical Implementation Notes

### Skia Rendering Optimizations for Severance Aesthetic
```typescript
interface SeveranceRenderingStrategy {
  // Typography rendering
  useSignedDistanceFields: true;  // Crisp text at all scales
  subpixelRendering: true;        // Sharp monospace alignment
  
  // Glow effects
  useShaders: true;               // GPU-based glow rendering
  bloomRadius: 4;                 // Soft bloom around elements
  
  // Grid rendering
  instancedNumberRendering: true; // Batch number draws
  frustumCulling: true;          // Only render visible cells
  
  // Animation smoothing
  interpolationQuality: 'high';   // Smooth drift animations
  vsyncAlignment: true;           // Eliminate frame tearing
}
```

This Severance-inspired design system provides the concrete visual and interaction specifications needed to create an authentic MDR experience that captures the uncanny, retro-futurist aesthetic of the show while maintaining the high-performance requirements of our React Native + Skia + Reanimated architecture.