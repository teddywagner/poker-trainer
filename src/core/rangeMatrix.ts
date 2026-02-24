import { RANKS } from './deck';
import { PlayStyle } from './types';
import { getOpenRange, getFacingRaiseRanges } from './rangeData';

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

export function buildMatrix(
  position: string,
  facingRaise: boolean,
  style: PlayStyle = 'GTO',
  openerPosition?: string,
): MatrixCell[][] {
  const matrix: MatrixCell[][] = [];

  // Pre-compute the ranges once
  let openRange: Set<string> | null = null;
  let threeBetRange: Set<string> | null = null;
  let callRange: Set<string> | null = null;

  if (facingRaise && openerPosition) {
    const ranges = getFacingRaiseRanges(position, openerPosition, style);
    threeBetRange = ranges.threeBet;
    callRange = ranges.call;
  } else if (!facingRaise) {
    openRange = getOpenRange(position, style);
  }

  for (let row = 0; row < 13; row++) {
    const rowCells: MatrixCell[] = [];
    for (let col = 0; col < 13; col++) {
      const { notation, type } = cellNotation(row, col);
      let action: CellAction = 'fold';

      if (facingRaise) {
        if (threeBetRange && threeBetRange.has(notation)) {
          action = '3bet';
        } else if (callRange && callRange.has(notation)) {
          action = 'call';
        }
      } else {
        if (openRange && openRange.has(notation)) {
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
