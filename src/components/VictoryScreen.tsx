import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '../store/gameStore';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function VictoryScreen() {
  const config = useGameStore((s) => s.config);
  const moveCount = useGameStore((s) => s.moveCount);
  const elapsedSecs = useGameStore((s) => s.elapsedSecs);
  const solvedCount = useGameStore((s) => s.solvedCount);
  const cumulativeMoves = useGameStore((s) => s.cumulativeMoves);
  const peekCount = useGameStore((s) => s.peekCount);
  const nextPuzzle = useGameStore((s) => s.nextPuzzle);
  const backToSetup = useGameStore((s) => s.backToSetup);
  const startGame = useGameStore((s) => s.startGame);

  const isRace = config.mode === 'race';

  // Entrance animation: fade + scale in
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      tension: 70,
      friction: 9,
      useNativeDriver: false,
    }).start();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.card, { opacity: anim, transform: [{ scale }] }]}>
        {isRace ? (
          <>
            <Text style={styles.emoji}>⏱</Text>
            <Text style={styles.title}>Time's Up!</Text>
            <View style={styles.statsRow}>
              <StatBox label="Solved" value={String(solvedCount)} />
              <StatBox label="Moves" value={String(cumulativeMoves)} />
              {solvedCount > 0 && (
                <StatBox
                  label="Avg moves"
                  value={(cumulativeMoves / solvedCount).toFixed(1)}
                />
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>Solved!</Text>
            <View style={styles.statsRow}>
              <StatBox label="Moves" value={String(moveCount)} />
              <StatBox label="Time" value={formatTime(elapsedSecs)} />
              {config.peekMode && (
                <StatBox label="Peeks" value={String(peekCount)} />
              )}
            </View>
          </>
        )}

        <View style={styles.buttons}>
          {isRace ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => startGame(config)}>
              <Text style={styles.primaryBtnText}>Play Again</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={nextPuzzle}>
              <Text style={styles.primaryBtnText}>Next Puzzle →</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.secondaryBtn} onPress={backToSetup}>
            <Text style={styles.secondaryBtnText}>Menu</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 28,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1a3a5c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryBtnText: {
    color: '#1a3a5c',
    fontSize: 15,
    fontWeight: '600',
  },
});
