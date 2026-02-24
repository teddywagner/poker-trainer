import { RANKS } from './deck';
import { OPEN_RANGES, ALWAYS_3BET, VALUE_3BET, BLUFF_3BET_IP, CALL_VS_RAISE_IP } from './ranges';

// A down to 2
export const MATRIX_RANKS = [...RANKS].reverse();

export type CellAction = 'raise' | '3bet' | 'call' | 'fold';

export interface MatrixCell {
  notation: string;
  row: number;
  col: number;
  type: 'pair' | 'suited' | 'offsuit';
  action: CellAction;
}

function cellNotation(row: number, col: number): { notation: string; type: 'pair' | 'suited' | 'offsuit' } {
  const r1 = MATRIX_RANKS[row];
  const r2 = MATRIX_RANKS[col];
  if (row === col) return { notation: `${r1}${r2}`, type: 'pair' };
  if (col > row) return { notation: `${r1}${r2}s`, type: 'suited' };
  return { notation: `${r2}${r1}o`, type: 'offsuit' };
}

export function buildMatrix(position: string, facingRaise: boolean): MatrixCell[][] {
  const matrix: MatrixCell[][] = [];

  for (let row = 0; row < 13; row++) {
    const rowCells: MatrixCell[] = [];
    for (let col = 0; col < 13; col++) {
      const { notation, type } = cellNotation(row, col);
      let action: CellAction = 'fold';

      if (facingRaise) {
        if (ALWAYS_3BET.has(notation) || VALUE_3BET.has(notation)) {
          action = '3bet';
        } else if (BLUFF_3BET_IP.has(notation) && ['CO', 'BTN', 'SB'].includes(position)) {
          action = '3bet';
        } else if (CALL_VS_RAISE_IP.has(notation) && ['CO', 'BTN'].includes(position)) {
          action = 'call';
        }
      } else {
        const range = OPEN_RANGES[position];
        if (range && range.has(notation)) {
          action = 'raise';
        }
      }

      rowCells.push({ notation, row, col, type, action });
    }
    matrix.push(rowCells);
  }

  return matrix;
}

export function getRangeStats(matrix: MatrixCell[][]): { combos: number; percentage: number } {
  let combos = 0;
  for (const row of matrix) {
    for (const cell of row) {
      if (cell.action === 'fold') continue;
      if (cell.type === 'pair') combos += 6;
      else if (cell.type === 'suited') combos += 4;
      else combos += 12;
    }
  }
  return { combos, percentage: Math.round((combos / 1326) * 1000) / 10 };
}
