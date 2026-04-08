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

export function generatePuzzle(n: number, m: number, numOps?: number): { target: Matrix } {
  const ops = numOps ?? n * 2 + Math.floor(Math.random() * n);
  let target = identityMatrix(n);

  for (let k = 0; k < ops; k++) {
    const useRow = Math.random() < 0.5;
    let src = Math.floor(Math.random() * n);
    let dest = Math.floor(Math.random() * n);
    while (dest === src) {
      dest = Math.floor(Math.random() * n);
    }
    if (useRow) {
      target = addRow(target, src, dest, m);
    } else {
      target = addCol(target, src, dest, m);
    }
  }

  return { target };
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
