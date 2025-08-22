import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tuning configuration interface
export interface TuningConfig {
  // Performance settings
  performance: {
    targetFPS: number;
    inputLatencyTarget: number;
    enablePerformanceMonitoring: boolean;
    maxConcurrentAnimations: number;
  };
  
  // Jitter animation settings
  jitter: {
    intensity: 'subtle' | 'moderate' | 'dramatic' | 'extreme';
    enableJitter: boolean;
    staticPercentage: number;
    moderatePercentage: number;
    strongPercentage: number;
    extremePercentage: number;
  };
  
  // Cursor physics
  cursor: {
    sensitivity: number;
    momentum: number;
    friction: number;
    velocityThreshold: number;
  };
  
  // Fisheye effect
  fisheye: {
    enabled: boolean;
    radius: number;
    maxScale: number;
    nudgeDistance: number;
  };
  
  // Feedback settings
  feedback: {
    hapticEnabled: boolean;
    audioEnabled: boolean;
    visualEnabled: boolean;
    hapticIntensity: number;
    audioVolume: number;
    visualIntensity: number;
  };
  
  // Grid appearance
  grid: {
    cellSize: number;
    cellHeight: number;
    digitColor: string;
    backgroundColor: string;
  };
}

// Default tuning configuration
const defaultConfig: TuningConfig = {
  performance: {
    targetFPS: 60,
    inputLatencyTarget: 16,
    enablePerformanceMonitoring: true,
    maxConcurrentAnimations: 100,
  },
  jitter: {
    intensity: 'dramatic',
    enableJitter: true,
    staticPercentage: 5,
    moderatePercentage: 50,
    strongPercentage: 30,
    extremePercentage: 15,
  },
  cursor: {
    sensitivity: 8.0,
    momentum: 0.15,
    friction: 0.88,
    velocityThreshold: 800,
  },
  fisheye: {
    enabled: true,
    radius: 80,
    maxScale: 1.2,
    nudgeDistance: 3,
  },
  feedback: {
    hapticEnabled: true,
    audioEnabled: true,
    visualEnabled: true,
    hapticIntensity: 0.8,
    audioVolume: 0.7,
    visualIntensity: 1.0,
  },
  grid: {
    cellSize: 42,
    cellHeight: 42,
    digitColor: '#00FFCC',
    backgroundColor: '#0D1216',
  },
};

// Performance monitoring interface
export interface PerformanceStats {
  fps: number;
  frameTime: number;
  inputLatency: number;
  memoryUsage: number;
  activeAnimations: number;
  droppedFrames: number;
}

// Tuning store interface
export interface TuningStore {
  config: TuningConfig;
  performance: PerformanceStats;
  isDebugMode: boolean;
  
  // Configuration methods
  updateConfig: (section: keyof TuningConfig, updates: Partial<TuningConfig[keyof TuningConfig]>) => void;
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (configJson: string) => void;
  
  // Performance monitoring
  updatePerformanceStats: (stats: Partial<PerformanceStats>) => void;
  toggleDebugMode: () => void;
  
  // Preset configurations
  applyPreset: (preset: 'performance' | 'visual' | 'battery') => void;
}

export const useTuningStore = create<TuningStore>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      performance: {
        fps: 60,
        frameTime: 16.67,
        inputLatency: 12,
        memoryUsage: 85,
        activeAnimations: 0,
        droppedFrames: 0,
      },
      isDebugMode: false,
      
      updateConfig: (section, updates) => {
        set((state) => ({
          config: {
            ...state.config,
            [section]: {
              ...state.config[section],
              ...updates,
            },
          },
        }));
      },
      
      resetToDefaults: () => {
        set({ config: defaultConfig });
      },
      
      exportConfig: () => {
        return JSON.stringify(get().config, null, 2);
      },
      
      importConfig: (configJson: string) => {
        try {
          const importedConfig = JSON.parse(configJson);
          set({ config: { ...defaultConfig, ...importedConfig } });
        } catch (error) {
          console.error('Failed to import config:', error);
        }
      },
      
      updatePerformanceStats: (stats) => {
        set((state) => ({
          performance: {
            ...state.performance,
            ...stats,
          },
        }));
      },
      
      toggleDebugMode: () => {
        set((state) => ({ isDebugMode: !state.isDebugMode }));
      },
      
      applyPreset: (preset) => {
        const presets = {
          performance: {
            ...defaultConfig,
            performance: {
              ...defaultConfig.performance,
              targetFPS: 60,
              inputLatencyTarget: 12,
              maxConcurrentAnimations: 50,
            },
            jitter: {
              ...defaultConfig.jitter,
              intensity: 'moderate' as const,
            },
            fisheye: {
              ...defaultConfig.fisheye,
              enabled: false,
            },
          },
          visual: {
            ...defaultConfig,
            jitter: {
              ...defaultConfig.jitter,
              intensity: 'extreme' as const,
            },
            fisheye: {
              ...defaultConfig.fisheye,
              maxScale: 1.4,
              nudgeDistance: 5,
            },
            feedback: {
              ...defaultConfig.feedback,
              visualIntensity: 1.2,
            },
          },
          battery: {
            ...defaultConfig,
            performance: {
              ...defaultConfig.performance,
              targetFPS: 30,
              maxConcurrentAnimations: 25,
            },
            jitter: {
              ...defaultConfig.jitter,
              intensity: 'subtle' as const,
            },
            feedback: {
              ...defaultConfig.feedback,
              hapticEnabled: false,
              visualIntensity: 0.6,
            },
          },
        };
        
        set({ config: presets[preset] });
      },
    }),
    {
      name: 'mdr-tuning-config',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ config: state.config }),
    }
  )
);