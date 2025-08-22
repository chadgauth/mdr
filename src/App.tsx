import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MDRInterface } from './components/MDRInterface';
import { useGameStore } from './stores/gameStore';

export default function App() {
  // Initialize game state
  React.useEffect(() => {
    useGameStore.getState().resetGame();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <MDRInterface />
      </View>
    </SafeAreaProvider>
  );
}