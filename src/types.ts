export type Matrix = number[][];

export type GameMode = 'oneoff' | 'race';
export type PeekPhase = 'memorize' | 'solve';

export type OperationType = 'row' | 'col';

export interface GameConfig {
  n: number;
  m: number;
  mode: GameMode;
  raceTimeSecs?: number;
  peekMode?: boolean;
}

export interface GameStat {
  id: string;
  timestamp: number;
  mode: GameMode;
  n: number;
  m: number;
  peekMode: boolean;
  puzzlesSolved: number;
  elapsedSecs: number;
  totalMoves: number;
  peekCount: number;
}
