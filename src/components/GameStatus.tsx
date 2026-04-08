import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function GameStatus() {
  const config = useGameStore((s) => s.config);
  const moveCount = useGameStore((s) => s.moveCount);
  const solved = useGameStore((s) => s.solved);
  const gameOver = useGameStore((s) => s.gameOver);
  const elapsedSecs = useGameStore((s) => s.elapsedSecs);
  const solvedCount = useGameStore((s) => s.solvedCount);
  const nextPuzzle = useGameStore((s) => s.nextPuzzle);
  const resetPuzzle = useGameStore((s) => s.resetPuzzle);
  const backToSetup = useGameStore((s) => s.backToSetup);

  const remaining =
    config.mode === 'race' && config.raceTimeSecs
      ? Math.max(0, config.raceTimeSecs - elapsedSecs)
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{moveCount}</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            {config.mode === 'race' ? 'Time Left' : 'Elapsed'}
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
      </View>

      {solved && config.mode === 'oneoff' && (
        <View style={styles.messageBox}>
          <Text style={styles.solvedText}>🎉 Solved!</Text>
          <TouchableOpacity style={styles.btn} onPress={nextPuzzle}>
            <Text style={styles.btnText}>Next Puzzle</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameOver && (
        <View style={styles.messageBox}>
          <Text style={styles.gameOverText}>⏰ Game Over!</Text>
          <Text style={styles.finalScore}>Puzzles solved: {solvedCount}</Text>
        </View>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btn} onPress={resetPuzzle}>
          <Text style={styles.btnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={backToSetup}>
          <Text style={[styles.btnText, styles.btnSecondaryText]}>Menu</Text>
        </TouchableOpacity>
      </View>
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
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
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
  messageBox: {
    alignItems: 'center',
    marginBottom: 8,
  },
  solvedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 6,
  },
  gameOverText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  finalScore: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  btn: {
    backgroundColor: '#4a90d9',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4a90d9',
  },
  btnSecondaryText: {
    color: '#4a90d9',
  },
});
