import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/classNames';
import styles from './ui.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  block?: boolean;
}

export function Button({ variant = 'default', block, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        block && styles.block,
        className,
      )}
      {...rest}
    />
  );
}
