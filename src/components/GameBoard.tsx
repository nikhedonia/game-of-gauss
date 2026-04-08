import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getColorForValue } from '../gameLogic';

const BTN = 36;
// Estimated height consumed by GameStatus + app padding + safe area insets
const OVERHEAD = 220;
const LABEL_H = 22;  // matrix label + marginBottom
const MATRIX_GAP = 16;

function computeCellSize(
  windowWidth: number,
  windowHeight: number,
  n: number,
  numMatrices: number,
): number {
  const containerWidth = Math.min(windowWidth, 600) - 20; // 10px padding each side
  // Width: subtract BTN (row-button column) from available width
  const cellSizeW = Math.floor((containerWidth - BTN - 2) / n);
  // Height: fit numMatrices matrices, each needing a label + BTN header row + n data rows
  const fixedH = numMatrices * (LABEL_H + BTN) + (numMatrices > 1 ? MATRIX_GAP : 0);
  const cellSizeH = Math.floor((windowHeight - OVERHEAD - fixedH) / (numMatrices * n));
  return Math.max(20, Math.min(cellSizeW, cellSizeH, 100));
}

// Renders the target matrix aligned with CurrentMatrix:
// a spacer column (same width as row buttons) and a spacer row (same height as col buttons)
// are drawn as inactive placeholder blocks so both matrices share the same grid alignment.
function TargetMatrix({ matrix, m, cellSize }: { matrix: number[][]; m: number; cellSize: number }) {
  return (
    <View>
      {/* Header row: corner spacer + col placeholders aligned with col buttons */}
      <View style={styles.matrixRow}>
        <View style={{ width: BTN }} />
        {matrix[0].map((_, j) => (
          <View key={j} style={[styles.placeholder, { width: cellSize, height: BTN }]} />
        ))}
      </View>
      {/* Data rows: row placeholder aligned with row buttons + cells */}
      {matrix.map((row, i) => (
        <View key={i} style={styles.matrixRow}>
          <View style={[styles.placeholder, { width: BTN, height: cellSize }]} />
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
  );
}

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
  const peekPhase = useGameStore((s) => s.peekPhase);
  const isPeeking = useGameStore((s) => s.isPeeking);
  const peekCount = useGameStore((s) => s.peekCount);
  const startSolving = useGameStore((s) => s.startSolving);
  const togglePeek = useGameStore((s) => s.togglePeek);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { n, m } = config;
  // Peek mode shows only one matrix at a time; use more vertical space for it
  const numMatrices = config.peekMode ? 1 : 2;
  const cellSize = computeCellSize(windowWidth, windowHeight, n, numMatrices);
  const disabled = solved || gameOver;

  if (config.peekMode && peekPhase === 'memorize') {
    return (
      <View style={styles.outer}>
        <Text style={styles.peekMemorizeTitle}>Memorize the target!</Text>
        <Text style={styles.peekMemorizeHint}>Tap "Ready" when you've got it.</Text>
        <View style={styles.matrixBlock}>
          <Text style={styles.matrixLabel}>Target</Text>
          <TargetMatrix matrix={target} m={m} cellSize={cellSize} />
        </View>
        <TouchableOpacity style={styles.readyBtn} onPress={startSolving}>
          <Text style={styles.readyBtnText}>Ready to Solve →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (config.peekMode && peekPhase === 'solve') {
    return (
      <View style={styles.peekSolveOuter}>
        <View style={styles.peekContent}>
          {isPeeking ? (
            <View style={styles.matrixBlock}>
              <Text style={styles.matrixLabel}>Target</Text>
              <TargetMatrix matrix={target} m={m} cellSize={cellSize} />
            </View>
          ) : (
            <CurrentMatrix
              current={current}
              n={n}
              m={m}
              cellSize={cellSize}
              selectedRow={selectedRow}
              selectedCol={selectedCol}
              selectRow={selectRow}
              selectCol={selectCol}
              disabled={disabled}
            />
          )}
        </View>

        {!solved && (
          <TouchableOpacity
            style={[styles.peekToggleBtn, isPeeking && styles.peekToggleBtnActive]}
            onPress={togglePeek}
          >
            <Text style={[styles.peekToggleBtnText, isPeeking && styles.peekToggleBtnTextActive]}>
              {isPeeking ? '🙈 Hide — back to solving' : '👁 Peek at Target'}
              {peekCount > 0 && `  (${peekCount} peek${peekCount > 1 ? 's' : ''})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default (oneoff / race): target above current, both left-aligned for column alignment
  return (
    <View style={styles.outer}>
      <View style={styles.matrixBlock}>
        <Text style={styles.matrixLabel}>Target</Text>
        <TargetMatrix matrix={target} m={m} cellSize={cellSize} />
      </View>
      <CurrentMatrix
        current={current}
        n={n}
        m={m}
        cellSize={cellSize}
        selectedRow={selectedRow}
        selectedCol={selectedCol}
        selectRow={selectRow}
        selectCol={selectCol}
        disabled={disabled}
      />
    </View>
  );
}

function CurrentMatrix({
  current,
  n,
  m,
  cellSize,
  selectedRow,
  selectedCol,
  selectRow,
  selectCol,
  disabled,
}: {
  current: number[][];
  n: number;
  m: number;
  cellSize: number;
  selectedRow: number | null;
  selectedCol: number | null;
  selectRow: (i: number) => void;
  selectCol: (j: number) => void;
  disabled: boolean;
}) {
  return (
    <View style={styles.matrixBlock}>
      <Text style={styles.matrixLabel}>Current</Text>

      <View style={styles.matrixRow}>
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

      {current.map((row, i) => (
        <View key={i} style={styles.matrixRow}>
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
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
    padding: 8,
  },
  peekSolveOuter: {
    flex: 1,
    width: '100%',
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peekContent: {
    width: '100%',
    alignItems: 'center',
  },
  matrixBlock: {
    marginBottom: MATRIX_GAP,
  },
  matrixLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
    alignSelf: 'center',
  },
  matrixRow: {
    flexDirection: 'row',
  },
  placeholder: {
    backgroundColor: '#e8e8e8',
    borderWidth: 1,
    borderColor: '#bbb',
    margin: 1,
    borderRadius: 4,
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
  peekMemorizeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
    alignSelf: 'center',
  },
  peekMemorizeHint: {
    fontSize: 13,
    color: '#555',
    marginBottom: 16,
    alignSelf: 'center',
  },
  readyBtn: {
    alignSelf: 'center',
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 10,
  },
  readyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  peekToggleBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4a90d9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  peekToggleBtnActive: {
    backgroundColor: '#fff8e1',
    borderColor: '#f7a020',
  },
  peekToggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90d9',
  },
  peekToggleBtnTextActive: {
    color: '#c05000',
  },
});
