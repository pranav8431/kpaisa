import { SEAT_CATEGORIES } from '../../data/seatCategories';
import { getPassengerName } from '../../state/bookingReducer';
import { useBooking } from '../../state/useBooking';
import { formatCurrency, formatPrice } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import styles from './Summary.module.css';

export const SUMMARY_ID = 'price-summary';

export function PriceSummary() {
  const { state, dispatch, summary } = useBooking();
  const passengerCount = state.passengers.length;
  const allSeated = summary.seatedCount === passengerCount;
  const isEmpty = summary.seatedCount === 0 && summary.mealCount === 0;

  function handleContinue() {
    dispatch({
      type: 'SHOW_NOTICE',
      tone: 'success',
      message: `All set: ${passengerCount} seat${passengerCount > 1 ? 's' : ''} held, total ${formatCurrency(summary.grandTotal)}. (Demo only, no payment taken.)`,
    });
  }

  return (
    <Panel id={SUMMARY_ID} title="Price summary" subtitle="Seat and meal charges per passenger">
      {isEmpty ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nothing selected yet</p>
          <p>Choose a seat for each passenger to see the charges here. Many seats are free.</p>
        </div>
      ) : (
        <ul className={styles.lines}>
          {summary.lines.map(({ passenger, seat, meal, subtotal }) => (
            <li key={passenger.id} className={styles.line}>
              <div className={styles.lineHeader}>
                <span className={styles.lineName}>{getPassengerName(passenger)}</span>
                <span className={styles.amount}>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.item}>
                <span>
                  {seat ? `Seat ${seat.id} · ${SEAT_CATEGORIES[seat.categoryId].label}` : 'No seat selected'}
                </span>
                <span className={styles.amount}>{seat ? formatPrice(seat.price) : '—'}</span>
              </div>
              {meal && (
                <div className={styles.item}>
                  <span>Meal · {meal.name}</span>
                  <span className={styles.amount}>{formatPrice(meal.price)}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt>Seats ({summary.seatedCount})</dt>
          <dd className={styles.amount}>{formatCurrency(summary.seatTotal)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Meals ({summary.mealCount})</dt>
          <dd className={styles.amount}>{formatCurrency(summary.mealTotal)}</dd>
        </div>
        <div className={styles.grandTotal}>
          <dt>Total</dt>
          <dd className={styles.amount} aria-live="polite">
            {formatCurrency(summary.grandTotal)}
          </dd>
        </div>
      </dl>

      <Button variant="primary" block disabled={!allSeated} onClick={handleContinue}>
        Continue
      </Button>
      {!allSeated && (
        <p className={styles.hint}>
          {passengerCount - summary.seatedCount} passenger
          {passengerCount - summary.seatedCount > 1 ? 's' : ''} still need a seat.
        </p>
      )}
    </Panel>
  );
}
