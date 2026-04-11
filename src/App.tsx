import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import BottomButtonsBar from './components/BottomButtonsBar';
import VictoryScreen from './components/VictoryScreen';
import StatsScreen from './components/StatsScreen';
import { useGameStore } from './store/gameStore';
import { trackPageView } from './analytics';

function Game() {
  const tick = useGameStore((s) => s.tick);
  const gameOver = useGameStore((s) => s.gameOver);
  const solved = useGameStore((s) => s.solved);
  const config = useGameStore((s) => s.config);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  useEffect(() => {
    if (gameOver && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [gameOver]);

  const showVictory =
    (config.mode !== 'race' && solved) || (config.mode === 'race' && gameOver);

  return (
    <View style={styles.gameContainer}>
      <GameStatus />
      <GameBoard />
      <BottomButtonsBar />
      {showVictory && <VictoryScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { 
    flex: 1, 
    width: '100%', 
    padding: 10 
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f3f4f6', 
    alignItems: 'center' 
  },
  centeredContainer: { 
    flex: 1, 
    width: '100%', 
    maxWidth: 600 
  },
  gameContainer: {
    flex: 1,
    width: '100%',
    padding: 10,
    flexDirection: 'column',
  },
});

export default function App() {
  const screen = useGameStore((s) => s.screen);

  useEffect(() => {
    trackPageView();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          {screen === 'setup' && <SetupScreen />}
          {screen === 'playing' && <Game />}
          {screen === 'stats' && <StatsScreen />}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
