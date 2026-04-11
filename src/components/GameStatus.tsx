import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function GameStatus() {
  const config = useGameStore((s) => s.config);
  const moveCount = useGameStore((s) => s.moveCount);
  const elapsedSecs = useGameStore((s) => s.elapsedSecs);
  const solvedCount = useGameStore((s) => s.solvedCount);
  const peekCount = useGameStore((s) => s.peekCount);
  const peekPhase = useGameStore((s) => s.peekPhase);

  const remaining =
    config.mode === 'race' && config.raceTimeSecs
      ? Math.max(0, config.raceTimeSecs - elapsedSecs)
      : null;

  const showStats = !config.peekMode || peekPhase === 'solve';

  return (
    <View style={styles.container}>
      {showStats && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{moveCount}</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              {config.mode === 'race' ? 'Time Left' : 'Time'}
            </Text>
            <Text style={[styles.statValue, remaining !== null && remaining < 10 && styles.urgentText]}>
              {remaining !== null ? formatTime(remaining) : formatTime(elapsedSecs)}
            </Text>
          </View>

          {config.mode === 'race' && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Solved</Text>
              <Text style={styles.statValue}>{solvedCount}</Text>
            </View>
          )}

          {config.peekMode && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Peeks</Text>
              <Text style={styles.statValue}>{peekCount}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  urgentText: {
    color: '#e74c3c',
  },
});
