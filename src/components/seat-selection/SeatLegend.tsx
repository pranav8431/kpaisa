import { SEAT_CATEGORY_LIST } from '../../data/seatCategories';
import { cx } from '../../utils/classNames';
import { formatPrice } from '../../utils/formatCurrency';
import mapStyles from '../seat-map/SeatMap.module.css';
import styles from './SeatSelection.module.css';

interface LegendItemProps {
  swatchClass: string;
  label: string;
  detail?: string;
}

function LegendItem({ swatchClass, label, detail }: LegendItemProps) {
  return (
    <li className={styles.legendItem}>
      <span className={cx(mapStyles.seat, styles.swatch, swatchClass)} aria-hidden="true" />
      <span>
        {label}
        {detail && <span className={styles.legendDetail}> · {detail}</span>}
      </span>
    </li>
  );
}

/** Explains seat colours: one swatch per price category plus each seat state. */
export function SeatLegend() {
  return (
    <div className={styles.legend}>
      <ul className={styles.legendGroup} aria-label="Seat prices">
        {SEAT_CATEGORY_LIST.map((category) => (
          <LegendItem
            key={category.id}
            swatchClass={cx(mapStyles[`cat-${category.id}`], category.price === 0 && mapStyles.free)}
            label={category.label}
            detail={formatPrice(category.price)}
          />
        ))}
      </ul>
      <ul className={styles.legendGroup} aria-label="Seat states">
        <LegendItem swatchClass={mapStyles.selected} label="Current passenger" />
        <LegendItem swatchClass={mapStyles.assigned} label="Other passenger" />
        <LegendItem swatchClass={mapStyles.occupied} label="Occupied" />
      </ul>
    </div>
  );
}
