import { useTuningStore, PerformanceStats } from '../stores/tuningStore';

// Type declarations for React Native globals
declare global {
  var performance: {
    now(): number;
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
    };
  };
  var window: {
    screen?: {
      refreshRate?: number;
    };
  };
}

// React Native performance API fallback
const getPerformanceNow = (): number => {
  try {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
  } catch (error) {
    // Fallback for React Native
  }
  return Date.now();
};

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameStartTime = 0;
  private lastFrameTime = 0;
  private frameTimes: number[] = [];
  private inputTimestamps: number[] = [];
  private animationCount = 0;
  private droppedFrames = 0;
  private memoryUsage = 0;
  
  // Performance tracking
  private frameCount = 0;
  private lastStatsUpdate = 0;
  private isMonitoring = false;
  
  private constructor() {
    this.startMonitoring();
  }
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastStatsUpdate = getPerformanceNow();
    
    // Start frame monitoring
    const monitorFrame = () => {
      if (!this.isMonitoring) return;
      
      this.frameStartTime = getPerformanceNow();
      this.frameCount++;
      
      // Calculate frame time
      if (this.lastFrameTime > 0) {
        const frameTime = this.frameStartTime - this.lastFrameTime;
        this.frameTimes.push(frameTime);
        
        // Keep only last 60 frames for rolling average
        if (this.frameTimes.length > 60) {
          this.frameTimes.shift();
        }
        
        // Detect dropped frames (>33ms = under 30fps)
        if (frameTime > 33) {
          this.droppedFrames++;
        }
      }
      
      this.lastFrameTime = this.frameStartTime;
      
      // Update stats every second
      if (this.frameStartTime - this.lastStatsUpdate > 1000) {
        this.updateStats();
        this.lastStatsUpdate = this.frameStartTime;
      }
      
      requestAnimationFrame(monitorFrame);
    };
    
    requestAnimationFrame(monitorFrame);
    
    // Memory monitoring (simplified for React Native)
    setInterval(() => {
      this.updateMemoryUsage();
    }, 5000);
  }
  
  stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  recordInputLatency(inputTimestamp: number): void {
    const processingTime = getPerformanceNow() - inputTimestamp;
    this.inputTimestamps.push(processingTime);
    
    // Keep only last 30 input samples
    if (this.inputTimestamps.length > 30) {
      this.inputTimestamps.shift();
    }
  }
  
  incrementAnimationCount(): void {
    this.animationCount++;
  }
  
  decrementAnimationCount(): void {
    this.animationCount = Math.max(0, this.animationCount - 1);
  }
  
  private updateStats(): void {
    const config = useTuningStore.getState().config;
    
    if (!config.performance.enablePerformanceMonitoring) return;
    
    // Calculate FPS
    const fps = this.frameTimes.length > 0 ? 
      1000 / (this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length) : 60;
    
    // Calculate average frame time
    const avgFrameTime = this.frameTimes.length > 0 ?
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length : 16.67;
    
    // Calculate average input latency
    const avgInputLatency = this.inputTimestamps.length > 0 ?
      this.inputTimestamps.reduce((a, b) => a + b, 0) / this.inputTimestamps.length : 0;
    
    const stats: PerformanceStats = {
      fps: Math.round(fps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      inputLatency: Math.round(avgInputLatency * 100) / 100,
      memoryUsage: this.memoryUsage,
      activeAnimations: this.animationCount,
      droppedFrames: this.droppedFrames,
    };
    
    useTuningStore.getState().updatePerformanceStats(stats);
    
    // Reset frame count and dropped frames
    this.frameCount = 0;
    this.droppedFrames = 0;
  }
  
  private updateMemoryUsage(): void {
    // Simplified memory tracking for React Native
    // In a real implementation, we'd use a native module
    try {
      if (typeof performance !== 'undefined' && performance.memory) {
        const memory = performance.memory;
        this.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      } else {
        // Fallback estimation based on active animations
        this.memoryUsage = 50 + (this.animationCount * 0.5);
      }
    } catch (error) {
      // Fallback for React Native
      this.memoryUsage = 50 + (this.animationCount * 0.5);
    }
  }
  
  // Performance optimization helpers
  shouldSkipFrame(): boolean {
    const config = useTuningStore.getState().config;
    const currentFPS = useTuningStore.getState().performance.fps;
    
    return currentFPS < config.performance.targetFPS * 0.8;
  }
  
  shouldReduceAnimations(): boolean {
    const config = useTuningStore.getState().config;
    return this.animationCount > config.performance.maxConcurrentAnimations;
  }
  
  getOptimalFrameInterval(): number {
    const config = useTuningStore.getState().config;
    const currentFPS = useTuningStore.getState().performance.fps;
    
    if (currentFPS < config.performance.targetFPS * 0.7) {
      // Reduce to 30fps if performance is poor
      return 1000 / 30;
    }
    
    return 1000 / config.performance.targetFPS;
  }
  
  // Debug helpers
  getDebugInfo(): {
    isMonitoring: boolean;
    frameCount: number;
    recentFrameTimes: number[];
    recentInputLatencies: number[];
    animationCount: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      frameCount: this.frameCount,
      recentFrameTimes: [...this.frameTimes],
      recentInputLatencies: [...this.inputTimestamps],
      animationCount: this.animationCount,
    };
  }
}

// Performance optimization utilities
export const PerformanceUtils = {
  // Throttle function calls to target frame rate
  throttleToFrameRate: (callback: Function, targetFPS: number = 60) => {
    let lastCall = 0;
    const interval = 1000 / targetFPS;
    
    return function(this: any, ...args: any[]) {
      const now = getPerformanceNow();
      if (now - lastCall >= interval) {
        lastCall = now;
        return callback.apply(this, args);
      }
    };
  },
  
  // Debounce for expensive operations
  debounce: (callback: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
  },
  
  // Batch DOM updates
  batchUpdates: (() => {
    let updateQueue: Function[] = [];
    let isScheduled = false;
    
    return (callback: Function) => {
      updateQueue.push(callback);
      
      if (!isScheduled) {
        isScheduled = true;
        requestAnimationFrame(() => {
          const updates = [...updateQueue];
          updateQueue = [];
          isScheduled = false;
          
          updates.forEach(update => update());
        });
      }
    };
  })(),
  
  // Check if device supports high refresh rate
  supportsHighRefreshRate: (): boolean => {
    // Check for 120Hz+ support (React Native fallback)
    try {
      if (typeof window !== 'undefined' && window.screen?.refreshRate) {
        return window.screen.refreshRate > 60;
      }
      return false; // Conservative fallback for React Native
    } catch (error) {
      return false;
    }
  },
  
  // Memory pressure detection
  isMemoryPressureHigh: (): boolean => {
    const stats = useTuningStore.getState().performance;
    const config = useTuningStore.getState().config;
    
    return stats.memoryUsage > 100 || stats.activeAnimations > config.performance.maxConcurrentAnimations;
  },
};