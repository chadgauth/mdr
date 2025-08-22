// Severance-Inspired MDR Design System

// Color Palette
export const SeveranceColors = {
  // Base colors (OKLCH format)
  background: 'oklch(0.08 0.05 260)',        // Deep blue-black
  primaryText: 'oklch(0.85 0.15 180)',       // Cyan numerals
  secondaryText: 'oklch(0.80 0.12 150)',     // Lighter green highlights
  focusGlow: 'oklch(0.85 0.15 180 / 0.5)',   // Soft cyan bloom (50% opacity)
  
  // Four Tempers classification colors (OKLCH)
  woe: 'oklch(0.65 0.25 15)',                // WO - Red (fear, sadness)
  frolic: 'oklch(0.75 0.20 140)',            // FC - Green (joy, humor)
  dread: 'oklch(0.75 0.15 60)',              // DR - Orange (anxiety, worry)
  malice: 'oklch(0.65 0.25 300)',            // MA - Purple (anger, spite)
  
  // UI elements (OKLCH)
  statusBar: 'oklch(0.20 0.03 260)',         // Status strip background
  binActive: 'oklch(0.85 0.15 180)',         // Active bin highlight
  binInactive: 'oklch(0.40 0.05 260)',       // Inactive bin color
  progress: 'oklch(0.85 0.15 180)',          // Progress indicator
  
  // Interactive states (OKLCH)
  cursorTrail: 'oklch(0.85 0.15 180 / 0.4)', // Lasso trail (40% opacity)
  numberPinned: 'oklch(0.90 0.20 80 / 0.4)', // Pinned number highlight
  captureSuccess: 'oklch(0.75 0.20 140)',    // Success feedback
  captureFailure: 'oklch(0.65 0.25 15)',     // Failure feedback
  
  // Animation colors (OKLCH)
  wellupGlow: 'oklch(0.95 0.02 180 / 0.25)', // Cluster wellup effect
  scaryPulse: 'oklch(0.60 0.30 15 / 0.25)',  // Scary number pulse
} as const;

// Typography System
export const SeveranceTypography = {
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

// Four Tempers System
export const FourTempers: Record<string, any> = {
  WO: {
    fullName: 'Woe',
    description: 'Fear, sadness, melancholy',
    color: SeveranceColors.woe,
    targetNumbers: [1, 3, 7, 13, 17, 21, 27, 31, 37, 41], // "Scary" numbers
  },
  FC: {
    fullName: 'Frolic', 
    description: 'Joy, humor, whimsy',
    color: SeveranceColors.frolic,
    targetNumbers: [0, 5, 8, 14, 19, 22, 28, 32, 38, 42], // "Joyful" numbers
  },
  DR: {
    fullName: 'Dread',
    description: 'Anxiety, worry, apprehension', 
    color: SeveranceColors.dread,
    targetNumbers: [2, 6, 11, 16, 20, 25, 29, 34, 39, 43], // "Anxious" numbers
  },
  MA: {
    fullName: 'Malice',
    description: 'Anger, spite, hatred',
    color: SeveranceColors.malice, 
    targetNumbers: [4, 9, 12, 18, 23, 26, 30, 35, 40, 44], // "Angry" numbers
  }
};

// Game Configuration
export const GameConfig = {
  // World settings
  world: {
    gridSize: { cols: 50, rows: 80 },      // World larger than viewport
    cellSize: 24,                         // Fixed cell size for numbers
    cellSpacing: 2,                       // Space between cells
    numberDensity: 0.85,                  // Percentage of cells filled
    viewportMargin: 16,                   // Margin around grid
  },
  
  // Viewport settings
  viewport: {
    cols: 15,                             // Visible columns
    rows: 25,                             // Visible rows (portrait)
    scale: 1.0,                           // Base scale
    maxZoom: 2.0,                        // Maximum zoom level
    minZoom: 0.5,                        // Minimum zoom level
  },
  
  // Cursor physics
  cursor: {
    maxVelocity: 800,                     // pixels/second
    acceleration: 1200,                   // pixels/second²
    friction: 0.85,                       // velocity decay per frame
    inputSmoothingFactor: 0.8,           // Input signal smoothing
    velocitySmoothing: 0.9,               // Velocity smoothing
    positionSnapThreshold: 2,             // Pixels to snap to rest
    glowRadius: 8,                        // Glow radius in pixels
    glowIntensity: 0.4,                   // Glow opacity
  },
  
  // Pinpoint mode settings
  pinpoint: {
    holdThreshold: 200,                   // ms to enter pinpoint mode
    releaseThreshold: 100,                // ms to confirm mode exit
    steeringDeadZone: 0.08,               // Normalized radius for no movement
    steeringMaxRadius: 0.3,               // Normalized radius for max speed
    steeringAcceleration: 2.5,            // Speed multiplier curve
    crosshairVisual: true,                // Show crosshair in pinpoint mode
    centerFollowsTouch: true,             // Center follows initial touch
  },
  
  // Lasso settings
  lasso: {
    width: 2,                             // Trail thickness
    opacity: 0.6,                         // Trail opacity
    fadeDistance: 100,                    // Pixels before fade starts
    segmentLength: 3,                    // Pixels between trail points
    autoCloseDistance: 15,                // Pixels to auto-close lasso
    minimumLoopSize: 40,                  // Minimum viable lasso size
    pinRadius: 20,                        // Distance for pinning effect
    slowdownFactor: 0.2,                 // Speed reduction when pinned
    highlightIntensity: 0.4,              // Visual highlight strength
    transitionDuration: 200,              // ms for pin/unpin transition
  },
  
  // Number animations
  animations: {
    breatheAmplitude: 0.02,               // Subtle scale breathing
    breatheFrequency: 2.0,                // Breaths per second
    positionDrift: 0.5,                   // Max pixels of position drift
    driftFrequency: 0.3,                 // Drift cycles per second
    wellupDuration: 1500,                // ms for wellup effect
    wellupScaleIncrease: 1.3,            // Scale multiplier
    wellupGlowIntensity: 0.6,            // Glow effect strength
    scaryScaleVariation: 0.15,           // Extra scale jitter
    scaryColorShift: 0.1,                // Slight color shift
    scaryPulseFrequency: 1.5,            // Pulses per second
    clusterWellupFrequency: 8000,       // ms between cluster events
  },
  
  // Feedback system
  feedback: {
    // Success feedback (harmonic)
    success: {
      visualDuration: 300,                // ms glow duration
      visualIntensity: 1.0,               // Full intensity
      hapticPattern: 'success',          // Smooth pulse
      hapticIntensity: 0.8,              // Strong haptic
      hapticDuration: 200,               // ms haptic duration
      audioTone: 'harmonic',             // Pleasant chord
      audioFrequency: [220, 330, 440],    // Hz - A major triad
      audioDuration: 300,                 // ms
      audioAttack: 50,                   // ms fade in
      audioDecay: 250,                   // ms fade out
      scorePopup: true,                   // Brief +score display
    },
    
    // Failure feedback (discordant)
    failure: {
      visualDuration: 150,                // ms shake duration  
      visualIntensity: 1.0,               // Full intensity
      hapticPattern: 'error',             // Sharp buzz
      hapticIntensity: 1.0,              // Maximum haptic
      hapticDuration: 150,                // ms haptic duration
      audioTone: 'discordant',           // Harsh tone
      audioFrequency: [185, 247],         // Hz - minor second
      audioDuration: 150,                 // ms - shorter, sharper
      lassoDissolve: true,               // Lasso dissolves on failure
    },
    
    // Mode transitions
    modeSwitch: {
      visualDuration: 200,               // ms for visual state change
      visualIntensity: 0.6,               // Subtle visual feedback
      hapticPattern: 'light',            // Subtle confirmation
      hapticIntensity: 0.4,              // Light haptic
      hapticDuration: 50,                 // ms haptic duration
      audioTone: 'system',               // UI confirmation tone
      audioFrequency: 800,                // Hz - system beep
      audioDuration: 50,                  // ms - short beep
    },
  },
  
  // Performance targets
  performance: {
    targetFPS: 60,                        // Target frame rate
    minFPS: 30,                          // Minimum acceptable FPS
    maxFrameTime: 33.33,                 // ms (30 FPS)
    inputLatencyTarget: 16,               // ms target input latency
    inputLatencyMax: 32,                 // ms maximum acceptable latency
    memoryTarget: 100,                   // MB target memory usage
    memoryMax: 150,                      // MB maximum acceptable memory
    batteryImpactTarget: 5,              // % per hour target
    batteryImpactMax: 10,               // % per hour maximum
  },
  
  // Session settings
  session: {
    targetNumbers: 100,                  // Numbers to capture per session
    quotaPerTemper: 25,                  // Numbers needed per temper
    scaryNumberChance: 0.15,             // Probability of scary number spawn
    comboMultiplier: 1.5,                // Combo score multiplier
    timeBonusMultiplier: 1.0,            // Time-based scoring
  },
} as const;

// Severance-style file naming
export const SeveranceFileNames = [
  'TEMPER_SORT_A47.mdr',
  'EMOTIONAL_BALANCE_B23.mdr',
  'TEMPER_REGULATION_C91.mdr',
  'PSYCHIC_DIVISION_D15.mdr',
  'CONSCIOUSNESS_SPLIT_E62.mdr',
  'MENTAL_PARTITION_F38.mdr',
  'PERSONA_SEPARATION_G74.mdr',
  'IDENTITY_DIVORCE_H29.mdr',
];

// Animation timing constants
export const AnimationTiming = {
  frameInterval: 1000 / 60,             // 60 FPS in milliseconds
  physicsUpdate: 1000 / 120,            // 120 Hz physics updates
  numberUpdate: 1000 / 60,              // 60 Hz number updates
  inputUpdate: 1000 / 120,              // 120 Hz input processing
  feedbackDuration: 500,                 // ms feedback display time
  statusUpdate: 1000,                    // 1 second status updates
} as const;

// Grid and layout constants
export const LayoutConstants = {
  // Status strip (top)
  statusHeight: 40,                      // Fixed height in pixels
  statusPadding: 16,                     // Horizontal padding
  
  // Main grid area
  gridMargin: 16,                        // Margin around grid
  statusBarHeight: 40,                   // Status bar height
  bottomBarHeight: 80,                  // Height for bin controls
  
  // Bottom control bar
  binWidth: 60,                         // Width of each temper bin
  binHeight: 50,                        // Height of temper bins
  binSpacing: 8,                         // Space between bins
  progressHeight: 4,                     // Progress bar thickness
  progressMargin: 8,                     // Space above bins
  
  // Cursor and interaction
  cursorSize: 20,                        // Cursor visual size
  crosshairSize: 30,                     // Crosshair size in pinpoint mode
  touchRadius: 50,                       // Touch interaction radius
} as const;

// Export aliases for easier imports
export const COLORS = {
  background: SeveranceColors.background,
  primary: SeveranceColors.primaryText,
  accent: SeveranceColors.secondaryText,
  text: SeveranceColors.primaryText,
  textSecondary: SeveranceColors.secondaryText,
  tempers: {
    WO: SeveranceColors.woe,
    FC: SeveranceColors.frolic,
    DR: SeveranceColors.dread,
    MA: SeveranceColors.malice,
  }
};

export const TYPOGRAPHY = SeveranceTypography;