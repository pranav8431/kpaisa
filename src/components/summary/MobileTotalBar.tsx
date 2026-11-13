import { useBooking } from '../../state/useBooking';
import { formatCurrency } from '../../utils/formatCurrency';
import { SUMMARY_ID } from './PriceSummary';
import styles from './Summary.module.css';

/** Sticky footer on small screens so the running total is always visible. */
export function MobileTotalBar() {
  const { state, summary } = useBooking();
  return (
    <div className={styles.mobileBar}>
      <div>
        <p className={styles.mobileTotal}>{formatCurrency(summary.grandTotal)}</p>
        <p className={styles.mobileMeta}>
          {summary.seatedCount} of {state.passengers.length} seated
        </p>
      </div>
      <a className={styles.mobileLink} href={`#${SUMMARY_ID}`}>
        View summary
      </a>
    </div>
  );
}
