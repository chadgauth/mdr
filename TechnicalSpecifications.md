# MDR Technical Specifications

## Gesture Recognition System

### Input Processing Pipeline

The gesture system must distinguish between three distinct interaction modes with precise timing and responsiveness.

#### Mode Transition Specifications

```typescript
interface GestureConfig {
  // Mode switching thresholds
  pinpointHoldThreshold: 200;    // ms to enter pinpoint mode
  pinpointReleaseThreshold: 100; // ms to confirm mode exit
  
  // Steering sensitivity curves
  steeringDeadZone: 0.05;        // Normalized radius for no movement
  steeringMaxRadius: 0.3;        // Normalized radius for max speed
  steeringAcceleration: 2.5;     // Speed multiplier curve
  
  // Lasso detection
  lassoMinPoints: 8;             // Minimum trail points to form lasso
  lassoClosureThreshold: 25;     // Pixels to detect loop closure
  lassoSmoothingFactor: 0.7;     // Trail smoothing coefficient
}
```

#### Exploration Mode Physics

```typescript
interface CursorPhysics {
  // Inertia simulation
  maxVelocity: 800;              // pixels/second
  acceleration: 1200;            // pixels/second²
  friction: 0.85;                // velocity decay per frame
  
  // Responsiveness tuning
  inputSmoothingFactor: 0.8;     // Input signal smoothing
  velocitySmoothing: 0.9;        // Velocity smoothing
  positionSnapThreshold: 2;      // Pixels to snap to rest
}
```

#### Pinpoint Mode Steering

```typescript
interface SteeringSystem {
  // Convert touch offset to steering vector
  calculateSteering(touchPos: Point, centerPos: Point): Vector2 {
    const offset = subtract(touchPos, centerPos);
    const distance = magnitude(offset);
    const normalizedDistance = distance / steeringMaxRadius;
    
    // Apply dead zone
    if (normalizedDistance < steeringDeadZone) {
      return { x: 0, y: 0 };
    }
    
    // Apply acceleration curve
    const intensity = Math.pow(normalizedDistance, steeringAcceleration);
    return scale(normalize(offset), intensity);
  }
}
```

## Performance Optimization Framework

### Rendering Performance Targets

| Metric | Target | Minimum | Measurement Method |
|--------|--------|---------|-------------------|
| Frame Rate | 60+ fps | 30 fps | React Native performance monitor |
| Frame Time | <16.67ms | <33.33ms | Skia render profiler |
| Input Latency | <16ms | <32ms | Custom touch-to-render measurement |
| Memory Usage | <100MB | <150MB | Android memory profiler |
| Battery Impact | <5%/hour | <10%/hour | Android battery stats |

### Spatial Optimization System

```typescript
interface SpatialPartitioning {
  // Grid-based culling for number entities
  gridSize: 200;                 // Pixels per spatial grid cell
  cullingMargin: 100;            // Extra pixels around viewport
  
  // Performance scaling
  maxVisibleNumbers: 500;        // Absolute maximum for performance
  lodDistanceThreshold: 800;     // Distance to reduce detail
  cullingUpdateFrequency: 3;     // Frames between culling updates
}

class QuadTree {
  // Efficient spatial queries for collision detection
  insert(entity: NumberEntity): void;
  query(bounds: Rectangle): NumberEntity[];
  clear(): void;
  
  // Optimized for frequent updates
  maxDepth: 6;
  maxEntitiesPerNode: 10;
}
```

### Memory Management

```typescript
interface ObjectPooling {
  // Reuse expensive objects to avoid GC pressure
  numberEntityPool: ObjectPool<NumberEntity>;
  pointPool: ObjectPool<Point>;
  vectorPool: ObjectPool<Vector2>;
  
  // Pool sizing
  initialPoolSize: 200;
  maxPoolSize: 1000;
  growthFactor: 1.5;
}
```

## Collision Detection Algorithms

### Lasso-Number Intersection

The core gameplay mechanic requires efficient point-in-polygon testing for potentially hundreds of numbers against a dynamic lasso shape.

```typescript
interface CollisionSystem {
  // Ray casting algorithm for point-in-polygon
  isPointInLasso(point: Point, lassoPoints: Point[]): boolean {
    let inside = false;
    const n = lassoPoints.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = lassoPoints[i].x, yi = lassoPoints[i].y;
      const xj = lassoPoints[j].x, yj = lassoPoints[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
  
  // Broad phase optimization using bounding boxes
  getBoundingBox(points: Point[]): Rectangle;
  quickReject(point: Point, bounds: Rectangle): boolean;
}
```

### Number Stabilization Algorithm

When numbers approach the lasso boundary, they need to smoothly transition from drift to stabilization.

```typescript
interface StabilizationSystem {
  // Distance-based stabilization factor
  calculateStabilization(
    numberPos: Point, 
    lassoPoints: Point[]
  ): number {
    const distanceToLasso = this.distanceToPolygon(numberPos, lassoPoints);
    const stabilizationRadius = 50; // pixels
    
    if (distanceToLasso > stabilizationRadius) {
      return 0; // Full drift
    }
    
    // Smooth falloff curve
    const normalizedDistance = distanceToLasso / stabilizationRadius;
    return 1 - Math.pow(normalizedDistance, 2); // Quadratic falloff
  }
  
  // Efficient distance calculation to polygon edge
  distanceToPolygon(point: Point, polygon: Point[]): number;
}
```

## Color System Specifications

### Hue Drift Animation

Numbers continuously drift through color space, creating the illusion of a living system.

```typescript
interface ColorDriftSystem {
  // HSL color space for smooth transitions
  baseHue: number;               // Starting hue (0-360)
  driftSpeed: number;            // Degrees per second
  driftVariance: number;         // Random variance in speed
  
  // Target color matching
  targetTolerance: 15;           // Degrees of hue tolerance
  captureColorClasses: number[]; // Target hue values
  
  // Animation smoothing
  updateFrequency: 60;           // Updates per second
  interpolationFactor: 0.95;     // Smooth color transitions
}

// Perceptual color distance for accurate matching
function colorDistance(hue1: number, hue2: number): number {
  const diff = Math.abs(hue1 - hue2);
  return Math.min(diff, 360 - diff); // Handle wraparound
}
```

## Audio System Architecture

### Harmonic Feedback System

Success and failure states trigger carefully designed audio responses that reinforce the "alternate OS" theme.

```typescript
interface AudioFeedbackSystem {
  // Success audio - harmonic chord
  successFrequencies: [220, 330, 440]; // Hz - A major triad
  successDuration: 300;                 // ms
  successAttack: 50;                    // ms fade in
  successDecay: 250;                    // ms fade out
  
  // Failure audio - discordant tone
  failureFrequencies: [185, 247];      // Hz - minor second
  failureDuration: 150;                 // ms - shorter, sharper
  
  // System sounds
  modeTransitionFreq: 800;              // Hz - UI feedback
  lassoFormationFreq: 600;              // Hz - trail formation
  
  // Audio processing
  masterVolume: 0.7;                    // Global volume control
  spatialAudio: false;                  // Disable for performance
}
```

### Haptic Response Patterns

```typescript
interface HapticSystem {
  // Success pattern - smooth pulse
  successPattern: {
    duration: 100,
    intensity: 0.8,
    pattern: 'smooth'
  };
  
  // Failure pattern - sharp burst
  failurePattern: {
    duration: 50,
    intensity: 1.0,
    pattern: 'sharp'
  };
  
  // Mode transition - subtle tick
  transitionPattern: {
    duration: 20,
    intensity: 0.4,
    pattern: 'light'
  };
}
```

## Development Environment Specifications

### Build Configuration

```typescript
// metro.config.js optimizations
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // Performance optimization
      },
    }),
  },
  resolver: {
    alias: {
      '@': './src', // Clean import paths
    },
  },
};
```

### Performance Monitoring

```typescript
interface PerformanceProfiler {
  // Real-time metrics collection
  fps: MovingAverage;              // Frame rate tracking
  inputLatency: MovingAverage;     // Touch response time
  renderTime: MovingAverage;       // Skia render duration
  memoryUsage: MemoryTracker;      // Heap monitoring
  
  // Development tools
  showDebugOverlay: boolean;       // Visual performance HUD
  logPerformanceWarnings: boolean; // Console performance alerts
  enableFlipperIntegration: boolean; // External profiling
}
```

### Testing Framework

```typescript
interface TestingStrategy {
  // Unit tests for game logic
  unitTests: {
    collision: 'Jest + custom geometry tests',
    physics: 'Jest + deterministic simulation',
    color: 'Jest + color space validation'
  };
  
  // Integration tests for gestures
  gestureTests: {
    platform: 'Detox for E2E testing',
    scenarios: 'Recorded gesture sequences',
    validation: 'Screen capture + assertion'
  };
  
  // Performance regression tests
  performanceTests: {
    benchmarks: 'Automated performance suite',
    thresholds: 'Configurable performance gates',
    reporting: 'Trend analysis and alerts'
  };
}
```

This technical specification provides the detailed implementation guidance needed to build each system while maintaining the performance and user experience goals outlined in the game design document.