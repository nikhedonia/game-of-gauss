import create from 'zustand';
import { GameConfig, GamePhase, Matrix, PeekPhase } from '../types';
import {
  identityMatrix,
  addRow,
  addCol,
  matricesEqual,
  generatePuzzle,
} from '../gameLogic';
import { trackGameStart, trackPuzzleSolved, trackGameEnd } from '../analytics';
import { useStatsStore } from './statsStore';

interface GameState {
  screen: 'setup' | 'playing' | 'stats';
  config: GameConfig;
  target: Matrix;
  current: Matrix;
  initialCurrent: Matrix;
  moveCount: number;
  solved: boolean;
  gameOver: boolean;
  startTime: number;
  elapsedSecs: number;
  solvedCount: number;
  cumulativeMoves: number;
  selectedRow: number | null;
  selectedCol: number | null;
  peekPhase: PeekPhase;
  isPeeking: boolean;
  peekCount: number;
  gamePhase: GamePhase;
  resetCount: number;

  startGame: (config: GameConfig) => void;
  selectRow: (row: number) => void;
  selectCol: (col: number) => void;
  nextPuzzle: () => void;
  resetPuzzle: () => void;
  backToSetup: () => void;
  goToStats: () => void;
  tick: () => void;
  startSolving: () => void;
  togglePeek: () => void;
  beginPlay: () => void;
}

const DEFAULT_CONFIG: GameConfig = { n: 3, m: 2, mode: 'oneoff' };

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'setup',
  config: DEFAULT_CONFIG,
  target: identityMatrix(3),
  current: identityMatrix(3),
  initialCurrent: identityMatrix(3),
  moveCount: 0,
  solved: false,
  gameOver: false,
  startTime: 0,
  elapsedSecs: 0,
  solvedCount: 0,
  cumulativeMoves: 0,
  selectedRow: null,
  selectedCol: null,
  peekPhase: 'solve',
  isPeeking: false,
  peekCount: 0,
  gamePhase: 'preview',
  resetCount: 0,

  startGame: (config) => {
    const { current, target } = generatePuzzle(config.n, config.m);
    trackGameStart(config.mode, config.n, config.m);
    // Race mode (without peekMode) jumps straight into playing; others show the target first
    const gamePhase: GamePhase = config.mode === 'race' && !config.peekMode ? 'playing' : 'preview';
    set({
      screen: 'playing',
      config,
      target,
      current,
      initialCurrent: current,
      moveCount: 0,
      solved: false,
      gameOver: false,
      startTime: Date.now(),
      elapsedSecs: 0,
      solvedCount: 0,
      cumulativeMoves: 0,
      selectedRow: null,
      selectedCol: null,
      peekPhase: config.peekMode ? 'memorize' : 'solve',
      isPeeking: false,
      peekCount: 0,
      gamePhase,
    });
  },

  selectRow: (row) => {
    const { selectedRow, current, config, moveCount, elapsedSecs, solvedCount, cumulativeMoves } = get();

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
        const { current: newCurrent, target: newTarget } = generatePuzzle(config.n, config.m);
        set({
          current: newCurrent,
          initialCurrent: newCurrent,
          target: newTarget,
          moveCount: 0,
          solved: false,
          solvedCount: newSolvedCount,
          cumulativeMoves: cumulativeMoves + newMoveCount,
          selectedRow: null,
          selectedCol: null,
          gamePhase: 'playing', // race keeps rolling without a preview pause
        });
        return;
      }
      useStatsStore.getState().addStat({
        mode: 'oneoff',
        n: config.n,
        m: config.m,
        peekMode: config.peekMode ?? false,
        puzzlesSolved: 1,
        elapsedSecs,
        totalMoves: newMoveCount,
        peekCount: get().peekCount,
      });
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
    const { selectedCol, current, config, moveCount, elapsedSecs, solvedCount, cumulativeMoves } = get();

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
        const { current: newCurrent, target: newTarget } = generatePuzzle(config.n, config.m);
        set({
          current: newCurrent,
          initialCurrent: newCurrent,
          target: newTarget,
          moveCount: 0,
          solved: false,
          solvedCount: newSolvedCount,
          cumulativeMoves: cumulativeMoves + newMoveCount,
          selectedRow: null,
          selectedCol: null,
          gamePhase: 'playing',
        });
        return;
      }
      useStatsStore.getState().addStat({
        mode: 'oneoff',
        n: config.n,
        m: config.m,
        peekMode: config.peekMode ?? false,
        puzzlesSolved: 1,
        elapsedSecs,
        totalMoves: newMoveCount,
        peekCount: get().peekCount,
      });
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
    const { current, target } = generatePuzzle(config.n, config.m);
    // oneoff + peekMode: show target preview again; race: not called (auto-advances inline)
    set({
      target,
      current,
      initialCurrent: current,
      moveCount: 0,
      solved: false,
      selectedRow: null,
      selectedCol: null,
      peekPhase: config.peekMode ? 'memorize' : 'solve',
      isPeeking: false,
      peekCount: 0,
      elapsedSecs: 0,
      gamePhase: 'preview',
    });
  },

  resetPuzzle: () => {
    const { initialCurrent, resetCount } = get();
    set({
      current: initialCurrent,
      moveCount: 0,
      solved: false,
      selectedRow: null,
      selectedCol: null,
      resetCount: resetCount + 1,
    });
  },

  backToSetup: () => {
    const { config, solvedCount, elapsedSecs, screen } = get();
    if (screen === 'playing' && config.mode === 'race') {
      trackGameEnd(config.mode, solvedCount, elapsedSecs);
    }
    set({ screen: 'setup' });
  },

  goToStats: () => set({ screen: 'stats' }),

  tick: () => {
    const { gameOver, solved, config, elapsedSecs, solvedCount, peekPhase, cumulativeMoves, peekCount, gamePhase } = get();
    if (gameOver) return;
    if (gamePhase === 'preview') return; // timer doesn't run while player is viewing the target
    if (config.mode === 'oneoff' && solved) return;
    if (config.peekMode && (solved || peekPhase === 'memorize')) return;

    const newElapsed = elapsedSecs + 1;

    if (config.mode === 'race' && config.raceTimeSecs && newElapsed >= config.raceTimeSecs) {
      trackGameEnd(config.mode, solvedCount, newElapsed);
      useStatsStore.getState().addStat({
        mode: 'race',
        n: config.n,
        m: config.m,
        peekMode: config.peekMode ?? false,
        puzzlesSolved: solvedCount,
        elapsedSecs: newElapsed,
        totalMoves: cumulativeMoves,
        peekCount,
      });
      set({ elapsedSecs: newElapsed, gameOver: true });
      return;
    }

    set({ elapsedSecs: newElapsed });
  },

  startSolving: () => {
    set({ peekPhase: 'solve', gamePhase: 'playing', isPeeking: false, elapsedSecs: 0 });
  },

  togglePeek: () => {
    const { isPeeking, peekCount } = get();
    if (!isPeeking) {
      set({ isPeeking: true, peekCount: peekCount + 1 });
    } else {
      set({ isPeeking: false });
    }
  },

  beginPlay: () => {
    set({ gamePhase: 'playing', elapsedSecs: 0, startTime: Date.now() });
  },
}));
