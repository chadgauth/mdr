import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, PanResponder, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MDRTerminalGrid } from './MDRTerminalGrid';
import { useGameStore } from '../stores/gameStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// MDR Interface - Fullscreen terminal following exact spec
export const MDRInterface: React.FC = () => {
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const [progress, setProgress] = useState(0);
  const [activeTemper, setActiveTemper] = useState<'WO' | 'FC' | 'DR' | 'MA' | null>(null);
  
  const { cursor, updateCursorPosition, setCursorMode } = useGameStore();
  const insets = useSafeAreaInsets();
  
  // Session timer
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setSessionTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Pan responder for input handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (event) => {
      // Record press start for pinpoint mode
      const { locationX, locationY } = event.nativeEvent;
      
      // Enter pinpoint mode after hold threshold (300-350ms)
      setTimeout(() => {
        setCursorMode('pinpoint');
      }, 325);
    },
    
    onPanResponderMove: (event, gestureState) => {
      const { moveX, moveY } = gestureState;
      
      // Update cursor position with velocity integration
      updateCursorPosition({ x: moveX, y: moveY });
    },
    
    onPanResponderRelease: () => {
      // Exit pinpoint mode and validate capture
      setCursorMode('exploration');
    },
  });
  
  return (
    <View style={{ flex: 1, backgroundColor: '#0D1216' }}>
      {/* Hide system bars for immersive fullscreen */}
      <StatusBar hidden />
      
      {/* Top safe area for camera bump */}
      <View style={{ height: insets.top, backgroundColor: '#0D1216' }} />
      
      {/* Top status strip with boxing and double separator */}
      <View style={{
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        backgroundColor: '#0D1216',
        borderWidth: 1,
        borderColor: '#00FFCC',
        marginHorizontal: 16,
        marginVertical: 12,
      }}>
        {/* Left: filename */}
        <Text style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#00FFCC',
          fontWeight: '400',
        }}>
          Cold Harbor
        </Text>
        
        {/* Center: progress bar */}
        <View style={{
          flex: 1,
          marginHorizontal: 32,
          alignItems: 'center',
        }}>
          <View style={{
            width: 120,
            height: 4,
            backgroundColor: 'rgba(0, 255, 204, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <View style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#00FFCC',
            }} />
          </View>
          <Text style={{
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#00FFCC',
            marginTop: 2,
          }}>
            {progress}%
          </Text>
        </View>
        
        {/* Right: session timer */}
        <Text style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#00FFCC',
          fontWeight: '400',
        }}>
          {sessionTime}
        </Text>
      </View>
      
      {/* Double separator line below status */}
      <View style={{ height: 4, backgroundColor: '#0D1216', paddingHorizontal: 8 }}>
        <View style={{ height: 1, backgroundColor: '#00FFCC', marginBottom: 2 }} />
        <View style={{ height: 1, backgroundColor: '#00FFCC' }} />
      </View>
      
      {/* Main playfield - High Performance MDR Terminal Grid */}
      <View style={{ flex: 1 }}>
        <MDRTerminalGrid />
      </View>
      
      {/* Double separator line above bins */}
      <View style={{ height: 4, backgroundColor: '#0D1216', paddingHorizontal: 8 }}>
        <View style={{ height: 1, backgroundColor: '#00FFCC', marginBottom: 2 }} />
        <View style={{ height: 1, backgroundColor: '#00FFCC' }} />
      </View>
      
      {/* Bottom bin strip */}
      <View style={{
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#0D1216',
        paddingVertical: 12,
      }}>
        {(['WO', 'FC', 'DR', 'MA'] as const).map((temper) => {
          const isActive = activeTemper === temper;
          const temperColors = {
            WO: '#FF4444', // Red
            FC: '#44FF44', // Green  
            DR: '#FFAA44', // Orange
            MA: '#AA44FF', // Purple
          };
          
          return (
            <View key={temper} style={{ alignItems: 'center' }}>
              {/* Bin button */}
              <View style={{
                width: 48,
                height: 32,
                backgroundColor: isActive ? temperColors[temper] : 'rgba(0, 255, 204, 0.2)',
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
                borderTopWidth: isActive ? 3 : 0,
                borderTopColor: '#00FFCC', // Neon cap line
              }}>
                <Text style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                  color: isActive ? '#0D1216' : '#00FFCC',
                  fontWeight: 'bold',
                }}>
                  {temper}
                </Text>
              </View>
              
              {/* Progress underbar */}
              <View style={{
                width: 40,
                height: 3,
                backgroundColor: 'rgba(0, 255, 204, 0.2)',
                marginTop: 4,
                borderRadius: 1,
                overflow: 'hidden',
              }}>
                <View style={{
                  width: '60%', // Sample progress
                  height: '100%',
                  backgroundColor: temperColors[temper],
                }} />
              </View>
            </View>
          );
        })}
      </View>
      
      {/* Single separator line above Android gesture area */}
      <View style={{ height: 1, backgroundColor: '#00FFCC', marginHorizontal: 8 }} />
      
      {/* Bottom safe area for Android gesture navigation */}
      <View style={{ height: Math.max(insets.bottom, 8), backgroundColor: '#0D1216' }} />
    </View>
  );
};