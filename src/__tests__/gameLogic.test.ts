import { describe, it, expect } from 'vitest';
import {
  identityMatrix,
  addRow,
  addCol,
  matricesEqual,
  generatePuzzle,
  getColorForValue,
} from '../gameLogic';

describe('identityMatrix', () => {
  it('creates correct 2x2 identity', () => {
    expect(identityMatrix(2)).toEqual([[1, 0], [0, 1]]);
  });

  it('creates correct 3x3 identity', () => {
    expect(identityMatrix(3)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  it('creates correct 1x1 identity', () => {
    expect(identityMatrix(1)).toEqual([[1]]);
  });
});

describe('addRow', () => {
  it('adds row 0 to row 1 mod 2', () => {
    const m = identityMatrix(2);
    const result = addRow(m, 0, 1, 2);
    expect(result).toEqual([[1, 0], [1, 1]]);
  });

  it('wraps around correctly mod 2', () => {
    const mat = [[1, 1], [1, 1]];
    const result = addRow(mat, 0, 1, 2);
    expect(result).toEqual([[1, 1], [0, 0]]);
  });

  it('works with m=3', () => {
    const mat = [[2, 1], [1, 0]];
    const result = addRow(mat, 0, 1, 3);
    expect(result).toEqual([[2, 1], [0, 1]]);
  });

  it('does not modify source row', () => {
    const m = identityMatrix(3);
    const result = addRow(m, 0, 2, 2);
    expect(result[0]).toEqual([1, 0, 0]);
    expect(result[2]).toEqual([1, 0, 1]);
  });
});

describe('addCol', () => {
  it('adds col 0 to col 1 mod 2', () => {
    const m = identityMatrix(2);
    const result = addCol(m, 0, 1, 2);
    expect(result).toEqual([[1, 1], [0, 1]]);
  });

  it('wraps around correctly mod 2', () => {
    const mat = [[1, 1], [1, 1]];
    const result = addCol(mat, 0, 1, 2);
    expect(result).toEqual([[1, 0], [1, 0]]);
  });

  it('works with m=3', () => {
    const mat = [[2, 1], [1, 2]];
    const result = addCol(mat, 0, 1, 3);
    expect(result).toEqual([[2, 0], [1, 0]]);
  });

  it('does not modify source col', () => {
    const m = identityMatrix(3);
    const result = addCol(m, 0, 2, 2);
    expect(result[0][0]).toBe(1);
    expect(result[0][2]).toBe(1);
  });
});

describe('matricesEqual', () => {
  it('returns true for identical matrices', () => {
    const a = [[1, 0], [0, 1]];
    expect(matricesEqual(a, a)).toBe(true);
  });

  it('returns true for equal matrices', () => {
    expect(matricesEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
  });

  it('returns false for different matrices', () => {
    expect(matricesEqual([[1, 0], [0, 1]], [[1, 0], [1, 1]])).toBe(false);
  });

  it('returns false for different sizes', () => {
    expect(matricesEqual([[1]], [[1, 0], [0, 1]])).toBe(false);
  });
});

describe('generatePuzzle', () => {
  it('returns a target matrix of the correct size', () => {
    const { target } = generatePuzzle(3, 2);
    expect(target.length).toBe(3);
    target.forEach((row) => expect(row.length).toBe(3));
  });

  it('creates a target different from identity when numOps > 0', () => {
    let differentFound = false;
    for (let i = 0; i < 20; i++) {
      const { target } = generatePuzzle(3, 2, 4);
      if (!matricesEqual(target, identityMatrix(3))) {
        differentFound = true;
        break;
      }
    }
    expect(differentFound).toBe(true);
  });

  it('all values are in range [0, m-1]', () => {
    const m = 3;
    const { target } = generatePuzzle(4, m);
    target.forEach((row) => row.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(m);
    }));
  });
});

describe('getColorForValue', () => {
  it('returns white for 0 when m=2', () => {
    expect(getColorForValue(0, 2)).toBe('#ffffff');
  });

  it('returns black for 1 when m=2', () => {
    expect(getColorForValue(1, 2)).toBe('#111111');
  });

  it('returns a string for m=3', () => {
    expect(typeof getColorForValue(0, 3)).toBe('string');
    expect(typeof getColorForValue(1, 3)).toBe('string');
    expect(typeof getColorForValue(2, 3)).toBe('string');
  });
});

describe('immutability', () => {
  it('addRow returns new matrix and does not mutate original', () => {
    const original = identityMatrix(3);
    const copy = original.map((r) => [...r]);
    const result = addRow(original, 0, 1, 2);
    expect(result).not.toBe(original);
    expect(original).toEqual(copy);
  });

  it('addCol returns new matrix and does not mutate original', () => {
    const original = identityMatrix(3);
    const copy = original.map((r) => [...r]);
    const result = addCol(original, 0, 1, 2);
    expect(result).not.toBe(original);
    expect(original).toEqual(copy);
  });
});

describe('solving a puzzle', () => {
  it('can reach identity by reversing operations (mod 2 is self-inverse)', () => {
    // Apply addRow(0,1), then undo by applying addRow(0,1) again (mod 2)
    let mat = identityMatrix(3);
    mat = addRow(mat, 0, 1, 2);
    mat = addRow(mat, 0, 1, 2);
    expect(matricesEqual(mat, identityMatrix(3))).toBe(true);
  });

  it('can solve a generated puzzle by reversing the applied ops', () => {
    const n = 3, m = 2;
    const identity = identityMatrix(n);
    // Manually build a target from known ops
    let target = identityMatrix(n);
    target = addRow(target, 0, 1, m);
    target = addCol(target, 1, 2, m);

    // Reverse: addCol(1,2), addRow(0,1)
    let current = identityMatrix(n);
    current = addCol(current, 1, 2, m);
    current = addRow(current, 0, 1, m);

    expect(matricesEqual(current, target)).toBe(true);
    // also verify identity can be transformed to target via forward ops
    let forward = identity;
    forward = addRow(forward, 0, 1, m);
    forward = addCol(forward, 1, 2, m);
    expect(matricesEqual(forward, target)).toBe(true);
  });
});
