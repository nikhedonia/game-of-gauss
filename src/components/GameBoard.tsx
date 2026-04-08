import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getColorForValue } from '../gameLogic';

const BTN = 36;

export default function GameBoard() {
  const current = useGameStore((s) => s.current);
  const target = useGameStore((s) => s.target);
  const config = useGameStore((s) => s.config);
  const selectedRow = useGameStore((s) => s.selectedRow);
  const selectedCol = useGameStore((s) => s.selectedCol);
  const selectRow = useGameStore((s) => s.selectRow);
  const selectCol = useGameStore((s) => s.selectCol);
  const solved = useGameStore((s) => s.solved);
  const gameOver = useGameStore((s) => s.gameOver);

  const { n, m } = config;
  const cellSize = Math.min(BTN, Math.floor(240 / n));

  const disabled = solved || gameOver;

  return (
    <View style={styles.outer}>
      {/* Target matrix */}
      <View style={styles.targetContainer}>
        <Text style={styles.matrixLabel}>Target</Text>
        <View style={styles.grid}>
          {target.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((val, j) => (
                <View
                  key={j}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize, backgroundColor: getColorForValue(val, m) },
                  ]}
                >
                  {m > 2 && (
                    <Text style={[styles.cellText, { color: val === 0 ? '#333' : '#fff' }]}>
                      {val}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Current matrix with row/col buttons */}
      <View style={styles.currentContainer}>
        <Text style={styles.matrixLabel}>Current</Text>

        {/* Col buttons row */}
        <View style={styles.row}>
          <View style={{ width: BTN }} />
          {Array.from({ length: n }, (_, j) => (
            <TouchableOpacity
              key={j}
              style={[
                styles.opBtn,
                { width: cellSize, height: BTN },
                selectedCol === j && styles.opBtnSelected,
              ]}
              onPress={() => !disabled && selectCol(j)}
              disabled={disabled}
            >
              <Text style={[styles.opBtnText, selectedCol === j && styles.opBtnTextSelected]}>
                C{j}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current matrix rows with row buttons */}
        {current.map((row, i) => (
          <View key={i} style={styles.row}>
            <TouchableOpacity
              style={[
                styles.opBtn,
                { width: BTN, height: cellSize },
                selectedRow === i && styles.opBtnSelected,
              ]}
              onPress={() => !disabled && selectRow(i)}
              disabled={disabled}
            >
              <Text style={[styles.opBtnText, selectedRow === i && styles.opBtnTextSelected]}>
                R{i}
              </Text>
            </TouchableOpacity>
            {row.map((val, j) => (
              <View
                key={j}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize, backgroundColor: getColorForValue(val, m) },
                  selectedRow === i && styles.cellHighlightRow,
                  selectedCol === j && styles.cellHighlightCol,
                ]}
              >
                {m > 2 && (
                  <Text style={[styles.cellText, { color: val === 0 ? '#333' : '#fff' }]}>
                    {val}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    padding: 8,
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentContainer: {
    alignItems: 'flex-start',
  },
  matrixLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
    alignSelf: 'center',
  },
  grid: {
    borderWidth: 1,
    borderColor: '#888',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellHighlightRow: {
    opacity: 0.8,
    borderColor: '#f7a020',
    borderWidth: 1.5,
  },
  cellHighlightCol: {
    opacity: 0.8,
    borderColor: '#4a90d9',
    borderWidth: 1.5,
  },
  cellText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  opBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8e8e8',
    borderWidth: 1,
    borderColor: '#bbb',
    margin: 1,
    borderRadius: 4,
  },
  opBtnSelected: {
    backgroundColor: '#4a90d9',
    borderColor: '#1a3a5c',
  },
  opBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  opBtnTextSelected: {
    color: '#fff',
  },
});
