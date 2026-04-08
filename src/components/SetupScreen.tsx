import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
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
  const goToStats = useGameStore((s) => s.goToStats);
  const [n, setN] = useState(3);
  const [m, setM] = useState(2);
  const [mode, setMode] = useState<GameMode>('oneoff');
  const [raceTimeSecs, setRaceTimeSecs] = useState(60);
  const [peekMode, setPeekMode] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gauss Game</Text>
      <Text style={styles.subtitle}>Matrix row/column operations mod m</Text>

      <View style={styles.goalBox}>
        <Text style={styles.goalTitle}>How to play</Text>
        <Text style={styles.goalText}>
          You see two matrices: <Text style={styles.bold}>Target</Text> and{' '}
          <Text style={styles.bold}>Current</Text>. Your goal is to transform{' '}
          <Text style={styles.bold}>Current</Text> into{' '}
          <Text style={styles.bold}>Target</Text> using row and column operations.
        </Text>
        <Text style={styles.goalText}>
          Tap a row button (R0, R1…) or column button (C0, C1…) to select it, then tap
          another to add the first into the second — all values are taken modulo m.
        </Text>
      </View>

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

      <View style={styles.section}>
        <TouchableOpacity style={styles.toggleRow} onPress={() => setPeekMode((v) => !v)} activeOpacity={0.7}>
          <View style={styles.toggleLabel}>
            <Text style={styles.label}>👁 Peek Mode</Text>
            <Text style={styles.toggleHint}>Memorize the target first, then solve without seeing it. Peek as needed.</Text>
          </View>
          <Switch
            value={peekMode}
            onValueChange={setPeekMode}
            trackColor={{ false: '#ccc', true: '#4a90d9' }}
            thumbColor="#fff"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() =>
          startGame({ n, m, mode, raceTimeSecs: mode === 'race' ? raceTimeSecs : undefined, peekMode })
        }
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statsLink} onPress={goToStats}>
        <Text style={styles.statsLinkText}>📊 View Statistics</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  goalBox: {
    width: '100%',
    backgroundColor: '#e8f0fb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90d9',
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
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
    flexWrap: 'wrap',
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleLabel: {
    flex: 1,
  },
  toggleHint: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
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
  statsLink: {
    marginTop: 14,
    paddingVertical: 8,
  },
  statsLinkText: {
    color: '#4a90d9',
    fontSize: 15,
    fontWeight: '600',
  },
});
