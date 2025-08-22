# MDR Implementation Roadmap
*Building the Severance-Inspired Precision Game*

## Project Overview

We're building MDR, a precision-dexterity game disguised as a retro-futurist terminal interface inspired by the Severance TV series. The game combines high-performance React Native rendering with the uncanny aesthetic of an alternate operating system.

### Core Experience
- **Full-screen terminal interface** with deep blue-black background and cyan numerals
- **Floating cursor** with inertia physics and subtle glow effects
- **Pinpoint steering mode** activated by press-and-hold for precise control
- **Lasso capture system** that pins drifting numbers at the boundary
- **Four Tempers classification** (WO/FC/DR/MA) with distinct color coding
- **Immediate multimodal feedback** (visual, audio, haptic) for every action

## Architecture Foundation

### Technology Stack
```
React Native 0.73+ (TypeScript)
├── React Native Skia (GPU-accelerated rendering)
├── React Native Reanimated 3 (gesture physics)
├── Zustand (lightweight state management)
├── React Native Sound (harmonic audio feedback)
└── React Native Haptic Feedback (tactile responses)
```

### Core Systems
1. **World System** - Manages grid coordinates and viewport
2. **Input System** - Processes gestures and mode transitions  
3. **Physics System** - Handles cursor movement and number drift
4. **Render System** - Coordinates Skia drawing operations
5. **Feedback System** - Orchestrates multimodal responses

## Development Phases

### Phase 1: Foundation (Week 1)
**Goal:** Establish core project structure and basic rendering

- [ ] **Project Setup**
  - React Native init with TypeScript configuration
  - Install and configure Skia, Reanimated, Zustand
  - Set up development tools and debugging
  - Configure Metro bundler for performance

- [ ] **Basic Rendering**
  - Severance color palette and typography system
  - Full-screen immersive setup (hide system UI)
  - Basic Skia canvas with monospaced number grid
  - Portrait orientation lock

- [ ] **State Architecture**
  - Zustand stores for game, world, and settings state
  - TypeScript interfaces for all game entities
  - Basic number entity system with position and color

**Success Criteria:** App launches full-screen, displays static grid of cyan numbers on dark background

### Phase 2: Core Interactions (Week 2)
**Goal:** Implement cursor movement and mode switching

- [ ] **Cursor System**
  - Floating cursor with cyan glow effect
  - Inertia physics using Reanimated shared values
  - Smooth pan-to-move in exploration mode
  - Visual feedback for cursor movement

- [ ] **Gesture Recognition**
  - Touch event processing and gesture state machine
  - Press-and-hold detection for pinpoint mode
  - Mode transition animations and feedback
  - Crosshair visualization in pinpoint mode

- [ ] **World Navigation**
  - Viewport management for world larger than screen
  - Smooth camera following cursor movement
  - Boundary constraints and edge behavior
  - Spatial culling for performance

**Success Criteria:** Responsive cursor with smooth physics, clear mode transitions

### Phase 3: Lasso Mechanics (Week 3)
**Goal:** Implement precision capture system

- [ ] **Lasso Trail System**
  - Trail recording with Reanimated gesture handling
  - Smooth trail rendering with Skia paths
  - Trail visualization with proper opacity and width
  - Auto-close detection when loop is formed

- [ ] **Collision Detection**
  - Point-in-polygon testing for number capture
  - Spatial partitioning for performance optimization
  - Number pinning when touched by lasso boundary
  - Real-time collision feedback visualization

- [ ] **Capture Validation**
  - Geometry-based containment checking
  - Integration with Four Tempers classification
  - Immediate success/failure determination
  - Score tracking and quota management

**Success Criteria:** Working lasso system that captures numbers with visual feedback

### Phase 4: Four Tempers System (Week 4)
**Goal:** Implement the complete game loop

- [ ] **Number Classification**
  - Four Tempers (WO/FC/DR/MA) color system
  - Dynamic number assignment to temper categories
  - "Scary number" emphasis and special behaviors
  - Target selection and visual indicators

- [ ] **Bottom UI Controls**
  - Temper bin selection interface
  - Progress tracking per temper category
  - Visual state management (active/inactive/complete)
  - Touch handling for bin selection

- [ ] **Status Bar**
  - Severance-style file name display
  - Overall progress percentage
  - Session timer and active temper indicator
  - Retro terminal aesthetic

**Success Criteria:** Complete game loop with working temper classification and UI

### Phase 5: Animations & Polish (Week 5)
**Goal:** Achieve the living, breathing terminal feel

- [ ] **Number Animations**
  - Subtle breathing/scale animations
  - Position drift simulation
  - Cluster "wellup" events
  - Scary number emphasis effects

- [ ] **Visual Effects**
  - Glow effects around interactive elements
  - Smooth transitions between all states
  - Particle effects for successful captures
  - Terminal-style visual feedback

- [ ] **Audio System**
  - Harmonic chord generation for success
  - Discordant tones for failure
  - System beeps for mode transitions
  - Volume balancing and audio mixing

**Success Criteria:** Immersive experience that feels alive and responsive

### Phase 6: Performance & Optimization (Week 6)
**Goal:** Achieve 60+ fps with smooth interactions

- [ ] **Rendering Optimization**
  - Spatial culling implementation
  - Instanced rendering for number grid
  - GPU shader optimization for effects
  - Memory usage profiling and optimization

- [ ] **Input Latency Reduction**
  - Direct native gesture processing where needed
  - Minimize bridge crossings with shared values
  - Optimize gesture recognition algorithms
  - Input lag measurement and tuning

- [ ] **Performance Monitoring**
  - Real-time FPS tracking
  - Memory leak detection
  - Battery usage optimization
  - Performance regression testing

**Success Criteria:** Sustained 60+ fps with <16ms input latency

## Technical Risks & Mitigation

### High-Risk Areas
1. **Gesture Precision** - Complex gesture recognition could feel unresponsive
   - *Mitigation:* Early prototyping, extensive device testing
   
2. **Rendering Performance** - Complex animations might cause frame drops
   - *Mitigation:* GPU profiling, incremental optimization, LOD system
   
3. **Cross-Device Consistency** - Different Android devices may feel different
   - *Mitigation:* Performance scaling, device-specific tuning

### Medium-Risk Areas
1. **State Management Complexity** - Game state could become unwieldy
   - *Mitigation:* Modular Zustand stores, clear state interfaces
   
2. **Audio Timing** - Audio feedback might not sync with visual
   - *Mitigation:* Audio buffer optimization, timing measurement

## Success Metrics

### Performance Targets
- **Frame Rate:** 60+ fps sustained, 30+ fps minimum
- **Input Latency:** <16ms touch-to-render, <32ms acceptable
- **Memory Usage:** <100MB steady state, <150MB peak
- **Battery Impact:** <5% per hour during active play

### User Experience Goals
- **Immediacy:** Every interaction feels instant and responsive
- **Precision:** Lasso capture feels accurate and fair
- **Immersion:** Interface feels like an alternate operating system
- **Clarity:** Visual feedback is unmistakable and satisfying

## Deployment Preparation

### Testing Strategy
- **Unit Tests:** Game logic, collision detection, color systems
- **Integration Tests:** Gesture accuracy, performance benchmarks
- **Device Testing:** Multiple Android versions and screen sizes
- **User Testing:** Game feel validation with target users

### Launch Readiness
- **Performance Monitoring:** Crashlytics, performance tracking
- **Analytics Integration:** User behavior insights
- **Update System:** Over-the-air updates for tuning
- **Feedback Collection:** In-app feedback mechanisms

This roadmap provides a clear path from concept to polished game while maintaining focus on the core experience: precision dexterity gameplay wrapped in an immersive Severance-inspired terminal interface.