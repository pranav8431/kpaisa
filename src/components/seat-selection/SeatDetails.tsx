import { SEAT_CATEGORIES } from '../../data/seatCategories';
import type { Seat } from '../../data/seats';
import { getPassengerName, type Passenger } from '../../state/bookingReducer';
import { cx } from '../../utils/classNames';
import { formatPrice } from '../../utils/formatCurrency';
import { PassengerAvatar } from '../passengers/PassengerAvatar';
import styles from './SeatSelection.module.css';

interface SeatDetailsProps {
  seat: Seat | null;
  activePassenger: Passenger;
  holder: Passenger | null;
  isExitRow: boolean;
}

function getSeatHint(seat: Seat, activePassenger: Passenger, holder: Passenger | null) {
  const activeName = getPassengerName(activePassenger);
  if (seat.occupied) return { tone: 'muted', text: 'Already booked by another traveller' };
  if (holder?.id === activePassenger.id)
    return { tone: 'brand', text: 'Your seat · select again to release' };
  if (holder) return { tone: 'muted', text: `Assigned to ${getPassengerName(holder)}` };
  return { tone: 'success', text: `Available · click to assign to ${activeName}` };
}

/**
 * Shows who is choosing and the details of the seat being hovered/focused
 * (or the current passenger's seat when nothing is hovered).
 */
export function SeatDetails({ seat, activePassenger, holder, isExitRow }: SeatDetailsProps) {
  const category = seat && SEAT_CATEGORIES[seat.categoryId];
  const hint = seat && getSeatHint(seat, activePassenger, holder);

  return (
    <div className={styles.details} aria-live="polite">
      <div className={styles.choosingFor}>
        <PassengerAvatar number={activePassenger.number} active />
        <div>
          <p className={styles.eyebrow}>Choosing for</p>
          <p className={styles.choosingName}>{getPassengerName(activePassenger)}</p>
        </div>
      </div>

      {/* Fixed-height slot: content changes on hover must not shift the seat map below. */}
      <div className={styles.seatInfoSlot}>
        {seat && category && hint ? (
          <div className={styles.seatInfo}>
            <div>
              <p className={styles.seatInfoTitle}>
                Seat {seat.id}
                <span className={cx(styles.categoryChip, styles[`chip-${seat.categoryId}`])}>
                  {category.label}
                </span>
              </p>
              <p className={styles.seatInfoMeta}>
                Row {seat.row} · {seat.position} seat{isExitRow && ' · exit row'} · {category.description}
              </p>
              <p className={cx(styles.seatHint, styles[`hint-${hint.tone}`])}>{hint.text}</p>
            </div>
            <p className={styles.seatInfoPrice}>{formatPrice(seat.price)}</p>
          </div>
        ) : (
          <p className={styles.seatInfoEmpty}>Hover over or tap a seat to see its price and details.</p>
        )}
      </div>
    </div>
  );
}
