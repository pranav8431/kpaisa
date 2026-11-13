import { Fragment } from 'react';
import type { AircraftLayout } from '../../data/layouts';
import { Button } from '../ui/Button';
import { getCabinStyle, getRowTemplate } from './cabinLayout';
import styles from './SeatMap.module.css';

const SKELETON_ROWS = 8;

/** Placeholder cabin with the same shape as the layout being loaded. */
export function SeatMapSkeleton({ layout }: { layout: AircraftLayout }) {
  const rowTemplate = getRowTemplate(layout.seatGroups);
  return (
    <div className={styles.viewport} role="status" aria-live="polite">
      <span className="visually-hidden">Loading seat map…</span>
      <div className={styles.cabin} style={getCabinStyle(layout)} aria-hidden="true">
        <div className={styles.nose}>Front</div>
        {Array.from({ length: SKELETON_ROWS }, (_, row) => (
          <div key={row} className={styles.row} style={{ gridTemplateColumns: rowTemplate }}>
            <span />
            {layout.seatGroups.map((group, index) => (
              <Fragment key={index}>
                {index > 0 && <span />}
                {group.map((letter) => (
                  <span key={letter} className={styles.skeletonSeat} />
                ))}
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeatMapError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.errorState} role="alert">
      <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v6M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className={styles.errorTitle}>Seat map unavailable</p>
      <p className={styles.errorMessage}>{message}</p>
      <Button variant="primary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
