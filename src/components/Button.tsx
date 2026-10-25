import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  /** Primary actions are 64 px tall; regular buttons 48 px. */
  large?: boolean;
};

export function Button({
  variant = 'primary',
  large = false,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant], large && styles.large, className];
  return <button type={type} className={classes.filter(Boolean).join(' ')} {...props} />;
}
