import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Dimensions, PanResponder } from 'react-native';
import { useGameStore } from '../stores/gameStore';
import { useTuningStore } from '../stores/tuningStore';
import { FeedbackSystem } from '../systems/FeedbackSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// MDR Terminal Grid - Text-based implementation for reliability
export const MDRTerminalGrid: React.FC = () => {
  const { cursor, updateCursorPosition, setCursorMode, updateCursorVelocity } = useGameStore();
  const { config } = useTuningStore();
  
  // Grid configuration from tuning store
  const CELL_SIZE = config.grid.cellSize;
  const CELL_HEIGHT = config.grid.cellHeight;
  const cols = Math.floor(screenWidth / CELL_SIZE);
  const rows = Math.floor((screenHeight - 120) / CELL_HEIGHT);
  
  // Jitter intensity presets
  const JITTER_PRESETS = {
    subtle: { multiplier: .55, name: 'Subtle' },
    moderate: { multiplier: .63, name: 'Moderate' },
    dramatic: { multiplier: .75, name: 'Dramatic' },
    extreme: { multiplier: 1, name: 'Extreme' },
  };

  
  // State for animation and interaction
  const [globalTime, setGlobalTime] = useState(0);
  const [worldScale, setWorldScale] = useState(1.0);
  const [isLassoMode, setIsLassoMode] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<Array<{ x: number; y: number }>>([]);
  
  const [cursorVelocity, setCursorVelocity] = useState({ x: 0, y: 0 });
  
  // Refs for performance
  const lastPanTime = useRef(Date.now());
  const velocityTracker = useRef({ x: 0, y: 0 });
  const momentumAnimationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackSystem = useRef(FeedbackSystem.getInstance());
  
  // Initialize cursor position
  useEffect(() => {
    updateCursorPosition({
      x: screenWidth / 2,
      y: (screenHeight - 120) / 2
    });
  }, [updateCursorPosition]);
  
  // Grid with subtle jitter animation
  const generateJitteryGrid = useCallback(() => {
    const grid: Array<Array<{ digit: number; baseX: number; baseY: number; jitterType: number; jitterPhase: number }>> = [];
    
    for (let row = 0; row < rows; row++) {
      grid[row] = [];
      for (let col = 0; col < cols; col++) {
        const worldX = col;
        const worldY = row;
        
        // Static digit based on position
        const digitSeed = (worldX * 73856093) ^ (worldY * 19349663);
        const digit = Math.abs(digitSeed) % 10;
        
        // Base position
        const baseX = col * CELL_SIZE + CELL_SIZE / 2;
        const baseY = row * CELL_HEIGHT + CELL_HEIGHT / 2;
        
        // Jitter characteristics for this digit
        const jitterSeed = (worldX * 12345) ^ (worldY * 67890);
        const jitterType = Math.abs(jitterSeed) % 100; // 0-99 for percentage-based behavior
        const jitterPhase = (Math.abs(jitterSeed) * 0.01) % (Math.PI * 2); // Random phase offset
        
        grid[row]![col] = { digit, baseX, baseY, jitterType, jitterPhase };
      }
    }
    
    return grid;
  }, [rows, cols, globalTime]);
  
  // Maximum FPS animation loop with performance monitoring
  useEffect(() => {
    let animationId: number;
    let lastFrameTime = 0;
    
    const animate = (currentTime: number) => {
      // Performance monitoring
      const frameTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      
      // Always run at maximum frame rate for smoothness
      // Update global time with actual frame delta for smooth animation
      const actualIncrement = frameTime * 0.001; // Convert to seconds
      setGlobalTime(prev => prev + actualIncrement);
      
      // Continue animation loop at maximum FPS
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []); // Remove dependency to prevent restart
  
  // Fisheye magnification around cursor
  const getFisheyeTransform = useCallback((cellX: number, cellY: number, cursorX: number, cursorY: number) => {
    const dx = cellX - cursorX;
    const dy = cellY - cursorY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = 80; // Fisheye radius in pixels
    
    if (distance > radius) return { scale: 1, nudgeX: 0, nudgeY: 0 };
    
    const falloff = 1 - (distance / radius);
    const scale = 1 + falloff * 0.2; // Scale 1.0 to 1.2
    const nudge = falloff * 3; // Nudge outward 0-3 pixels
    
    const nudgeX = distance > 0 ? (dx / distance) * nudge : 0;
    const nudgeY = distance > 0 ? (dy / distance) * nudge : 0;
    
    return { scale, nudgeX, nudgeY };
  }, []);
  
  // Jittery grid data
  const jitteryGrid = generateJitteryGrid();
  
  // Slower jitter calculation without fade effects
  const getJitterOffset = useCallback((jitterType: number, jitterPhase: number) => {
    // Always enable jitter for maximum visual effect
    if (!config.jitter.enableJitter) {
      return { x: 0, y: 0, opacity: 1 };
    }
    
    // Slow down animation speed to 10% of original (33% of the previous 30%)
    const time = globalTime * 0.1;
    const jitterIntensity = config.jitter.intensity as keyof typeof JITTER_PRESETS;
    const intensityMultiplier = JITTER_PRESETS[jitterIntensity].multiplier;
    
    // Use tuning store percentages
    const staticThreshold = config.jitter.staticPercentage;
    const extremeThreshold = staticThreshold + config.jitter.extremePercentage;
    const strongThreshold = extremeThreshold + config.jitter.strongPercentage;
    
    if (jitterType < staticThreshold) {
      // Static - no movement
      return { x: 0, y: 0, opacity: 1 };
    } else if (jitterType < extremeThreshold) {
      // Extreme jitter - massive movement (no fade)
      const x = Math.sin(time * 4 + jitterPhase) * (15 * intensityMultiplier);
      const y = Math.cos(time * 3.5 + jitterPhase) * (12 * intensityMultiplier);
      return { x, y, opacity: 1 };
    } else if (jitterType < strongThreshold) {
      // Strong jitter - significant movement (no fade)
      const direction = jitterType % 3;
      if (direction === 0) {
        const x = Math.sin(time * 2.5 + jitterPhase) * (8 * intensityMultiplier);
        return { x, y: 0, opacity: 1 };
      } else if (direction === 1) {
        const y = Math.sin(time * 2.2 + jitterPhase) * (6 * intensityMultiplier);
        return { x: 0, y, opacity: 1 };
      } else {
        const x = Math.sin(time * 2 + jitterPhase) * (5 * intensityMultiplier);
        const y = Math.cos(time * 1.8 + jitterPhase) * (4 * intensityMultiplier);
        return { x, y, opacity: 1 };
      }
    } else {
      // Moderate jitter - controlled movement (no fade)
      const x = Math.sin(time * 1.5 + jitterPhase) * (3 * intensityMultiplier);
      const y = Math.cos(time * 1.2 + jitterPhase) * (2.5 * intensityMultiplier);
      return { x, y, opacity: 1 };
    }
  }, [globalTime, config.jitter]);
  
  // Pan responder for input handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: () => {
      const now = Date.now();
      lastPanTime.current = now;
      
      // Store timer reference for cleanup
      lastPanTime.current = now;
    },
    
    onPanResponderMove: (_, gestureState) => {
      const now = Date.now();
      const deltaTime = now - lastPanTime.current;
      lastPanTime.current = now;
      
      // Track velocity for zoom effect
      if (deltaTime > 0) {
        const speed = Math.sqrt(gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy);
        velocityTracker.current = { x: gestureState.vx, y: gestureState.vy };
        
        // Fast swipes trigger zoom out (0.92-0.96 scale)
        if (speed > 800) {
          const zoomFactor = Math.max(0.92, 1 - (speed - 800) / 5000);
          setWorldScale(zoomFactor);
          
          // Spring back to normal scale after delay
          setTimeout(() => {
            setWorldScale(1.0);
          }, 200);
        }
      }
      
      if (isLassoMode) {
        // Joystick steering in lasso mode
        const joystickCenterX = gestureState.x0; // Initial touch X
        const joystickCenterY = gestureState.y0; // Initial touch Y
        const offsetX = gestureState.moveX - joystickCenterX;
        const offsetY = gestureState.moveY - joystickCenterY;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        
        // Joystick gain curve: small offset = slow, large offset = faster
        const maxRadius = 60; // Max joystick radius
        const deadZone = 8; // Dead zone radius
        const normalizedDistance = Math.min(distance / maxRadius, 1);
        const speed = normalizedDistance * normalizedDistance * 3; // Quadratic curve
        
        if (distance > deadZone) {
          const directionX = offsetX / distance;
          const directionY = offsetY / distance;
          
          // Move cursor based on joystick input with bounds checking
          const newCursorX = Math.max(10, Math.min(screenWidth - 10, cursor.position.x + directionX * speed));
          const newCursorY = Math.max(10, Math.min(screenHeight - 130, cursor.position.y + directionY * speed));
          
          updateCursorPosition({ x: newCursorX, y: newCursorY });
          
          // Add lasso point for smooth trail
          setLassoPoints(prev => [...prev, { x: newCursorX, y: newCursorY }]);
        }
      } else {
        // Ultra-smooth cursor movement with immediate response
        const baseSensitivity = config.cursor.sensitivity;
        const gestureSpeed = Math.sqrt(gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy);
        
        // Exponential sensitivity scaling for fast movements
        const velocityBoost = Math.min(gestureSpeed / 500, 3);
        const dynamicSensitivity = baseSensitivity * (1 + velocityBoost * 0.8);
        
        // Immediate, smooth movement - no lag
        const directMultiplier = 0.2 + (velocityBoost * 0.15);
        const deltaX = gestureState.dx * dynamicSensitivity * directMultiplier;
        const deltaY = gestureState.dy * dynamicSensitivity * directMultiplier;
        
        const newCursorX = Math.max(20, Math.min(screenWidth - 20, cursor.position.x + deltaX));
        const newCursorY = Math.max(20, Math.min(screenHeight - 130, cursor.position.y + deltaY));
        
        // Immediate position update for zero lag
        updateCursorPosition({ x: newCursorX, y: newCursorY });
        
        // Enhanced momentum calculation
        const momentumMultiplier = config.cursor.momentum * (1 + velocityBoost * 1.5);
        const newVelX = gestureState.vx * momentumMultiplier;
        const newVelY = gestureState.vy * momentumMultiplier;
        setCursorVelocity({ x: newVelX, y: newVelY });
        updateCursorVelocity({ x: newVelX, y: newVelY });
        
        // Track long press for mode switch feedback
        const currentTime = Date.now();
        if (currentTime - lastPanTime.current > 300) {
          feedbackSystem.current.triggerModeSwitch();
        }
      }
    },
    
    onPanResponderRelease: (_, gestureState) => {
      if (isLassoMode) {
        // Process lasso capture
        setIsLassoMode(false);
        setCursorMode('exploration');
        setLassoPoints([]);
        // TODO: Validate capture
      } else {
        // Capture final gesture velocity for trackball physics
        const releaseVelX = gestureState.vx;
        const releaseVelY = gestureState.vy;
        const releaseSpeed = Math.sqrt(releaseVelX * releaseVelX + releaseVelY * releaseVelY);
        
        // Trackball momentum - stronger capture for fling gestures
        let trackballMultiplier = config.cursor.momentum;
        if (releaseSpeed > 1000) {
          trackballMultiplier *= 4.0; // Strong fling = 4x momentum
        } else if (releaseSpeed > 500) {
          trackballMultiplier *= 2.5; // Medium fling = 2.5x momentum
        } else if (releaseSpeed > 200) {
          trackballMultiplier *= 1.8; // Light fling = 1.8x momentum
        }
        
        // Set initial trackball velocity with enhanced capture
        const initialVelX = releaseVelX * trackballMultiplier;
        const initialVelY = releaseVelY * trackballMultiplier;
        setCursorVelocity({ x: initialVelX, y: initialVelY });
        updateCursorVelocity({ x: initialVelX, y: initialVelY });
        
        // Trackball momentum physics with realistic inertia
        const applyMomentum = () => {
          setCursorVelocity(prev => {
            const currentSpeed = Math.sqrt(prev.x * prev.x + prev.y * prev.y);
            
            // Trackball friction - gradual slowdown like a weighted ball
            let friction = 0.96; // Higher base friction for trackball feel
            
            // Speed-dependent friction for realistic physics
            if (currentSpeed > 300) friction = 0.985; // Minimal friction for high speed
            else if (currentSpeed > 150) friction = 0.975; // Light friction for medium speed
            else if (currentSpeed > 75) friction = 0.965; // Moderate friction for slow speed
            else friction = 0.93; // Higher friction as it comes to rest
            
            const newVelX = prev.x * friction;
            const newVelY = prev.y * friction;
            
            // Stop when momentum is very low (trackball comes to rest)
            if (Math.abs(newVelX) < 0.02 && Math.abs(newVelY) < 0.02) {
              if (momentumAnimationRef.current) {
                clearInterval(momentumAnimationRef.current);
                momentumAnimationRef.current = null;
              }
              updateCursorVelocity({ x: 0, y: 0 });
              return { x: 0, y: 0 };
            }
            
            // Apply trackball movement - full velocity for realistic momentum
            const newCursorX = Math.max(20, Math.min(screenWidth - 20, cursor.position.x + newVelX));
            const newCursorY = Math.max(20, Math.min(screenHeight - 130, cursor.position.y + newVelY));
            updateCursorPosition({ x: newCursorX, y: newCursorY });
            
            // Update game store velocity
            updateCursorVelocity({ x: newVelX, y: newVelY });
            
            return { x: newVelX, y: newVelY };
          });
        };
        
        // Maximum performance for ultra-smooth trackball physics
        momentumAnimationRef.current = setInterval(applyMomentum, 6);
      }
    },
  });
  
  // Edge drag prevention - keep cursor within bounds with better margins
  useEffect(() => {
    const x = Math.max(20, Math.min(screenWidth - 20, cursor.position.x));
    const y = Math.max(20, Math.min(screenHeight - 130, cursor.position.y));
    
    if (x !== cursor.position.x || y !== cursor.position.y) {
      updateCursorPosition({ x, y });
    }
  }, [cursor.position.x, cursor.position.y, updateCursorPosition]);
  
  // Cleanup momentum animation on unmount
  useEffect(() => {
    return () => {
      if (momentumAnimationRef.current) {
        clearInterval(momentumAnimationRef.current);
      }
    };
  }, []);
  
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0b1a25ff',
        transform: [{ scale: worldScale }],
      }}
      {...panResponder.panHandlers}
    >
      {/* Render jittery grid with fisheye magnification */}
      {jitteryGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Apply fisheye magnification around cursor
          const fisheyeTransform = getFisheyeTransform(
            cell.baseX,
            cell.baseY,
            cursor.position.x,
            cursor.position.y
          );
          
          // Apply subtle jitter animation
          const jitterOffset = getJitterOffset(cell.jitterType, cell.jitterPhase);
          
          return (
            <Text
              key={`${rowIndex}-${colIndex}`}
              style={{
                position: 'absolute',
                left: cell.baseX - (8 * fisheyeTransform.scale) + fisheyeTransform.nudgeX + jitterOffset.x,
                top: cell.baseY - (10 * fisheyeTransform.scale) + fisheyeTransform.nudgeY + jitterOffset.y,
                fontSize: 16 * fisheyeTransform.scale,
                fontFamily: 'monospace',
                color: '#00FFCC',
                fontWeight: '400',
                textAlign: 'center',
                width: 16 * fisheyeTransform.scale,
                height: 20 * fisheyeTransform.scale,
                lineHeight: 16 * fisheyeTransform.scale,
                includeFontPadding: false,
                textAlignVertical: 'center',
                opacity: jitterOffset.opacity,
              }}
            >
              {cell.digit}
            </Text>
          );
        })
      )}
      
      {/* Enhanced High-Visibility Cursor */}
      <View
        style={{
          position: 'absolute',
          left: cursor.position.x - 16,
          top: cursor.position.y - 16,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow ring */}
        <View
          style={{
            position: 'absolute',
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(0, 255, 204, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(0, 255, 204, 0.3)',
          }}
        />
        
        {/* Inner bright ring */}
        <View
          style={{
            position: 'absolute',
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'rgba(0, 255, 204, 0.25)',
            borderWidth: 1,
            borderColor: 'rgba(0, 255, 204, 0.6)',
          }}
        />
        
        {/* Center crosshair */}
        <View
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Horizontal line */}
          <View
            style={{
              position: 'absolute',
              width: 12,
              height: 2,
              backgroundColor: '#00FFCC',
              borderRadius: 1,
            }}
          />
          {/* Vertical line */}
          <View
            style={{
              position: 'absolute',
              width: 2,
              height: 12,
              backgroundColor: '#00FFCC',
              borderRadius: 1,
            }}
          />
          {/* Center dot */}
          <View
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
            }}
          />
        </View>
        
        {/* Velocity indicator trail */}
        {cursorVelocity.x !== 0 || cursorVelocity.y !== 0 ? (
          <View
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0, 255, 204, 0.7)',
              left: -cursorVelocity.x * 0.1,
              top: -cursorVelocity.y * 0.1,
            }}
          />
        ) : null}
      </View>
      
      {/* Render lasso trail */}
      {lassoPoints.map((point, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: point.x - 2,
            top: point.y - 2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 255, 204, 0.6)',
          }}
        />
      ))}
    </View>
  );
};