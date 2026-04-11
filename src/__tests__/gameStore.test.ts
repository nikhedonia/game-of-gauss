import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { identityMatrix, matricesEqual } from '../gameLogic';
import { GameConfig } from '../types';

const DEFAULT_CONFIG: GameConfig = { n: 3, m: 2, mode: 'oneoff' };
const RACE_CONFIG: GameConfig = { n: 3, m: 2, mode: 'race', raceTimeSecs: 60 };

beforeEach(() => {
  useGameStore.setState({
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
    selectedRow: null,
    selectedCol: null,
  });
});

describe('startGame', () => {
  it('sets screen to playing', () => {
    useGameStore.getState().startGame(DEFAULT_CONFIG);
    expect(useGameStore.getState().screen).toBe('playing');
  });

  it('initializes current as non-identity matrix', () => {
    useGameStore.getState().startGame(DEFAULT_CONFIG);
    const { current, config } = useGameStore.getState();
    expect(matricesEqual(current, identityMatrix(config.n))).toBe(false);
  });

  it('sets the config correctly', () => {
    useGameStore.getState().startGame({ n: 4, m: 3, mode: 'oneoff' });
    expect(useGameStore.getState().config).toEqual({ n: 4, m: 3, mode: 'oneoff' });
  });

  it('resets moveCount and solvedCount', () => {
    useGameStore.setState({ moveCount: 5, solvedCount: 3 });
    useGameStore.getState().startGame(DEFAULT_CONFIG);
    expect(useGameStore.getState().moveCount).toBe(0);
    expect(useGameStore.getState().solvedCount).toBe(0);
  });
});

describe('selectRow', () => {
  beforeEach(() => {
    useGameStore.getState().startGame(DEFAULT_CONFIG);
  });

  it('selects a row when none selected', () => {
    useGameStore.getState().selectRow(1);
    expect(useGameStore.getState().selectedRow).toBe(1);
  });

  it('deselects row when same row selected again', () => {
    useGameStore.getState().selectRow(1);
    useGameStore.getState().selectRow(1);
    expect(useGameStore.getState().selectedRow).toBeNull();
  });

  it('applies addRow when different row selected and increments moveCount', () => {
    // Set current to identity so we have predictable state
    useGameStore.setState({ current: identityMatrix(3) });
    useGameStore.getState().selectRow(0);
    useGameStore.getState().selectRow(1);
    const { current, moveCount, selectedRow } = useGameStore.getState();
    // row 0 = [1,0,0], row 1 should become [0,1,0] + [1,0,0] = [1,1,0]
    expect(current[1]).toEqual([1, 1, 0]);
    expect(moveCount).toBe(1);
    expect(selectedRow).toBeNull();
  });

  it('clears selectedCol when row is selected', () => {
    useGameStore.setState({ selectedCol: 2 });
    useGameStore.getState().selectRow(0);
    expect(useGameStore.getState().selectedCol).toBeNull();
  });
});

describe('selectCol', () => {
  beforeEach(() => {
    useGameStore.getState().startGame(DEFAULT_CONFIG);
    useGameStore.setState({ current: identityMatrix(3) });
  });

  it('selects a col when none selected', () => {
    useGameStore.getState().selectCol(0);
    expect(useGameStore.getState().selectedCol).toBe(0);
  });

  it('deselects col when same col selected again', () => {
    useGameStore.getState().selectCol(0);
    useGameStore.getState().selectCol(0);
    expect(useGameStore.getState().selectedCol).toBeNull();
  });

  it('applies addCol when different col selected', () => {
    useGameStore.setState({ current: identityMatrix(3) });
    useGameStore.getState().selectCol(0);
    useGameStore.getState().selectCol(1);
    const { current, moveCount } = useGameStore.getState();
    // col 0 = [1,0,0], col 1 += col 0 → col 1 = [1,1,0]
    expect(current[0][1]).toBe(1);
    expect(current[1][1]).toBe(1);
    expect(current[2][1]).toBe(0);
    expect(moveCount).toBe(1);
  });
});

describe('resetPuzzle', () => {
  it('resets current to initialCurrent and moveCount to 0', () => {
    useGameStore.getState().startGame(DEFAULT_CONFIG);
    const initialCurrent = useGameStore.getState().current;
    useGameStore.setState({ moveCount: 5 });
    // Apply an operation to change current
    useGameStore.getState().selectRow(0);
    useGameStore.getState().selectRow(1);
    useGameStore.getState().resetPuzzle();
    const { current, moveCount } = useGameStore.getState();
    expect(matricesEqual(current, initialCurrent)).toBe(true);
    expect(moveCount).toBe(0);
  });
});

describe('nextPuzzle', () => {
  it('generates a new non-identity current and resets moveCount', () => {
    useGameStore.getState().startGame(DEFAULT_CONFIG);
    useGameStore.getState().nextPuzzle();
    const { current, config, moveCount } = useGameStore.getState();
    expect(matricesEqual(current, identityMatrix(config.n))).toBe(false);
    expect(moveCount).toBe(0);
  });
});

describe('tick', () => {
  it('increments elapsedSecs', () => {
    useGameStore.setState({ elapsedSecs: 5, gameOver: false, solved: false, config: DEFAULT_CONFIG, gamePhase: 'playing' });
    useGameStore.getState().tick();
    expect(useGameStore.getState().elapsedSecs).toBe(6);
  });

  it('does not tick when gameOver', () => {
    useGameStore.setState({ elapsedSecs: 5, gameOver: true, config: DEFAULT_CONFIG, gamePhase: 'playing' });
    useGameStore.getState().tick();
    expect(useGameStore.getState().elapsedSecs).toBe(5);
  });

  it('sets gameOver when race time expires', () => {
    useGameStore.setState({
      elapsedSecs: 59,
      gameOver: false,
      solved: false,
      config: RACE_CONFIG,
      solvedCount: 2,
      gamePhase: 'playing',
    });
    useGameStore.getState().tick();
    expect(useGameStore.getState().gameOver).toBe(true);
    expect(useGameStore.getState().elapsedSecs).toBe(60);
  });
});

describe('backToSetup', () => {
  it('sets screen to setup', () => {
    useGameStore.setState({ screen: 'playing' });
    useGameStore.getState().backToSetup();
    expect(useGameStore.getState().screen).toBe('setup');
  });
});
