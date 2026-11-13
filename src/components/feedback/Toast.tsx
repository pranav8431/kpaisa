import { useEffect } from 'react';
import { useBooking } from '../../state/useBooking';
import { cx } from '../../utils/classNames';
import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 4000;

/** Shows the latest notice from the booking state (invalid actions, released seats…). */
export function Toast() {
  const { state, dispatch } = useBooking();
  const { notice } = state;

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(
      () => dispatch({ type: 'DISMISS_NOTICE', noticeId: notice.id }),
      AUTO_DISMISS_MS,
    );
    return () => window.clearTimeout(timer);
  }, [notice, dispatch]);

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {notice && (
        <div key={notice.id} className={cx(styles.toast, styles[notice.tone])}>
          <span className={styles.icon} aria-hidden="true">
            {notice.tone === 'error' ? '!' : notice.tone === 'success' ? '✓' : 'i'}
          </span>
          <p className={styles.message}>{notice.message}</p>
          <button
            type="button"
            className={styles.close}
            onClick={() => dispatch({ type: 'DISMISS_NOTICE', noticeId: notice.id })}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
