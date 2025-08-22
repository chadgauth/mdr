import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, NumberEntity, TemperType, Point, Vector2 } from '../types';
import { GameConfig, FourTempers } from '../utils/constants';

interface GameStore extends GameState {
  // Actions
  // Session Management
  startNewSession: () => void;
  updateSessionProgress: (progress: number) => void;
  setTargetTemper: (temper: TemperType) => void;
  addCapturedNumber: (numberId: string) => void;
  updateScore: (points: number, combo?: number) => void;
  
  // World Management
  updateViewport: (viewport: { x: number; y: number; width: number; height: number }) => void;
  updateWorldScale: (scale: number) => void;
  addNumber: (number: NumberEntity) => void;
  updateNumber: (id: string, updates: Partial<NumberEntity>) => void;
  removeNumber: (id: string) => void;
  
  // Cursor Management
  updateCursorPosition: (position: Point) => void;
  setCursorMode: (mode: 'exploration' | 'pinpoint') => void;
  updateCursorVelocity: (velocity: Vector2) => void;
  updateCursorGlow: (intensity: number) => void;
  
  // Lasso Management
  startLasso: (center: Point) => void;
  addLassoPoint: (point: Point) => void;
  closeLasso: () => void;
  resetLasso: () => void;
  updateLassoCenter: (center: Point) => void;
  
  // UI Management
  updateStatusBar: (progress: number, timeElapsed: string) => void;
  updateTemperProgress: (temper: TemperType, progress: number) => void;
  setTemperComplete: (temper: TemperType, isComplete: boolean) => void;
  showFeedback: (type: 'success' | 'failure' | 'neutral', message: string) => void;
  hideFeedback: () => void;
  
  // Utility Actions
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  
  // Getters
  getVisibleNumbers: () => NumberEntity[];
  getTemperProgress: (temper: TemperType) => number;
  isTemperComplete: (temper: TemperType) => boolean;
  getSessionStats: () => {
    totalCaptured: number;
    timeElapsed: string;
    accuracy: number;
    currentCombo: number;
  };
}

const initialGameState: GameState = {
  session: {
    id: '',
    fileName: '',
    startTime: Date.now(),
    progress: 0,
    targetTemper: null,
    capturedNumbers: [],
    score: 0,
    combo: 0,
  },
  world: {
    viewport: { x: 0, y: 0, width: 0, height: 0 },
    worldSize: { width: 0, height: 0 },
    scale: 1.0,
    numbers: [],
    gridSize: GameConfig.world.gridSize,
  },
  cursor: {
    position: { x: 0, y: 0 },
    worldPosition: { x: 0, y: 0 },
    mode: 'exploration',
    velocity: { x: 0, y: 0 },
    targetPosition: { x: 0, y: 0 },
    isMoving: false,
    glowIntensity: 0.4,
  },
  lasso: {
    points: [],
    isActive: false,
    isClosed: false,
    capturedNumbers: [],
    centerPoint: { x: 0, y: 0 },
  },
  ui: {
    statusBar: {
      isVisible: true,
      progress: 0,
      timeElapsed: '00:00:00',
    },
    bottomBar: {
      activeTemper: null,
      temperProgress: {
        WO: 0,
        FC: 0,
        DR: 0,
        MA: 0,
      },
      isComplete: {
        WO: false,
        FC: false,
        DR: false,
        MA: false,
      },
    },
    feedback: {
      isVisible: false,
      type: 'neutral',
      message: '',
      timestamp: 0,
    },
  },
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialGameState,

        // Session Management
        startNewSession: () => {
          const sessionId = `session_${Date.now()}`;
          const temperKeys = Object.keys(FourTempers) as Array<keyof typeof FourTempers>;
          const randomTemperKey = temperKeys[Math.floor(Math.random() * temperKeys.length)]!;
          const fileName = FourTempers[randomTemperKey].fullName.replace(' ', '_').toUpperCase() +
                         `_${Math.floor(Math.random() * 99)}.mdr`;
          
          set({
            session: {
              id: sessionId,
              fileName,
              startTime: Date.now(),
              progress: 0,
              targetTemper: null,
              capturedNumbers: [],
              score: 0,
              combo: 0,
            },
            lasso: {
              points: [],
              isActive: false,
              isClosed: false,
              capturedNumbers: [],
              centerPoint: { x: 0, y: 0 },
            },
            ui: {
              ...get().ui,
              statusBar: {
                isVisible: true,
                progress: 0,
                timeElapsed: '00:00:00',
              },
              bottomBar: {
                activeTemper: null,
                temperProgress: {
                  WO: 0,
                  FC: 0,
                  DR: 0,
                  MA: 0,
                },
                isComplete: {
                  WO: false,
                  FC: false,
                  DR: false,
                  MA: false,
                },
              },
            },
          });
        },

        updateSessionProgress: (progress: number) => {
          set((state) => ({
            session: { ...state.session, progress },
            ui: {
              ...state.ui,
              statusBar: { ...state.ui.statusBar, progress },
            },
          }));
        },

        setTargetTemper: (temper: TemperType) => {
          set((state) => ({
            session: { ...state.session, targetTemper: temper },
            ui: {
              ...state.ui,
              bottomBar: { ...state.ui.bottomBar, activeTemper: temper },
            },
          }));
        },

        addCapturedNumber: (numberId: string) => {
          set((state) => {
            const capturedNumbers = [...state.session.capturedNumbers, numberId];
            const progress = Math.min(100, (capturedNumbers.length / GameConfig.session.targetNumbers) * 100);
            
            return {
              session: {
                ...state.session,
                capturedNumbers,
                progress,
              },
              ui: {
                ...state.ui,
                statusBar: { ...state.ui.statusBar, progress },
              },
            };
          });
        },

        updateScore: (points: number, combo?: number) => {
          set((state) => {
            const comboMultiplier = combo ? combo : state.session.combo;
            const finalPoints = points * comboMultiplier;
            
            return {
              session: {
                ...state.session,
                score: state.session.score + finalPoints,
                combo: comboMultiplier,
              },
            };
          });
        },

        // World Management
        updateViewport: (viewport: { x: number; y: number; width: number; height: number }) => {
          set((state) => ({
            world: { ...state.world, viewport },
          }));
        },

        updateWorldScale: (scale: number) => {
          set((state) => ({
            world: { ...state.world, scale: Math.max(GameConfig.viewport.minZoom, Math.min(GameConfig.viewport.maxZoom, scale)) },
          }));
        },

        addNumber: (number: NumberEntity) => {
          set((state) => ({
            world: {
              ...state.world,
              numbers: [...state.world.numbers, number],
            },
          }));
        },

        updateNumber: (id: string, updates: Partial<NumberEntity>) => {
          set((state) => ({
            world: {
              ...state.world,
              numbers: state.world.numbers.map((number) =>
                number.id === id ? { ...number, ...updates } : number
              ),
            },
          }));
        },

        removeNumber: (id: string) => {
          set((state) => ({
            world: {
              ...state.world,
              numbers: state.world.numbers.filter((number) => number.id !== id),
            },
          }));
        },

        // Cursor Management
        updateCursorPosition: (position: Point) => {
          set((state) => {
            const worldPosition = {
              x: (position.x - state.world.viewport.x) / state.world.scale,
              y: (position.y - state.world.viewport.y) / state.world.scale,
            };
            
            return {
              cursor: {
                ...state.cursor,
                position,
                worldPosition,
                isMoving: true,
              },
            };
          });
        },

        setCursorMode: (mode: 'exploration' | 'pinpoint') => {
          set((state) => ({
            cursor: {
              ...state.cursor,
              mode,
            },
          }));
        },

        updateCursorVelocity: (velocity: Vector2) => {
          set((state) => ({
            cursor: {
              ...state.cursor,
              velocity,
            },
          }));
        },

        updateCursorGlow: (intensity: number) => {
          set((state) => ({
            cursor: {
              ...state.cursor,
              glowIntensity: intensity,
            },
          }));
        },

        // Lasso Management
        startLasso: (center: Point) => {
          set(() => ({
            lasso: {
              points: [center],
              isActive: true,
              isClosed: false,
              capturedNumbers: [],
              centerPoint: center,
            },
          }));
        },

        addLassoPoint: (point: Point) => {
          set((state) => ({
            lasso: {
              ...state.lasso,
              points: [...state.lasso.points, point],
            },
          }));
        },

        closeLasso: () => {
          set((state) => ({
            lasso: {
              ...state.lasso,
              isClosed: true,
            },
          }));
        },

        resetLasso: () => {
          set(() => ({
            lasso: {
              points: [],
              isActive: false,
              isClosed: false,
              capturedNumbers: [],
              centerPoint: { x: 0, y: 0 },
            },
          }));
        },

        updateLassoCenter: (center: Point) => {
          set((state) => ({
            lasso: {
              ...state.lasso,
              centerPoint: center,
            },
          }));
        },

        // UI Management
        updateStatusBar: (progress: number, timeElapsed: string) => {
          set((state) => ({
            ui: {
              ...state.ui,
              statusBar: {
                ...state.ui.statusBar,
                progress,
                timeElapsed,
              },
            },
          }));
        },

        updateTemperProgress: (temper: TemperType, progress: number) => {
          set((state) => ({
            ui: {
              ...state.ui,
              bottomBar: {
                ...state.ui.bottomBar,
                temperProgress: {
                  ...state.ui.bottomBar.temperProgress,
                  [temper]: progress,
                },
              },
            },
          }));
        },

        setTemperComplete: (temper: TemperType, isComplete: boolean) => {
          set((state) => ({
            ui: {
              ...state.ui,
              bottomBar: {
                ...state.ui.bottomBar,
                isComplete: {
                  ...state.ui.bottomBar.isComplete,
                  [temper]: isComplete,
                },
              },
            },
          }));
        },

        showFeedback: (type: 'success' | 'failure' | 'neutral', message: string) => {
          set((state) => ({
            ui: {
              ...state.ui,
              feedback: {
                isVisible: true,
                type,
                message,
                timestamp: Date.now(),
              },
            },
          }));
        },

        hideFeedback: () => {
          set((state) => ({
            ui: {
              ...state.ui,
              feedback: {
                ...state.ui.feedback,
                isVisible: false,
              },
            },
          }));
        },

        // Utility Actions
        resetGame: () => {
          set(initialGameState);
        },

        pauseGame: () => {
          // Implementation for pausing the game
          set((state) => ({
            ...state,
            // Add pause state logic here
          }));
        },

        resumeGame: () => {
          // Implementation for resuming the game
          set((state) => ({
            ...state,
            // Add resume state logic here
          }));
        },

        // Getters
        getVisibleNumbers: () => {
          const { world } = get();
          const { viewport, scale } = world;
          
          return world.numbers.filter((number) => {
            const screenPos = {
              x: number.worldPosition.x * scale + viewport.x,
              y: number.worldPosition.y * scale + viewport.y,
            };
            
            return (
              screenPos.x >= -50 &&
              screenPos.x <= viewport.width + 50 &&
              screenPos.y >= -50 &&
              screenPos.y <= viewport.height + 50
            );
          });
        },

        getTemperProgress: (temper: TemperType) => {
          return get().ui.bottomBar.temperProgress[temper];
        },

        isTemperComplete: (temper: TemperType) => {
          return get().ui.bottomBar.isComplete[temper];
        },

        getSessionStats: () => {
          const { session, ui } = get();
          const timeElapsed = ui.statusBar.timeElapsed;
          const totalCaptured = session.capturedNumbers.length;
          const accuracy = totalCaptured > 0 ? (totalCaptured / GameConfig.session.targetNumbers) * 100 : 0;
          
          return {
            totalCaptured,
            timeElapsed,
            accuracy,
            currentCombo: session.combo,
          };
        },
      }),
      {
        name: 'mdr-game-storage',
        storage: {
          getItem: async (key: string) => {
            try {
              const value = await AsyncStorage.getItem(key);
              return value ? JSON.parse(value) : null;
            } catch {
              return null;
            }
          },
          setItem: async (key: string, value: any) => {
            try {
              await AsyncStorage.setItem(key, JSON.stringify(value));
            } catch {
              // Silently fail if storage is unavailable
            }
          },
          removeItem: async (key: string) => {
            try {
              await AsyncStorage.removeItem(key);
            } catch {
              // Silently fail if storage is unavailable
            }
          },
        },
        partialize: (state) => ({
          // Only persist essential game progress, NOT cursor/lasso real-time data
          session: {
            ...state.session,
            // Don't persist real-time data like score/combo during gameplay
          },
          world: {
            ...state.world,
            numbers: [], // Don't persist numbers, they regenerate
          },
          cursor: {
            ...state.cursor,
            position: { x: 0, y: 0 }, // Reset cursor position
            worldPosition: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            isMoving: false,
          },
          lasso: {
            points: [],
            isActive: false,
            isClosed: false,
            capturedNumbers: [],
            centerPoint: { x: 0, y: 0 },
          },
          ui: {
            ...state.ui,
            bottomBar: {
              ...state.ui.bottomBar,
              activeTemper: null, // Don't persist activeTemper
            },
          },
        }),
      }
    ),
    {
      name: 'mdr-game-store',
    }
  )
);