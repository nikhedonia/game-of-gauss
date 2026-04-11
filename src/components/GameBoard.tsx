import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getColorForValue } from '../gameLogic';
import type { GamePhase } from '../types';

const BTN = 36;
const PADDING = 10;
const STATUS_BAR_HEIGHT = 110;
const BUTTONS_BAR_HEIGHT = 60;
// Fixed-height zones above/below the matrix keep it anchored regardless of content.
const HINT_ZONE_HEIGHT = 50;
const ACTION_ZONE_HEIGHT = 56;
const SMALL_CIRCLE_RATIO = 0.196;

function getTargetOverlaySize(
  gamePhase: GamePhase,
  isPeeking: boolean,
  peekMode: boolean,
  cellSize: number,
): number {
  if (gamePhase === 'preview') return cellSize;
  if (peekMode) return isPeeking ? cellSize : 0;
  return Math.max(6, Math.round(cellSize * SMALL_CIRCLE_RATIO * 2));
}

function getTargetOverlayRadius(
  gamePhase: GamePhase,
  isPeeking: boolean,
  peekMode: boolean,
  cellSize: number,
): number {
  if (gamePhase === 'preview') return 2;
  if (peekMode) return isPeeking ? 2 : 0;
  const size = Math.max(6, Math.round(cellSize * SMALL_CIRCLE_RATIO * 2));
  return size / 2;
}

function computeCellSize(windowWidth: number, windowHeight: number, n: number): number {
  const containerWidth = Math.min(windowWidth, 600) - 2 * PADDING;
  const availableH =
    windowHeight -
    STATUS_BAR_HEIGHT -
    BUTTONS_BAR_HEIGHT -
    3 * PADDING -
    HINT_ZONE_HEIGHT -
    ACTION_ZONE_HEIGHT;
  const cellSizeW = Math.floor((containerWidth - BTN - 2) / n);
  const fixedH = BTN; // col-button header row
  const cellSizeH = Math.floor((availableH - fixedH) / n);
  return Math.max(20, Math.min(cellSizeW, cellSizeH, 100));
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
  const isPeeking = useGameStore((s) => s.isPeeking);
  const peekCount = useGameStore((s) => s.peekCount);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const resetCount = useGameStore((s) => s.resetCount);
  const beginPlay = useGameStore((s) => s.beginPlay);
  const startSolving = useGameStore((s) => s.startSolving);
  const togglePeek = useGameStore((s) => s.togglePeek);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { n, m } = config;
  const peekMode = !!config.peekMode;
  const cellSize = computeCellSize(windowWidth, windowHeight, n);
  const disabled = solved || gameOver || gamePhase === 'preview';

  // ── Target-overlay animation ─────────────────────────────────────────────
  const sizeAnimRef = useRef<Animated.Value | null>(null);
  const radiusAnimRef = useRef<Animated.Value | null>(null);
  if (!sizeAnimRef.current) {
    sizeAnimRef.current = new Animated.Value(
      getTargetOverlaySize(gamePhase, isPeeking, peekMode, cellSize),
    );
  }
  if (!radiusAnimRef.current) {
    radiusAnimRef.current = new Animated.Value(
      getTargetOverlayRadius(gamePhase, isPeeking, peekMode, cellSize),
    );
  }
  const sizeAnim = sizeAnimRef.current;
  const radiusAnim = radiusAnimRef.current;

  // Snap overlay dimensions immediately on window resize (no animation).
  const prevCellSizeRef = useRef(cellSize);
  useEffect(() => {
    if (prevCellSizeRef.current !== cellSize) {
      prevCellSizeRef.current = cellSize;
      sizeAnim.setValue(getTargetOverlaySize(gamePhase, isPeeking, peekMode, cellSize));
      radiusAnim.setValue(getTargetOverlayRadius(gamePhase, isPeeking, peekMode, cellSize));
    }
  });

  // Animate overlay shape when phase or peek state changes.
  useEffect(() => {
    const toSize = getTargetOverlaySize(gamePhase, isPeeking, peekMode, cellSize);
    const toRadius = getTargetOverlayRadius(gamePhase, isPeeking, peekMode, cellSize);
    Animated.parallel([
      Animated.timing(sizeAnim, { toValue: toSize, duration: 350, useNativeDriver: false }),
      Animated.timing(radiusAnim, { toValue: toRadius, duration: 350, useNativeDriver: false }),
    ]).start();
    // cellSize intentionally omitted — resize handled by the snap effect above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, isPeeking]);

  // ── Reset colour animation ───────────────────────────────────────────────
  // During render, capture the matrix that was showing before current changes.
  const prevCurrentRef = useRef<number[][]>(current);
  const currentTrackRef = useRef<number[][]>(current);
  if (currentTrackRef.current !== current) {
    prevCurrentRef.current = currentTrackRef.current;
    currentTrackRef.current = current;
  }
  const resetFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resetCount === 0) return;
    // Instantly show old colours on top, then fade them away to reveal new state.
    resetFadeAnim.setValue(1);
    Animated.timing(resetFadeAnim, { toValue: 0, duration: 450, useNativeDriver: false }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetCount]);

  return (
    <View style={styles.outer}>
      {/* Fixed-height hint zone — keeps matrix Y-position stable */}
      <View style={styles.hintZone}>
        {gamePhase === 'preview' && peekMode && (
          <>
            <Text style={styles.previewTitle}>Memorize the target!</Text>
            <Text style={styles.previewHint}>Tap "Ready" when you've got it.</Text>
          </>
        )}
      </View>

      <CombinedMatrix
        current={current}
        prevCurrent={prevCurrentRef.current}
        target={target}
        n={n}
        m={m}
        cellSize={cellSize}
        selectedRow={selectedRow}
        selectedCol={selectedCol}
        selectRow={selectRow}
        selectCol={selectCol}
        disabled={disabled}
        sizeAnim={sizeAnim}
        radiusAnim={radiusAnim}
        resetFadeAnim={resetFadeAnim}
      />

      {/* Fixed-height action zone — keeps matrix Y-position stable */}
      <View style={styles.actionZone}>
        {gamePhase === 'preview' && !peekMode && (
          <TouchableOpacity style={styles.actionBtn} onPress={beginPlay}>
            <Text style={styles.actionBtnText}>Start Solving ▶</Text>
          </TouchableOpacity>
        )}

        {gamePhase === 'preview' && peekMode && (
          <TouchableOpacity style={styles.actionBtn} onPress={startSolving}>
            <Text style={styles.actionBtnText}>Ready to Solve →</Text>
          </TouchableOpacity>
        )}

        {gamePhase === 'playing' && peekMode && !solved && (
          <TouchableOpacity
            style={[styles.peekBtn, isPeeking && styles.peekBtnActive]}
            onPress={togglePeek}
          >
            <Text style={[styles.peekBtnText, isPeeking && styles.peekBtnTextActive]}>
              {isPeeking ? '🙈 Hide — back to solving' : '👁 Peek at Target'}
              {peekCount > 0 && `  (${peekCount} peek${peekCount > 1 ? 's' : ''})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function CombinedMatrix({
  current,
  prevCurrent,
  target,
  n,
  m,
  cellSize,
  selectedRow,
  selectedCol,
  selectRow,
  selectCol,
  disabled,
  sizeAnim,
  radiusAnim,
  resetFadeAnim,
}: {
  current: number[][];
  prevCurrent: number[][];
  target: number[][];
  n: number;
  m: number;
  cellSize: number;
  selectedRow: number | null;
  selectedCol: number | null;
  selectRow: (i: number) => void;
  selectCol: (j: number) => void;
  disabled: boolean;
  sizeAnim: Animated.Value;
  radiusAnim: Animated.Value;
  resetFadeAnim: Animated.Value;
}) {
  return (
    <View style={styles.matrixBlock}>
      {/* Column selector buttons */}
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

      {/* Data rows */}
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
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColorForValue(val, m),
                },
                selectedRow === i && styles.cellHighlightRow,
                selectedCol === j && styles.cellHighlightCol,
              ]}
            >
              {/* Target colour — animated square (preview) → small circle (playing) */}
              <Animated.View
                style={{
                  position: 'absolute',
                  width: sizeAnim,
                  height: sizeAnim,
                  borderRadius: radiusAnim,
                  backgroundColor: getColorForValue(target[i][j], m),
                }}
              />
              {/* Reset fade overlay — flashes old colours then fades to reveal new state */}
              <Animated.View
                style={{
                  position: 'absolute',
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColorForValue(prevCurrent[i][j], m),
                  opacity: resetFadeAnim,
                }}
              />
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
    flex: 1,
    justifyContent: 'center',
  },
  hintZone: {
    height: HINT_ZONE_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  actionZone: {
    height: ACTION_ZONE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  previewHint: {
    fontSize: 13,
    color: '#555',
  },
  matrixBlock: {},
  matrixRow: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  actionBtn: {
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  peekBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4a90d9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  peekBtnActive: {
    backgroundColor: '#fff8e1',
    borderColor: '#f7a020',
  },
  peekBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90d9',
  },
  peekBtnTextActive: {
    color: '#c05000',
  },
});
