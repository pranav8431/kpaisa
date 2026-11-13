import { cx } from '../../utils/classNames';
import styles from './Passengers.module.css';

export function PassengerAvatar({ number, active }: { number: number; active?: boolean }) {
  return (
    <span className={cx(styles.avatar, active && styles.avatarActive)} aria-hidden="true">
      {number}
    </span>
  );
}
