# MDR Project Cleanup Recommendations

Based on Knip analysis, here are the specific unused files and dependencies that can be safely removed:

## 🗑️ Files That Can Be Deleted (8 files)

These files are not imported anywhere and can be completely removed:

1. **`src/components/GameCanvas.tsx`** - Alternative game canvas implementation
2. **`src/components/MDRGame.tsx`** - Unused game component  
3. **`src/components/SkiaCanvas.tsx`** - Skia-based canvas (not being used)
4. **`src/components/TerminalGrid.tsx`** - Alternative terminal grid implementation
5. **`src/systems/InputSystem.ts`** - Input system (not connected)
6. **`src/systems/LassoSystem.ts`** - Lasso interaction system (not used)
7. **`src/systems/PhysicsSystem.ts`** - Physics calculations (not used)
8. **`src/systems/WorldSystem.ts`** - World management system (not used)

## 📦 Dependencies That Can Be Removed (3 packages)

These packages are installed but not used in the codebase:

```bash
npm uninstall @shopify/react-native-skia react-native-reanimated react-native-sound
```

**Estimated bundle size reduction:** ~2-3MB

## 📤 Unused Exports That Can Be Cleaned Up (5 exports)

In [`src/utils/constants.ts`](src/utils/constants.ts:1), these exports are defined but never imported:

- `SeveranceFileNames` (line 229)
- `AnimationTiming` (line 241) 
- `LayoutConstants` (line 251)
- `COLORS` (line 275)
- `TYPOGRAPHY` (line 289)

## 🔧 Quick Cleanup Commands

```bash
# Remove unused files
rm src/components/GameCanvas.tsx
rm src/components/MDRGame.tsx  
rm src/components/SkiaCanvas.tsx
rm src/components/TerminalGrid.tsx
rm src/systems/InputSystem.ts
rm src/systems/LassoSystem.ts
rm src/systems/PhysicsSystem.ts
rm src/systems/WorldSystem.ts

# Remove unused dependencies
npm uninstall @shopify/react-native-skia react-native-reanimated react-native-sound

# Verify cleanup worked
npm run knip
```

## 📊 Impact Summary

- **Files removed:** 8 TypeScript files (~2,000+ lines of code)
- **Dependencies removed:** 3 large packages (~2-3MB bundle reduction)
- **Exports cleaned:** 5 unused exports
- **Build time improvement:** Faster TypeScript compilation
- **Bundle size reduction:** Smaller app download size
- **Maintenance reduction:** Less code to maintain and debug

## 🎯 Current Active Components

After cleanup, the active component structure will be:

```
src/
├── App.tsx                     ✅ (entry point)
├── components/
│   ├── MDRInterface.tsx       ✅ (main UI)
│   └── MDRTerminalGrid.tsx    ✅ (terminal display)
├── stores/
│   ├── gameStore.ts           ✅ (game state)
│   └── tuningStore.ts         ✅ (tuning parameters)
├── types/
│   └── index.ts               ✅ (type definitions)
└── utils/
    ├── constants.ts           ✅ (configuration)
    └── PerformanceMonitor.ts  ✅ (performance tracking)
```

This is a much cleaner, focused codebase that only contains code that's actually being used.

## 🔍 How to Prevent Future Bloat

1. **Regular Knip checks:** Run `npm run knip` weekly
2. **Pre-commit validation:** Our system now blocks commits with unused code
3. **Import analysis:** Use `npm run knip:unused-files` to check for unused files
4. **Dependency auditing:** Use `npm run knip:unused-dependencies` before adding new packages

The dead code elimination system will now catch any new unused code before it gets merged!