import { Matrix } from './types';

export function identityMatrix(n: number): Matrix {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

export function addRow(matrix: Matrix, srcRow: number, destRow: number, m: number): Matrix {
  return matrix.map((row, i) => {
    if (i !== destRow) return [...row];
    return row.map((val, j) => (val + matrix[srcRow][j]) % m);
  });
}

export function addCol(matrix: Matrix, srcCol: number, destCol: number, m: number): Matrix {
  return matrix.map((row) => {
    const newRow = [...row];
    newRow[destCol] = (row[destCol] + row[srcCol]) % m;
    return newRow;
  });
}

export function matricesEqual(a: Matrix, b: Matrix): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

function applyRandomOps(matrix: Matrix, n: number, m: number, ops: number): Matrix {
  let result = matrix;
  for (let k = 0; k < ops; k++) {
    const useRow = Math.random() < 0.5;
    let src = Math.floor(Math.random() * n);
    let dest = Math.floor(Math.random() * n);
    while (dest === src) dest = Math.floor(Math.random() * n);
    result = useRow ? addRow(result, src, dest, m) : addCol(result, src, dest, m);
  }
  return result;
}

function countNonZero(matrix: Matrix): number {
  return matrix.reduce((sum, row) => sum + row.filter((v) => v !== 0).length, 0);
}

function randomTarget(n: number, m: number): Matrix {
  // Retry until at least half the entries are non-zero (non-trivial target).
  const minNonZero = Math.ceil((n * n) / 2);
  let matrix: Matrix;
  do {
    matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => Math.floor(Math.random() * m))
    );
  } while (countNonZero(matrix) < minNonZero);
  return matrix;
}

export function generatePuzzle(n: number, m: number, numOps?: number): { current: Matrix; target: Matrix } {
  const ops = numOps ?? n * 2 + Math.floor(Math.random() * n);
  const target = randomTarget(n, m);
  // Scramble target via row/col ops to produce current.
  const current = applyRandomOps(target, n, m, Math.max(1, ops));
  return { current, target };
}

const PALETTE_M2 = ['#ffffff', '#111111'];

const PALETTES: Record<number, string[]> = {
  3: ['#ffffff', '#4a90d9', '#1a3a5c'],
  4: ['#ffffff', '#a8d8a8', '#3a7a3a', '#1a3a1a'],
  5: ['#ffffff', '#ffd580', '#f7a020', '#c05000', '#5a1a00'],
};

export function getColorForValue(value: number, m: number): string {
  if (m === 2) return PALETTE_M2[value] ?? '#ffffff';
  const palette = PALETTES[m];
  if (palette) return palette[value] ?? '#cccccc';
  // Generic interpolation for arbitrary m
  const t = value / (m - 1);
  const r = Math.round(255 * (1 - t));
  const g = Math.round(255 * (1 - t));
  const b = Math.round(255 * (1 - t * 0.5));
  return `rgb(${r},${g},${b})`;
}
