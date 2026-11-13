import type { CSSProperties } from 'react';
import type { AircraftLayout } from '../../data/layouts';

/** Grid column template: row label, then seat blocks separated by aisles. */
export function getRowTemplate(seatGroups: string[][]): string {
  const blocks = seatGroups.map((group) => `repeat(${group.length}, var(--seat))`);
  return `var(--label) ${blocks.join(' var(--aisle) ')}`;
}

/** CSS variables that let seats scale to fit the available width. */
export function getCabinStyle(layout: AircraftLayout): CSSProperties {
  return {
    '--seat-count': layout.seatGroups.flat().length,
    '--aisle-count': layout.seatGroups.length - 1,
  } as CSSProperties;
}
