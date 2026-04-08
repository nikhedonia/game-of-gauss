export type Matrix = number[][];

export type GameMode = 'oneoff' | 'race';

export type OperationType = 'row' | 'col';

export interface GameConfig {
  n: number;
  m: number;
  mode: GameMode;
  raceTimeSecs?: number;
}
