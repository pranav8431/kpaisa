import type { SeatCategoryId } from './seatCategories';

export type LayoutId = 'layout-3-2' | 'layout-2-3-2';

/**
 * A layout describes the cabin. Rendering, pricing and validation are all driven
 * from this object, so supporting a new aircraft means adding one entry here.
 */
export interface AircraftLayout {
  id: LayoutId;
  name: string;
  configuration: string;
  aircraft: string;
  rowCount: number;
  /** Seat letters per block; an aisle is drawn between consecutive blocks. */
  seatGroups: string[][];
  /** Rows next to emergency exits get extra legroom. */
  exitRows: number[];
  /** Rows at the front of the cabin sold as premium. */
  premiumRows: number[];
  /** Explicit category overrides by seat id (e.g. the sample data from the brief). */
  categoryOverrides: Record<string, SeatCategoryId>;
  /** Seats already booked by other travellers. */
  occupiedSeats: string[];
}

export const LAYOUTS: Record<LayoutId, AircraftLayout> = {
  'layout-3-2': {
    id: 'layout-3-2',
    name: 'Layout 1',
    configuration: '3–2',
    aircraft: 'Regional jet',
    rowCount: 12,
    seatGroups: [
      ['A', 'B', 'C'],
      ['D', 'E'],
    ],
    exitRows: [7],
    premiumRows: [3, 4],
    // Sample seat data from the assessment brief.
    categoryOverrides: {
      '1A': 'standard',
      '1B': 'standard',
      '1C': 'extraLegroom',
      '1D': 'standard',
      '1E': 'premium',
      '2A': 'extraLegroom',
      '2B': 'standard',
    },
    occupiedSeats: ['2D', '3B', '4E', '5A', '5B', '6D', '8C', '9E', '10A', '10D', '11B', '12C', '12D'],
  },
  'layout-2-3-2': {
    id: 'layout-2-3-2',
    name: 'Layout 2',
    configuration: '2–3–2',
    aircraft: 'Wide-body',
    rowCount: 14,
    seatGroups: [
      ['A', 'B'],
      ['D', 'E', 'F'],
      ['G', 'H'],
    ],
    exitRows: [10],
    premiumRows: [1, 2, 3],
    categoryOverrides: {},
    occupiedSeats: [
      '1B', '2E', '3G', '3H', '4D', '5B', '6F', '7A', '7E', '8H',
      '9D', '9E', '11B', '12G', '13D', '13F', '14A',
    ],
  },
};

export const LAYOUT_LIST: AircraftLayout[] = Object.values(LAYOUTS);

export const DEFAULT_LAYOUT_ID: LayoutId = 'layout-3-2';
