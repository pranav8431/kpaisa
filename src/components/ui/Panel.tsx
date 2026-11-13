import type { ReactNode } from 'react';
import { cx } from '../../utils/classNames';
import styles from './ui.module.css';

interface PanelProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Card container with a heading row, used for every section of the page. */
export function Panel({ title, subtitle, actions, children, className, id }: PanelProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section className={cx(styles.panel, className)} id={id} aria-labelledby={headingId}>
      <header className={styles.panelHeader}>
        <div className={styles.panelHeading}>
          <h2 id={headingId} className={styles.panelTitle}>
            {title}
          </h2>
          {subtitle && <p className={styles.panelSubtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.panelActions}>{actions}</div>}
      </header>
      {children}
    </section>
  );
}
