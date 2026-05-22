import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  InputHTMLAttributes,
  KeyboardEvent,
  CSSProperties,
  TextareaHTMLAttributes,
} from 'react';
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

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  options: readonly SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return <input className={[styles.input, className].filter(Boolean).join(' ')} {...props} />;
}

export function Select({
  name,
  value,
  onChange,
  onBlur,
  disabled,
  options,
  placeholder,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const updateMenuPosition = () => {
      const trigger = rootRef.current?.querySelector('button');
      if (!(trigger instanceof HTMLButtonElement)) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 10,
        left: rect.left,
        width: rect.width,
      });
    };

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = rootRef.current?.contains(target) ?? false;
      const insideMenu = menuRef.current?.contains(target) ?? false;
      if (!insideTrigger && !insideMenu) {
        setOpen(false);
        onBlur?.();
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onBlur?.();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [onBlur, open]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    setOpen((current) => !current);
  };

  const handleSelect = (nextValue: string) => {
    onChange?.(nextValue);
    onBlur?.();
    setOpen(false);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((current) => !current);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div
      ref={rootRef}
      className={[styles.selectRoot, className].filter(Boolean).join(' ')}
      data-open={open ? 'true' : 'false'}
    >
      <input type="hidden" name={name} value={value ?? ''} />
      <button
        type="button"
        className={[
          styles.input,
          styles.selectTrigger,
          open ? styles.selectTriggerOpen : '',
        ].filter(Boolean).join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        onBlur={() => {
          window.setTimeout(() => {
            const activeElement = document.activeElement;
            const insideTrigger = !!activeElement && (rootRef.current?.contains(activeElement) ?? false);
            const insideMenu = !!activeElement && (menuRef.current?.contains(activeElement) ?? false);
            if (!insideTrigger && !insideMenu) {
              setOpen(false);
              onBlur?.();
            }
          }, 0);
        }}
        disabled={disabled}
      >
        <span className={selectedOption ? styles.selectValue : styles.selectPlaceholder}>
          {selectedOption?.label ?? placeholder ?? 'Выбери значение'}
        </span>
        <span
          className={[styles.selectCaret, open ? styles.selectCaretOpen : ''].filter(Boolean).join(' ')}
          aria-hidden="true"
        />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className={styles.selectMenu}
          id={listboxId}
          role="listbox"
          style={menuStyle}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={[
                  styles.selectOption,
                  isSelected ? styles.selectOptionSelected : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {isSelected && <span className={styles.selectOptionCheck}>✓</span>}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={[styles.input, styles.textarea, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
