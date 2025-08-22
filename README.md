# MDR (Mind Data Retrieval)

[![React Native](https://img.shields.io/badge/React%20Native-0.81.0-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

> A precision-dexterity game disguised as an operating system, inspired by the Severance TV series

MDR is a React Native application that creates an immersive, full-screen gaming experience where players navigate and capture drifting numbers through precise cursor control and lasso mechanics. Built with high-performance technologies and a focus on the "uncanny valley" aesthetic of retro-futurist computing.

![MDR Interface](docs/screenshots/mdr-interface.png)

## 🎯 Features

### Core Gameplay
- **Precision Cursor Control**: Physics-based cursor movement with inertia and momentum
- **Dual Input Modes**: 
  - *Exploration Mode*: Free-form cursor movement with trackball physics
  - *Pinpoint Mode*: Press-and-hold joystick steering for precise control
- **Lasso Capture System**: Draw trails around numbers to capture them
- **Four Tempers Classification**: Sort numbers into WO (Woe), FC (Frolic), DR (Dread), and MA (Malice) categories

### Severance-Inspired Design
- **Terminal Aesthetic**: Deep blue-black background with cyan monospaced text
- **Immersive Interface**: Full-screen experience hiding all system UI
- **Living Numbers**: Subtle breathing animations and positional drift
- **Retro-Futurist Feel**: Designed to feel like an alternate operating system

### High-Performance Rendering
- **React Native Skia**: GPU-accelerated 2D graphics for smooth 60+ FPS
- **Spatial Optimization**: Culling and partitioning for efficient rendering
- **Advanced Animations**: Fisheye magnification, jitter effects, and number drift
- **Memory Management**: Object pooling and performance monitoring

### Multimodal Feedback
- **Haptic Feedback**: Success, failure, and mode transition vibrations
- **Audio System**: Harmonic chords for success, discordant tones for failure
- **Visual Effects**: Glow effects, color transitions, and feedback animations

## 🛠 Technology Stack

### Core Framework
- **React Native 0.81.0** with TypeScript
- **Metro Bundler** with performance optimizations
- **Android API Level 28+** target

### High-Performance Rendering
- **[@shopify/react-native-skia](https://shopify.github.io/react-native-skia/)** - GPU-accelerated 2D graphics
- **[react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)** - Smooth animations and gesture handling

### State Management & Storage
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)** - Persistent storage

### Audio & Haptics
- **[react-native-sound](https://github.com/zmxv/react-native-sound)** - Audio feedback
- **[react-native-haptic-feedback](https://github.com/junina-de/react-native-haptic-feedback)** - Tactile responses

## 📱 Requirements

- **Node.js**: 18.0 or higher
- **React Native CLI**: Latest version
- **Android Studio**: For Android development
- **Android Device/Emulator**: API Level 28+ recommended

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mdr.git
cd mdr

# Install dependencies
npm install

# Install iOS dependencies (if developing for iOS)
cd ios && pod install && cd ..
```

### Development

```bash
# Start Metro bundler
npm start

# Run on Android (connect device or start emulator first)
npm run android

# Run on iOS (macOS only)
npm run ios

# Development with hot reload
npm run dev:android
```

### Build Commands

```bash
# Debug build
npm run build:android

# Release build
npm run build:release

# Clean and rebuild
npm run clean
```

## 🎮 How to Play

### Basic Controls
1. **Touch and drag** to move the cursor in exploration mode
2. **Press and hold** to enter pinpoint mode for precise steering
3. **Draw loops** around numbers to capture them with the lasso
4. **Select target temper** from the bottom bins (WO/FC/DR/MA)

### Game Objective
- Capture numbers and sort them into the correct Four Tempers categories
- Achieve 100% completion by filling all temper quotas
- Experience the uncanny feeling of an alternate operating system

### Four Tempers System
- **WO (Woe)**: Red - Fear, sadness, melancholy
- **FC (Frolic)**: Green - Joy, humor, whimsy  
- **DR (Dread)**: Orange - Anxiety, worry, apprehension
- **MA (Malice)**: Purple - Anger, spite, hatred

## 📁 Project Structure

```
mdr/
├── src/
│   ├── components/          # React Native components
│   │   ├── MDRInterface.tsx # Main game interface
│   │   └── MDRTerminalGrid.tsx # Number grid and cursor
│   ├── systems/             # Core game systems
│   │   ├── WorldSystem.ts   # World coordinates and viewport
│   │   ├── FeedbackSystem.ts # Multimodal feedback
│   │   └── ...
│   ├── stores/              # Zustand state stores
│   │   ├── gameStore.ts     # Game state management
│   │   └── tuningStore.ts   # Performance tuning
│   ├── utils/               # Utility functions
│   │   ├── constants.ts     # Game configuration
│   │   └── PerformanceMonitor.ts # Performance tracking
│   └── types/               # TypeScript definitions
├── android/                 # Android native code
├── docs/                    # Documentation
│   ├── MDR_Architecture.md
│   ├── TechnicalSpecifications.md
│   ├── ImplementationRoadmap.md
│   └── SeveranceDesignSystem.md
└── scripts/                 # Build and validation scripts
```

## ⚡ Performance

### Targets
- **Frame Rate**: 60+ FPS sustained, 30+ FPS minimum
- **Input Latency**: <16ms touch-to-render, <32ms acceptable
- **Memory Usage**: <100MB steady state, <150MB peak
- **Battery Impact**: <5% per hour during active play

### Optimization Features
- Spatial partitioning for collision detection
- GPU-accelerated rendering with Skia
- Object pooling for memory management
- Performance monitoring and automatic scaling
- Configurable quality settings

## 🔧 Configuration

The game includes an advanced tuning system for performance optimization:

```typescript
// Example tuning configuration
const config = {
  performance: {
    targetFPS: 60,
    inputLatencyTarget: 16,
    maxConcurrentAnimations: 100,
  },
  cursor: {
    sensitivity: 8.0,
    momentum: 0.15,
    friction: 0.88,
  },
  feedback: {
    hapticEnabled: true,
    audioEnabled: true,
    visualIntensity: 1.0,
  }
};
```

## 🧪 Development Tools

### Scripts
```bash
# Performance validation
npm run validate

# Dead code elimination
npm run deadcode:all

# Dependency analysis
npm run knip

# Testing
npm test

# Linting
npm run lint
```

### Debug Features
- Real-time performance monitoring
- Debug overlays for visual feedback
- Performance regression testing
- Memory leak detection

## 📖 Documentation

- **[Architecture Overview](MDR_Architecture.md)** - System design and technical overview
- **[Technical Specifications](TechnicalSpecifications.md)** - Detailed implementation specs
- **[Implementation Roadmap](ImplementationRoadmap.md)** - Development phases and milestones
- **[Design System](SeveranceDesignSystem.md)** - Severance-inspired UI guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain 60+ FPS performance
- Test on multiple Android devices
- Document architectural decisions
- Include performance impact analysis

## 🐛 Known Issues

- iOS implementation pending (Android-first development)
- Audio system simplified for mobile constraints
- Performance may vary on older Android devices
- Some visual effects optimized for high-end devices

## 🗺 Roadmap

### Phase 1: Foundation ✅
- [x] Core project structure
- [x] State management setup
- [x] Cursor physics

### Phase 3: Game Mechanics (In Progress)
- [ ] Lasso trail system
- [ ] Bucketing Gestures for tempers
- [ ] Collision detection
- [ ] Capture validation

### Phase 3: Core Interactions ⏳
- [ ] World navigation / Levels

### Phase 4: Polish & Effects (Planned)
- [ ] Audio system enhancement
- [ ] Visual effects expansion (Skia)
- [ ] Performance optimization
- [ ] iOS support

## 📄 License

This project is licensed under the **GNU General Public License v3.0** (GPL-3.0).

**What this means for commercial use:**
- ✅ You can use, modify, and distribute this software freely
- ✅ You can sell apps based on this code
- ⚠️ **BUT**: Any derivative work must also be licensed under GPL-3.0 and made open source
- 💼 **Commercial licensing available**: Contact for a proprietary license if you want to create closed-source derivatives

**For the original author:** This license ensures that any competing apps built from this code must also be open source, preventing simple copying and reselling while allowing legitimate open source contributions.

Contact [chadgauth@gmail.com] for commercial licensing inquiries.

## 🙏 Acknowledgments

- Inspired by the [Severance TV series](https://www.imdb.com/title/tt11280740/) and its retro-futurist aesthetic
- Built with [React Native Skia](https://shopify.github.io/react-native-skia/) for high-performance graphics
- Performance optimization techniques from [React Native Performance](https://reactnative.dev/docs/performance)

---

**MDR** - Experience the uncanny valley of an alternate operating system where precision meets mystery.
