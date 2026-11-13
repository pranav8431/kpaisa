import styles from './ui.module.css';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** Compact −/+ number input with bounds. */
export function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.stepperButton}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <span aria-hidden="true">−</span>
      </button>
      <output className={styles.stepperValue} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles.stepperButton}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
