# MDR Game Architecture
*A precision-dexterity game disguised as an operating system*

## Overview

MDR is a React Native application that creates an immersive, full-screen gaming experience where players navigate and capture drifting numbers through precise cursor control and lasso mechanics. The architecture prioritizes performance, responsiveness, and seamless user experience.

## Technology Stack

### Core Framework
- **React Native 0.73+** with TypeScript
- **Metro bundler** with performance optimizations
- **Android API Level 28+** (minimum target)

### High-Performance Rendering
- **React Native Skia** for GPU-accelerated 2D graphics
  - Number grid rendering
  - Color transitions and animations
  - Lasso trail visualization
  - Visual effects and feedback

### Gesture & Animation System
- **React Native Reanimated 3** with native drivers
  - Cursor physics and inertia
  - Pinpoint mode steering mechanics
  - Smooth pan/zoom operations
  - UI state transitions

### State Management
- **Zustand** for lightweight, performant state management
  - Game state (cursor position, mode, targets)
  - World state (number positions, colors, drift)
  - UI state (feedback, score, session data)

### Audio & Haptics
- **React Native Sound** for audio feedback
- **React Native Haptic Feedback** for tactile responses
- Custom audio engine for harmonic chords and system sounds

## Project Structure

```
mdr/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── GameCanvas/      # Main Skia canvas wrapper
│   │   ├── CursorSystem/    # Cursor rendering and physics
│   │   ├── NumberGrid/      # Number entity management
│   │   ├── LassoSystem/     # Trail and capture mechanics
│   │   └── TargetIndicators/ # Bottom color targets
│   ├── systems/             # Core game systems
│   │   ├── WorldSystem/     # World coordinates and viewport
│   │   ├── InputSystem/     # Gesture recognition and processing
│   │   ├── RenderSystem/    # Skia rendering coordination
│   │   ├── PhysicsSystem/   # Cursor physics and number drift
│   │   ├── AudioSystem/     # Sound and haptic management
│   │   └── FeedbackSystem/  # Multimodal response system
│   ├── stores/              # Zustand state stores
│   │   ├── gameStore.ts     # Game state and actions
│   │   ├── worldStore.ts    # World and entity state
│   │   └── settingsStore.ts # User preferences and config
│   ├── utils/               # Utility functions
│   │   ├── geometry.ts      # Collision detection and math
│   │   ├── colors.ts        # Color manipulation and drift
│   │   ├── performance.ts   # Profiling and optimization
│   │   └── constants.ts     # Game configuration
│   ├── types/               # TypeScript definitions
│   └── hooks/               # Custom React hooks
├── android/                 # Native Android modules
│   └── app/src/main/java/com/mdr/
│       ├── PerformanceModule.java
│       ├── ImmersiveModule.java
│       └── HapticModule.java
├── assets/                  # Static assets
│   ├── sounds/             # Audio files
│   └── fonts/              # Typography
└── docs/                   # Documentation
    ├── performance.md
    ├── gestures.md
    └── architecture.md
```

## Core System Architecture

### 1. World System
Manages the larger game world and viewport relationship.

```typescript
interface WorldState {
  worldSize: { width: number; height: number }
  viewport: { x: number; y: number; width: number; height: number }
  scale: number
  numbers: NumberEntity[]
}

class WorldSystem {
  // Convert screen coordinates to world coordinates
  screenToWorld(x: number, y: number): WorldCoordinate
  
  // Handle viewport panning with bounds checking
  panViewport(deltaX: number, deltaY: number): void
  
  // Cull entities outside viewport for performance
  getVisibleEntities(): NumberEntity[]
}
```

### 2. Input System
Processes touch gestures and converts them to game actions.

```typescript
interface InputState {
  mode: 'exploration' | 'pinpoint'
  touchPosition: { x: number; y: number } | null
  touchStartPosition: { x: number; y: number } | null
  touchDuration: number
  lassoPoints: Point[]
}

class InputSystem {
  // Handle mode transitions (tap-hold for pinpoint)
  processTouch(event: GestureEvent): void
  
  // Convert pinpoint gestures to steering input
  calculateSteeringVector(currentPos: Point, centerPos: Point): Vector2
  
  // Manage lasso trail recording
  recordLassoPoint(worldPos: Point): void
}
```

### 3. Physics System
Handles cursor movement, inertia, and number drift.

```typescript
class PhysicsSystem {
  // Update cursor position with inertia and steering
  updateCursor(steeringInput: Vector2, deltaTime: number): void
  
  // Animate number color drift over time
  updateNumberDrift(deltaTime: number): void
  
  // Handle number stabilization near lasso boundaries
  stabilizeNumbers(lassoPath: Point[]): void
}
```

### 4. Render System
Coordinates Skia drawing operations for optimal performance.

```typescript
class RenderSystem {
  // Main render loop - called at display refresh rate
  render(canvas: SkCanvas, worldState: WorldState): void
  
  // Optimized number grid rendering with culling
  renderNumbers(canvas: SkCanvas, visibleNumbers: NumberEntity[]): void
  
  // Smooth lasso trail with interpolated points
  renderLassoTrail(canvas: SkCanvas, points: Point[]): void
  
  // Cursor with visual feedback for current mode
  renderCursor(canvas: SkCanvas, cursor: CursorState): void
}
```

## Key Technical Challenges & Solutions

### 1. Performance Optimization

**Challenge:** Maintaining 60+ fps with complex animations and real-time interactions.

**Solutions:**
- Use Skia's GPU acceleration for all rendering operations
- Implement spatial partitioning for collision detection
- Cull off-screen entities during render cycles
- Use shared values in Reanimated to avoid bridge crossings
- Profile and optimize hot paths with Flipper integration

### 2. Precise Gesture Recognition

**Challenge:** Distinguishing between exploration panning and pinpoint steering.

**Solutions:**
- Implement time-based mode switching (tap-hold threshold)
- Use gesture state machines to handle mode transitions cleanly
- Apply different sensitivity curves for each input mode
- Provide clear visual/haptic feedback for mode changes

### 3. Responsive Cursor Physics

**Challenge:** Cursor must feel tactile with appropriate inertia and responsiveness.

**Solutions:**
- Implement physics-based movement with configurable damping
- Use different physics parameters for exploration vs. pinpoint modes
- Apply smoothing filters to reduce input jitter
- Test extensively on different devices for consistent feel

### 4. Immersive Full-Screen Experience

**Challenge:** Hide all Android UI elements and maintain portrait orientation.

**Solutions:**
- Create native module for system UI control
- Handle navigation gestures gracefully
- Implement custom status bar management
- Ensure proper behavior across different Android versions

## Performance Targets

### Frame Rate
- **Target:** 60+ fps sustained
- **Minimum:** 30 fps on lower-end devices
- **Monitoring:** Real-time fps counter in development builds

### Input Latency
- **Target:** <16ms touch-to-render
- **Measurement:** Custom performance profiling
- **Optimization:** Native gesture processing where needed

### Memory Usage
- **Target:** <100MB steady state
- **Monitoring:** Memory leak detection in development
- **Optimization:** Object pooling for frequently created entities

## Development Workflow

### 1. Hot Reload Setup
- Metro fast refresh for React components
- Skia canvas hot reload support
- State persistence across reloads for testing

### 2. Debugging Tools
- Flipper integration for performance profiling
- Custom debug overlays for game state visualization
- Gesture recording/playback for testing edge cases

### 3. Testing Strategy
- Unit tests for game logic and utility functions
- Integration tests for gesture recognition accuracy
- Performance regression testing on target devices
- User experience testing for "game feel" validation

## Scalability & Future Features

### Architecture Considerations
- Plugin system for power-ups and game modes
- Theming engine for visual customization
- Analytics integration points for user behavior tracking
- Save system architecture for progression and settings

### Performance Scaling
- Level-of-detail system for number rendering
- Dynamic quality adjustment based on device performance
- Modular rendering pipeline for feature additions

## Risk Mitigation

### Technical Risks
1. **Performance bottlenecks:** Early prototyping of critical systems
2. **Gesture conflicts:** Comprehensive gesture testing matrix
3. **Platform fragmentation:** Target specific Android API levels
4. **Battery optimization:** Profile power consumption patterns

### Development Risks
1. **Complex state management:** Start with simple state, iterate toward complexity
2. **Native module dependencies:** Plan fallback implementations
3. **User experience consistency:** Extensive device testing program

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- React Native project setup with TypeScript
- Basic Skia canvas integration
- Core state management structure
- Immersive UI configuration

### Phase 2: Core Systems (Weeks 3-4)
- World system and coordinate mapping
- Basic gesture recognition and cursor movement
- Number grid rendering and color system
- Simple feedback mechanisms

### Phase 3: Game Mechanics (Weeks 5-6)
- Pinpoint mode implementation
- Lasso system with collision detection
- Number drift and stabilization
- Capture validation logic

### Phase 4: Polish & Optimization (Weeks 7-8)
- Performance optimization and profiling
- Audio and haptic integration
- Visual effects and transitions
- Comprehensive testing and bug fixes

This architecture provides a solid foundation for building MDR while maintaining the performance and responsiveness required for an immersive gaming experience. The modular design allows for iterative development and future feature expansion.