import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, error, hint, required, children }: FieldProps) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.req} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={[styles.control, error ? styles.hasError : ''].filter(Boolean).join(' ')}>
        {children}
      </div>
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={[styles.input, className].filter(Boolean).join(' ')} {...props} />;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={[styles.input, styles.textarea, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
