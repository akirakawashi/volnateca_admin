import { useId, useLayoutEffect, useMemo, useState } from 'react';
import { PopoverOverlay } from '../popover/PopoverOverlay';
import { useFixedPopoverOverlay } from '../popover/useFixedPopoverOverlay';
import styles from './MonthPicker.module.css';

interface MonthPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MONTHS = [
  { index: 0, label: 'янв' },
  { index: 1, label: 'фев' },
  { index: 2, label: 'мар' },
  { index: 3, label: 'апр' },
  { index: 4, label: 'май' },
  { index: 5, label: 'июн' },
  { index: 6, label: 'июл' },
  { index: 7, label: 'авг' },
  { index: 8, label: 'сен' },
  { index: 9, label: 'окт' },
  { index: 10, label: 'ноя' },
  { index: 11, label: 'дек' },
] as const;

const POPOVER_ESTIMATED_HEIGHT = 220;

function parseMonthValue(value: string | undefined): { year: number; month: number } | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10) - 1;
  if (month < 0 || month > 11) {
    return null;
  }

  return { year, month };
}

function formatMonthValue(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function formatDisplayValue(year: number, month: number): string {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
  const formatted = formatter.format(new Date(year, month, 1)).replace(' г.', '');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function MonthPicker({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = 'Выберите месяц',
}: MonthPickerProps) {
  const parsed = useMemo(() => parseMonthValue(value), [value]);
  const [viewYear, setViewYear] = useState(() => parsed?.year ?? new Date().getFullYear());
  const popoverId = useId();
  const {
    rootRef,
    overlayRef: popoverRef,
    open,
    style: menuStyle,
    overlayReady,
    toggleOpen,
    closeOverlay,
  } = useFixedPopoverOverlay({
    onBlur,
    estimatedHeight: POPOVER_ESTIMATED_HEIGHT,
  });

  useLayoutEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
    }
  }, [parsed]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    toggleOpen(() => {
      setViewYear(parsed?.year ?? new Date().getFullYear());
    });
  };

  const handleMonthSelect = (month: number) => {
    onChange?.(formatMonthValue(viewYear, month));
    closeOverlay();
    onBlur?.();
  };

  const handleThisMonth = () => {
    const now = new Date();
    const next = formatMonthValue(now.getFullYear(), now.getMonth());
    onChange?.(next);
    setViewYear(now.getFullYear());
    closeOverlay();
    onBlur?.();
  };

  const handleClear = () => {
    onChange?.('');
    closeOverlay();
    onBlur?.();
  };

  const displayValue = parsed ? formatDisplayValue(parsed.year, parsed.month) : null;

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        className={[styles.trigger, open ? styles.triggerOpen : ''].filter(Boolean).join(' ')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={handleToggle}
        onBlur={() => {
          window.setTimeout(() => {
            const activeElement = document.activeElement;
            const insideTrigger = !!activeElement && (rootRef.current?.contains(activeElement) ?? false);
            const insidePopover = !!activeElement && (popoverRef.current?.contains(activeElement) ?? false);
            if (!insideTrigger && !insidePopover) {
              closeOverlay();
              onBlur?.();
            }
          }, 0);
        }}
        disabled={disabled}
      >
        <span className={displayValue ? styles.value : styles.placeholder}>
          {displayValue ?? placeholder}
        </span>
        <span className={[styles.caret, open ? styles.caretOpen : ''].filter(Boolean).join(' ')} aria-hidden="true" />
      </button>

      <PopoverOverlay
        show={overlayReady}
        overlayRef={popoverRef}
        id={popoverId}
        role="dialog"
        aria-modal="false"
        style={menuStyle}
        panelClassName={styles.popover}
      >
          <div className={styles.header}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setViewYear((year) => year - 1)}
              aria-label="Предыдущий год"
            >
              ‹
            </button>
            <strong className={styles.yearTitle}>{viewYear}</strong>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setViewYear((year) => year + 1)}
              aria-label="Следующий год"
            >
              ›
            </button>
          </div>

          <div className={styles.monthGrid}>
            {MONTHS.map((month) => {
              const isSelected = parsed?.year === viewYear && parsed.month === month.index;

              return (
                <button
                  key={month.index}
                  type="button"
                  className={[
                    styles.monthCell,
                    isSelected ? styles.monthCellSelected : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleMonthSelect(month.index)}
                >
                  {month.label}
                </button>
              );
            })}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.footerAction} onClick={handleClear}>
              Очистить
            </button>
            <button type="button" className={styles.footerAction} onClick={handleThisMonth}>
              В этом месяце
            </button>
          </div>
      </PopoverOverlay>
    </div>
  );
}
