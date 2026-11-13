import type { ReactNode } from 'react';
import { cx } from '../../utils/classNames';
import styles from './ui.module.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  name: string;
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A radio group styled as segmented buttons (native radios give arrow-key support). */
export function SegmentedControl<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={styles.segmented}>
      <legend className="visually-hidden">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cx(styles.segment, option.value === value && styles.segmentActive)}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="visually-hidden"
          />
          <span className={styles.segmentLabel}>{option.label}</span>
          {option.hint && <span className={styles.segmentHint}>{option.hint}</span>}
        </label>
      ))}
    </fieldset>
  );
}
