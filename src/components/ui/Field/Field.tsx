import { useId, useMemo } from 'react';
import type {
  InputHTMLAttributes,
  KeyboardEvent,
  TextareaHTMLAttributes,
} from 'react';
import { PopoverOverlay } from '../popover/PopoverOverlay';
import { useFixedPopoverOverlay } from '../popover/useFixedPopoverOverlay';
import styles from './Field.module.css';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
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
  disabled?: boolean;
  disabledHint?: string;
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
  const listboxId = useId();
  const menuEstimatedHeight = Math.min(options.length * 42 + 16, 320);
  const {
    rootRef,
    overlayRef: menuRef,
    open,
    style: menuStyle,
    overlayReady,
    toggleOpen,
    openOverlay,
    closeOverlay,
  } = useFixedPopoverOverlay({
    onBlur,
    estimatedHeight: menuEstimatedHeight,
  });

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    toggleOpen();
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) {
      return;
    }
    const nextValue = option.value;
    onChange?.(nextValue);
    onBlur?.();
    closeOverlay();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleOpen();
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openOverlay();
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
              closeOverlay();
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

      <PopoverOverlay
        show={overlayReady}
        overlayRef={menuRef}
        style={menuStyle}
        id={listboxId}
        role="listbox"
        panelClassName={styles.selectMenu}
      >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled ? 'true' : undefined}
                  disabled={option.disabled}
                  title={option.disabledHint}
                  className={[
                    styles.selectOption,
                    isSelected ? styles.selectOptionSelected : '',
                    option.disabled ? styles.selectOptionDisabled : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.label}</span>
                  {isSelected && <span className={styles.selectOptionCheck}>✓</span>}
                </button>
              );
            })}
      </PopoverOverlay>
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
