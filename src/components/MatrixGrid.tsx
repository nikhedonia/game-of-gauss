import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Matrix } from '../types';
import { getColorForValue } from '../gameLogic';

interface Props {
  matrix: Matrix;
  m: number;
  label: string;
}

const CELL_SIZE = 44;

export default function MatrixGrid({ matrix, m, label }: Props) {
  const n = matrix.length;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {matrix.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((val, j) => (
              <View
                key={j}
                style={[
                  styles.cell,
                  {
                    width: Math.min(CELL_SIZE, Math.floor(240 / n)),
                    height: Math.min(CELL_SIZE, Math.floor(240 / n)),
                    backgroundColor: getColorForValue(val, m),
                  },
                ]}
              >
                {m > 2 && (
                  <Text
                    style={[
                      styles.cellText,
                      { color: val === 0 ? '#333' : '#fff' },
                    ]}
                  >
                    {val}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  grid: {
    borderWidth: 1,
    borderColor: '#888',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
