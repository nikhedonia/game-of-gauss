import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function BottomButtonsBar() {
  const config = useGameStore((s) => s.config);
  const solved = useGameStore((s) => s.solved);
  const gameOver = useGameStore((s) => s.gameOver);
  const nextPuzzle = useGameStore((s) => s.nextPuzzle);
  const resetPuzzle = useGameStore((s) => s.resetPuzzle);
  const backToSetup = useGameStore((s) => s.backToSetup);

  return (
    <View style={styles.container}>
      {solved && config.mode === 'oneoff' && (
        <TouchableOpacity style={styles.btn} onPress={nextPuzzle}>
          <Text style={styles.btnText}>Next Puzzle</Text>
        </TouchableOpacity>
      )}
      {!gameOver && (
        <TouchableOpacity style={styles.btn} onPress={resetPuzzle}>
          <Text style={styles.btnText}>Reset</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={backToSetup}>
        <Text style={[styles.btnText, styles.btnSecondaryText]}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  btn: {
    backgroundColor: '#4a90d9',
    paddingHorizontal: 18,
    paddingVertical: 10,
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
