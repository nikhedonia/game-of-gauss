import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { GameMode } from '../types';

const SIZES = [2, 3, 4, 5];
const MODULI = [2, 3, 4, 5];
const RACE_TIMES = [
  { label: '1 min', secs: 60 },
  { label: '3 min', secs: 180 },
  { label: '5 min', secs: 300 },
];

export default function SetupScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const [n, setN] = useState(3);
  const [m, setM] = useState(2);
  const [mode, setMode] = useState<GameMode>('oneoff');
  const [raceTimeSecs, setRaceTimeSecs] = useState(60);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gauss Game</Text>
      <Text style={styles.subtitle}>Transform the matrix using row/column addition mod m</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Matrix Size (N)</Text>
        <View style={styles.row}>
          {SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.option, n === size && styles.optionSelected]}
              onPress={() => setN(size)}
            >
              <Text style={[styles.optionText, n === size && styles.optionTextSelected]}>
                {size}×{size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Modulus (m)</Text>
        <View style={styles.row}>
          {MODULI.map((mod) => (
            <TouchableOpacity
              key={mod}
              style={[styles.option, m === mod && styles.optionSelected]}
              onPress={() => setM(mod)}
            >
              <Text style={[styles.optionText, m === mod && styles.optionTextSelected]}>
                {mod}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Game Mode</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.option, mode === 'oneoff' && styles.optionSelected]}
            onPress={() => setMode('oneoff')}
          >
            <Text style={[styles.optionText, mode === 'oneoff' && styles.optionTextSelected]}>
              One-off
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, mode === 'race' && styles.optionSelected]}
            onPress={() => setMode('race')}
          >
            <Text style={[styles.optionText, mode === 'race' && styles.optionTextSelected]}>
              Race
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'race' && (
        <View style={styles.section}>
          <Text style={styles.label}>Time Limit</Text>
          <View style={styles.row}>
            {RACE_TIMES.map(({ label, secs }) => (
              <TouchableOpacity
                key={secs}
                style={[styles.option, raceTimeSecs === secs && styles.optionSelected]}
                onPress={() => setRaceTimeSecs(secs)}
              >
                <Text
                  style={[
                    styles.optionText,
                    raceTimeSecs === secs && styles.optionTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.startButton}
        onPress={() =>
          startGame({ n, m, mode, raceTimeSecs: mode === 'race' ? raceTimeSecs : undefined })
        }
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#4a90d9',
    backgroundColor: '#4a90d9',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  startButton: {
    marginTop: 24,
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
