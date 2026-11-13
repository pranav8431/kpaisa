import { SEAT_CATEGORIES } from '../../data/seatCategories';
import { MAX_NAME_LENGTH, getPassengerName } from '../../state/bookingReducer';
import type { PassengerLine } from '../../state/selectors';
import { cx } from '../../utils/classNames';
import { formatPrice } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';
import { PassengerAvatar } from './PassengerAvatar';
import styles from './Passengers.module.css';

interface PassengerCardProps {
  line: PassengerLine;
  isActive: boolean;
  onSelect: (passengerId: string) => void;
  onRename: (passengerId: string, name: string) => void;
  onRemoveSeat: (passengerId: string) => void;
}

export function PassengerCard({
  line,
  isActive,
  onSelect,
  onRename,
  onRemoveSeat,
}: PassengerCardProps) {
  const { passenger, seat, meal } = line;
  const displayName = getPassengerName(passenger);

  return (
    <li
      className={cx(styles.card, isActive && styles.cardActive)}
      onClick={() => onSelect(passenger.id)}
      aria-current={isActive || undefined}
    >
      <div className={styles.cardTop}>
        <button
          type="button"
          className={styles.selectButton}
          onClick={() => onSelect(passenger.id)}
          aria-pressed={isActive}
          aria-label={`Choose seat for ${displayName}`}
        >
          <PassengerAvatar number={passenger.number} active={isActive} />
        </button>
        <input
          className={styles.nameInput}
          value={passenger.name}
          placeholder={`Passenger ${passenger.number}`}
          maxLength={MAX_NAME_LENGTH}
          onChange={(event) => onRename(passenger.id, event.target.value)}
          onFocus={() => onSelect(passenger.id)}
          aria-label={`Name of passenger ${passenger.number}`}
        />
        {isActive && <span className={styles.activeTag}>Selecting</span>}
      </div>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>Seat</dt>
          <dd>
            {seat ? (
              <>
                <strong>{seat.id}</strong>
                <span className={styles.factMeta}>{SEAT_CATEGORIES[seat.categoryId].label}</span>
              </>
            ) : (
              <span className={styles.factEmpty}>Not selected</span>
            )}
          </dd>
          <dd className={styles.factPrice}>{seat ? formatPrice(seat.price) : '—'}</dd>
          {seat && (
            <dd className={styles.factAction}>
              <Button
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveSeat(passenger.id);
                }}
                aria-label={`Remove seat ${seat.id} from ${displayName}`}
              >
                Remove
              </Button>
            </dd>
          )}
        </div>
        <div className={styles.fact}>
          <dt>Meal</dt>
          <dd>
            {meal ? (
              <span className={styles.factText}>{meal.name}</span>
            ) : (
              <span className={styles.factEmpty}>None</span>
            )}
          </dd>
          <dd className={styles.factPrice}>{meal ? formatPrice(meal.price) : '—'}</dd>
        </div>
      </dl>
    </li>
  );
}
