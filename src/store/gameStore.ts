import { create } from 'zustand';
import { GameConfig, Matrix } from '../types';
import {
  identityMatrix,
  addRow,
  addCol,
  matricesEqual,
  generatePuzzle,
} from '../gameLogic';
import { trackGameStart, trackPuzzleSolved, trackGameEnd } from '../analytics';

interface GameState {
  screen: 'setup' | 'playing';
  config: GameConfig;
  target: Matrix;
  current: Matrix;
  moveCount: number;
  solved: boolean;
  gameOver: boolean;
  startTime: number;
  elapsedSecs: number;
  solvedCount: number;
  selectedRow: number | null;
  selectedCol: number | null;

  startGame: (config: GameConfig) => void;
  selectRow: (row: number) => void;
  selectCol: (col: number) => void;
  nextPuzzle: () => void;
  resetPuzzle: () => void;
  backToSetup: () => void;
  tick: () => void;
}

const DEFAULT_CONFIG: GameConfig = { n: 3, m: 2, mode: 'oneoff' };

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'setup',
  config: DEFAULT_CONFIG,
  target: identityMatrix(3),
  current: identityMatrix(3),
  moveCount: 0,
  solved: false,
  gameOver: false,
  startTime: 0,
  elapsedSecs: 0,
  solvedCount: 0,
  selectedRow: null,
  selectedCol: null,

  startGame: (config) => {
    const { target } = generatePuzzle(config.n, config.m);
    trackGameStart(config.mode, config.n, config.m);
    set({
      screen: 'playing',
      config,
      target,
      current: identityMatrix(config.n),
      moveCount: 0,
      solved: false,
      gameOver: false,
      startTime: Date.now(),
      elapsedSecs: 0,
      solvedCount: 0,
      selectedRow: null,
      selectedCol: null,
    });
  },

  selectRow: (row) => {
    const { selectedRow, current, config, moveCount, elapsedSecs, solvedCount } = get();

    if (selectedRow === null) {
      set({ selectedRow: row, selectedCol: null });
      return;
    }

    if (selectedRow === row) {
      set({ selectedRow: null });
      return;
    }

    const newMatrix = addRow(current, selectedRow, row, config.m);
    const newMoveCount = moveCount + 1;
    const isSolved = matricesEqual(newMatrix, get().target);

    if (isSolved) {
      trackPuzzleSolved(config.mode, newMoveCount, elapsedSecs);
      if (config.mode === 'race') {
        const newSolvedCount = solvedCount + 1;
        const { target: newTarget } = generatePuzzle(config.n, config.m);
        set({
          current: identityMatrix(config.n),
          target: newTarget,
          moveCount: 0,
          solved: false,
          solvedCount: newSolvedCount,
          selectedRow: null,
          selectedCol: null,
        });
        return;
      }
    }

    set({
      current: newMatrix,
      moveCount: newMoveCount,
      solved: isSolved,
      selectedRow: null,
      selectedCol: null,
    });
  },

  selectCol: (col) => {
    const { selectedCol, current, config, moveCount, elapsedSecs, solvedCount } = get();

    if (selectedCol === null) {
      set({ selectedCol: col, selectedRow: null });
      return;
    }

    if (selectedCol === col) {
      set({ selectedCol: null });
      return;
    }

    const newMatrix = addCol(current, selectedCol, col, config.m);
    const newMoveCount = moveCount + 1;
    const isSolved = matricesEqual(newMatrix, get().target);

    if (isSolved) {
      trackPuzzleSolved(config.mode, newMoveCount, elapsedSecs);
      if (config.mode === 'race') {
        const newSolvedCount = solvedCount + 1;
        const { target: newTarget } = generatePuzzle(config.n, config.m);
        set({
          current: identityMatrix(config.n),
          target: newTarget,
          moveCount: 0,
          solved: false,
          solvedCount: newSolvedCount,
          selectedRow: null,
          selectedCol: null,
        });
        return;
      }
    }

    set({
      current: newMatrix,
      moveCount: newMoveCount,
      solved: isSolved,
      selectedRow: null,
      selectedCol: null,
    });
  },

  nextPuzzle: () => {
    const { config } = get();
    const { target } = generatePuzzle(config.n, config.m);
    set({
      target,
      current: identityMatrix(config.n),
      moveCount: 0,
      solved: false,
      selectedRow: null,
      selectedCol: null,
    });
  },

  resetPuzzle: () => {
    const { config } = get();
    set({
      current: identityMatrix(config.n),
      moveCount: 0,
      solved: false,
      selectedRow: null,
      selectedCol: null,
    });
  },

  backToSetup: () => {
    const { config, solvedCount, elapsedSecs } = get();
    if (config.mode === 'race') {
      trackGameEnd(config.mode, solvedCount, elapsedSecs);
    }
    set({ screen: 'setup' });
  },

  tick: () => {
    const { gameOver, solved, config, elapsedSecs, solvedCount } = get();
    if (gameOver) return;
    if (config.mode === 'oneoff' && solved) return;

    const newElapsed = elapsedSecs + 1;

    if (config.mode === 'race' && config.raceTimeSecs && newElapsed >= config.raceTimeSecs) {
      trackGameEnd(config.mode, solvedCount, newElapsed);
      set({ elapsedSecs: newElapsed, gameOver: true });
      return;
    }

    set({ elapsedSecs: newElapsed });
  },
}));
