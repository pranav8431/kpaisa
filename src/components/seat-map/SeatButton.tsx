import { memo } from 'react';
import { SEAT_CATEGORIES } from '../../data/seatCategories';
import type { Seat } from '../../data/seats';
import { cx } from '../../utils/classNames';
import { formatPrice } from '../../utils/formatCurrency';
import styles from './SeatMap.module.css';

/** available: free to pick · selected: held by the active passenger · assigned: held by another passenger. */
export type SeatStatus = 'available' | 'occupied' | 'selected' | 'assigned';

interface SeatButtonProps {
  seat: Seat;
  status: SeatStatus;
  /** Number of the passenger holding the seat, shown on the seat. */
  holderNumber?: number;
  holderName?: string;
  onSelect: (seatId: string) => void;
  onInspect: (seatId: string | null) => void;
}

function describeSeat(seat: Seat, status: SeatStatus, holderName?: string): string {
  const category = SEAT_CATEGORIES[seat.categoryId].label;
  const base = `Seat ${seat.id}, ${seat.position}, ${category}, ${formatPrice(seat.price)}`;
  switch (status) {
    case 'occupied':
      return `${base}, unavailable`;
    case 'selected':
      return `${base}, selected for ${holderName}`;
    case 'assigned':
      return `${base}, assigned to ${holderName}`;
    default:
      return `${base}, available`;
  }
}

export const SeatButton = memo(function SeatButton({
  seat,
  status,
  holderNumber,
  holderName,
  onSelect,
  onInspect,
}: SeatButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        styles.seat,
        styles[`cat-${seat.categoryId}`],
        seat.price === 0 && styles.free,
        styles[status],
      )}
      // aria-disabled rather than disabled so clicks still reach the reducer,
      // which explains why the seat cannot be picked.
      aria-disabled={status === 'occupied' || undefined}
      aria-pressed={status === 'selected'}
      aria-label={describeSeat(seat, status, holderName)}
      onClick={() => onSelect(seat.id)}
      // Hover preview for mouse only; on touch, the tap itself selects and inspects.
      onPointerEnter={(event) => event.pointerType === 'mouse' && onInspect(seat.id)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && onInspect(null)}
      onFocus={() => onInspect(seat.id)}
      onBlur={() => onInspect(null)}
    >
      {status === 'occupied' ? (
        <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.occupiedIcon}>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        holderNumber && <span aria-hidden="true">{holderNumber}</span>
      )}
    </button>
  );
});
