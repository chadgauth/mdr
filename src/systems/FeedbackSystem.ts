import { FeedbackOptions } from '../types';
import { GameConfig, SeveranceColors } from '../utils/constants';
import { useGameStore } from '../stores/gameStore';
import { useTuningStore } from '../stores/tuningStore';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import HapticFeedback from 'react-native-haptic-feedback';

export class FeedbackSystem {
  private static instance: FeedbackSystem;
  
  // Audio state (simplified for React Native)
  private audioEnabled = true;
  private activeAudioTimeouts: number[] = [];
  
  // Haptic feedback state
  private hapticEnabled = true;
  private lastHapticTime = 0;
  
  // Visual feedback state
  private visualEffects: Map<string, { startTime: number; duration: number; intensity: number }> = new Map();
  
  private constructor() {
    this.initializeAudio();
  }
  
  static getInstance(): FeedbackSystem {
    if (!FeedbackSystem.instance) {
      FeedbackSystem.instance = new FeedbackSystem();
    }
    return FeedbackSystem.instance;
  }
  
  private initializeAudio(): void {
    // Initialize audio system for React Native
    // We'll use a simplified approach for mobile devices
    this.audioEnabled = true;
  }
  
  // Main feedback trigger methods
  triggerSuccess(): void {
    const config = useTuningStore.getState().config;
    const feedback = GameConfig.feedback.success;
    
    // Record performance timing
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.recordInputLatency(Date.now());
    
    if (config.feedback.visualEnabled) {
      this.showVisualFeedback('success', {
        duration: feedback.visualDuration,
        intensity: feedback.visualIntensity * config.feedback.visualIntensity,
        color: SeveranceColors.captureSuccess,
      });
    }
    
    if (config.feedback.audioEnabled) {
      this.playAudioFeedback({
        frequency: [...feedback.audioFrequency],
        duration: feedback.audioDuration,
        type: feedback.audioTone,
      });
    }
    
    this.triggerHapticFeedback({
      pattern: feedback.hapticPattern,
      intensity: feedback.hapticIntensity * config.feedback.hapticIntensity,
      duration: feedback.hapticDuration,
    });
    
    // Update game state for feedback
    useGameStore.getState().showFeedback('success', 'Capture successful!');
    
    // Hide feedback after duration
    setTimeout(() => {
      useGameStore.getState().hideFeedback();
    }, feedback.visualDuration);
  }
  
  triggerFailure(): void {
    const feedback = GameConfig.feedback.failure;
    
    this.showVisualFeedback('failure', {
      duration: feedback.visualDuration,
      intensity: feedback.visualIntensity,
      color: SeveranceColors.captureFailure,
    });
    this.playAudioFeedback({
      frequency: [...feedback.audioFrequency],
      duration: feedback.audioDuration,
      type: feedback.audioTone,
    });
    this.triggerHapticFeedback({
      pattern: feedback.hapticPattern === 'error' ? 'failure' : feedback.hapticPattern,
      intensity: feedback.hapticIntensity,
      duration: feedback.hapticDuration,
    });
    
    // Update game state for feedback
    useGameStore.getState().showFeedback('failure', 'Capture failed!');
    
    // Hide feedback after duration
    setTimeout(() => {
      useGameStore.getState().hideFeedback();
    }, feedback.visualDuration);
  }
  
  triggerModeSwitch(): void {
    const config = useTuningStore.getState().config;
    const feedback = GameConfig.feedback.modeSwitch;
    
    // Record performance timing
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.recordInputLatency(Date.now());
    
    if (config.feedback.visualEnabled) {
      this.showVisualFeedback('mode_switch', {
        duration: feedback.visualDuration,
        intensity: feedback.visualIntensity * config.feedback.visualIntensity,
        color: SeveranceColors.primaryText,
      });
    }
    
    if (config.feedback.audioEnabled) {
      this.playAudioFeedback({
        frequency: feedback.audioFrequency,
        duration: feedback.audioDuration,
        type: feedback.audioTone,
      });
    }
    
    this.triggerHapticFeedback({
      pattern: feedback.hapticPattern,
      intensity: feedback.hapticIntensity * config.feedback.hapticIntensity,
      duration: feedback.hapticDuration,
    });
  }
  
  // Visual feedback methods
  private showVisualFeedback(type: string, options: FeedbackOptions['visual']): void {
    const effectId = `${type}_${Date.now()}`;
    
    this.visualEffects.set(effectId, {
      startTime: Date.now(),
      duration: options.duration,
      intensity: options.intensity,
    });
    
    // Apply visual effects to game state
    switch (type) {
      case 'success':
        this.applySuccessVisuals(options);
        break;
      case 'failure':
        this.applyFailureVisuals(options);
        break;
      case 'mode_switch':
        this.applyModeSwitchVisuals(options);
        break;
    }
  }
  
  private applySuccessVisuals(options: FeedbackOptions['visual']): void {
    // Create success visual effects
    // This could involve screen flash, particle effects, etc.
    console.log('Applying success visual effects');
    
    // Example: Update cursor glow for success
    useGameStore.getState().updateCursorGlow(options.intensity);
  }
  
  private applyFailureVisuals(_: FeedbackOptions['visual']): void {
    // Create failure visual effects
    // This could involve screen shake, red flash, etc.
    console.log('Applying failure visual effects');
    
    // Example: Trigger lasso shake effect
    // This would be handled by the rendering system
  }
  
  private applyModeSwitchVisuals(_: FeedbackOptions['visual']): void {
    // Create mode switch visual effects
    // This could involve transition animation, color change, etc.
    console.log('Applying mode switch visual effects');
  }
  
  // Audio feedback methods
  private playAudioFeedback(options: FeedbackOptions['audio']): void {
    if (!this.audioEnabled) return;
    
    // Simplified audio feedback for React Native
    // In a real implementation, we would use React Native Sound or similar
    const frequencies = Array.isArray(options.frequency) ? options.frequency : [options.frequency];
    
    frequencies.forEach((frequency) => {
      // Simulate audio feedback with console logging
      console.log(`Playing audio: ${frequency}Hz, ${options.duration}ms, ${options.type}`);
      
      // In a real implementation, we would play actual audio here
      // For now, we'll use timeouts to simulate timing
      const timeout = setTimeout(() => {
        console.log(`Audio feedback complete: ${frequency}Hz`);
      }, options.duration);
      
      this.activeAudioTimeouts.push(timeout);
    });
  }
  
  // Haptic feedback methods
  private triggerHapticFeedback(options: FeedbackOptions['haptic']): void {
    if (!this.hapticEnabled) return;
    
    // Check haptic cooldown
    const now = Date.now();
    if (now - this.lastHapticTime < 100) return; // 100ms cooldown
    this.lastHapticTime = now;
    
    // Trigger haptic feedback based on pattern
    switch (options.pattern) {
      case 'success':
        this.triggerSuccessHaptic(options);
        break;
      case 'failure':
        this.triggerFailureHaptic(options);
        break;
      case 'light':
        this.triggerLightHaptic(options);
        break;
      case 'sharp':
        this.triggerSharpHaptic(options);
        break;
    }
  }
  
  private triggerSuccessHaptic(options: FeedbackOptions['haptic']): void {
    const config = useTuningStore.getState().config;
    if (!config.feedback.hapticEnabled) return;
    
    try {
      const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };
      
      // Use React Native Haptic Feedback for success
      HapticFeedback.trigger('notificationSuccess', hapticOptions);
      console.log(`Triggered success haptic: ${options.duration}ms`);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
  
  private triggerFailureHaptic(options: FeedbackOptions['haptic']): void {
    const config = useTuningStore.getState().config;
    if (!config.feedback.hapticEnabled) return;
    
    try {
      const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };
      
      // Use React Native Haptic Feedback for failure
      HapticFeedback.trigger('notificationError', hapticOptions);
      console.log(`Triggered failure haptic: ${options.duration}ms`);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
  
  private triggerLightHaptic(options: FeedbackOptions['haptic']): void {
    const config = useTuningStore.getState().config;
    if (!config.feedback.hapticEnabled) return;
    
    try {
      const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };
      
      // Use React Native Haptic Feedback for light touch
      HapticFeedback.trigger('impactLight', hapticOptions);
      console.log(`Triggered light haptic: ${options.duration}ms`);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
  
  private triggerSharpHaptic(options: FeedbackOptions['haptic']): void {
    const config = useTuningStore.getState().config;
    if (!config.feedback.hapticEnabled) return;
    
    try {
      const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };
      
      // Use React Native Haptic Feedback for sharp impact
      HapticFeedback.trigger('impactHeavy', hapticOptions);
      console.log(`Triggered sharp haptic: ${options.duration}ms`);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
  
  // Visual effect management
  updateVisualEffects(): void {
    const now = Date.now();
    const expiredEffects: string[] = [];
    
    // Update and clean up expired effects
    this.visualEffects.forEach((effect, effectId) => {
      const elapsed = now - effect.startTime;
      
      if (elapsed > effect.duration) {
        expiredEffects.push(effectId);
      } else {
        // Update effect intensity based on elapsed time
        const remaining = 1 - (elapsed / effect.duration);
        const currentIntensity = effect.intensity * remaining;
        
        // Apply current intensity to visual effects
        this.updateVisualEffectIntensity(effectId, currentIntensity);
      }
    });
    
    // Remove expired effects
    expiredEffects.forEach(effectId => {
      this.visualEffects.delete(effectId);
    });
  }
  
  private updateVisualEffectIntensity(effectId: string, intensity: number): void {
    // Update the intensity of a specific visual effect
    // This would be used for fading, pulsing, etc.
    console.log(`Updating visual effect ${effectId} intensity to ${intensity}`);
  }
  
  // Audio cleanup
  stopAllAudio(): void {
    this.activeAudioTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.activeAudioTimeouts = [];
  }
  
  // Haptic control
  setHapticEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
  }
  
  isHapticEnabled(): boolean {
    return this.hapticEnabled;
  }
  
  // Visual effect control
  addVisualEffect(type: string, duration: number, intensity: number): void {
    const effectId = `${type}_${Date.now()}`;
    this.visualEffects.set(effectId, {
      startTime: Date.now(),
      duration,
      intensity,
    });
  }
  
  removeVisualEffect(type: string): void {
    const effectId = `${type}_${Date.now()}`;
    this.visualEffects.delete(effectId);
  }
  
  // Performance monitoring
  getFeedbackStats(): {
    activeEffects: number;
    activeAudioTimeouts: number;
    hapticEnabled: boolean;
    lastHapticTime: number;
  } {
    return {
      activeEffects: this.visualEffects.size,
      activeAudioTimeouts: this.activeAudioTimeouts.length,
      hapticEnabled: this.hapticEnabled,
      lastHapticTime: this.lastHapticTime,
    };
  }
  
  // Reset feedback system
  reset(): void {
    this.stopAllAudio();
    this.visualEffects.clear();
    this.lastHapticTime = 0;
  }
  
  // Custom feedback methods for specific game events
  triggerNumberCapture(numberValue: number, temper: string): void {
    // Custom feedback for capturing specific numbers
    console.log(`Captured number ${numberValue} of temper ${temper}`);
    
    // Could play different tones based on number value
    const frequency = 200 + (numberValue * 10);
    this.playAudioFeedback({
      frequency,
      duration: 200,
      type: 'system',
    });
  }
  
  triggerComboMultiplier(combo: number): void {
    // Feedback for combo multipliers
    console.log(`Combo x${combo}!`);
    
    // Play ascending tones for combo
    const frequencies = [440, 554, 659]; // A, C#, E
    const comboIndex = Math.min(combo - 1, frequencies.length - 1);
    
    this.playAudioFeedback({
      frequency: frequencies[comboIndex] ?? [],
      duration: 300,
      type: 'harmonic',
    });
  }
  
  triggerTemperComplete(temper: string): void {
    // Feedback for completing a temper category
    console.log(`Temper ${temper} completed!`);
    
    // Play victory fanfare
    const frequencies = [523, 659, 784, 1047]; // C, E, G, C (octave)
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playAudioFeedback({
          frequency: freq,
          duration: 200,
          type: 'harmonic',
        });
      }, index * 100);
    });
  }
}