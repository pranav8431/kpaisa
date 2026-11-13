import type { AircraftLayout, LayoutId } from './layouts';
import { SEAT_CATEGORIES, type SeatCategoryId } from './seatCategories';

export type SeatPosition = 'window' | 'middle' | 'aisle';

export interface Seat {
  id: string;
  row: number;
  letter: string;
  position: SeatPosition;
  categoryId: SeatCategoryId;
  price: number;
  occupied: boolean;
}

export interface SeatRow {
  row: number;
  isExitRow: boolean;
  /** Seats split into the same blocks as the layout's seatGroups. */
  groups: Seat[][];
}

export interface SeatMap {
  layoutId: LayoutId;
  rows: SeatRow[];
  seatsById: Record<string, Seat>;
}

export function getSeatId(row: number, letter: string): string {
  return `${row}${letter}`;
}

function getSeatPosition(groups: string[][], groupIndex: number, letterIndex: number): SeatPosition {
  const group = groups[groupIndex];
  const isFirstGroup = groupIndex === 0;
  const isLastGroup = groupIndex === groups.length - 1;
  const isFirstInGroup = letterIndex === 0;
  const isLastInGroup = letterIndex === group.length - 1;

  if ((isFirstGroup && isFirstInGroup) || (isLastGroup && isLastInGroup)) return 'window';
  if (isFirstInGroup || isLastInGroup) return 'aisle';
  return 'middle';
}

function getSeatCategory(
  layout: AircraftLayout,
  seatId: string,
  row: number,
  position: SeatPosition,
): SeatCategoryId {
  const override = layout.categoryOverrides[seatId];
  if (override) return override;
  if (layout.exitRows.includes(row)) return 'extraLegroom';
  if (layout.premiumRows.includes(row)) return 'premium';
  if (position === 'window') return 'preferred';
  return 'standard';
}

/** Generates the full seat map (rows, categories, prices, occupancy) for a layout. */
export function buildSeatMap(layout: AircraftLayout): SeatMap {
  const occupied = new Set(layout.occupiedSeats);
  const seatsById: Record<string, Seat> = {};
  const rows: SeatRow[] = [];

  for (let row = 1; row <= layout.rowCount; row++) {
    const groups = layout.seatGroups.map((letters, groupIndex) =>
      letters.map((letter, letterIndex) => {
        const id = getSeatId(row, letter);
        const position = getSeatPosition(layout.seatGroups, groupIndex, letterIndex);
        const categoryId = getSeatCategory(layout, id, row, position);
        const seat: Seat = {
          id,
          row,
          letter,
          position,
          categoryId,
          price: SEAT_CATEGORIES[categoryId].price,
          occupied: occupied.has(id),
        };
        seatsById[id] = seat;
        return seat;
      }),
    );
    rows.push({ row, isExitRow: layout.exitRows.includes(row), groups });
  }

  return { layoutId: layout.id, rows, seatsById };
}
