import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PopoverOverlay } from '../popover/PopoverOverlay';
import { useFixedPopoverOverlay } from '../popover/useFixedPopoverOverlay';
import styles from './DateTimePicker.module.css';

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const POPOVER_MIN_WIDTH = 380;
const POPOVER_ESTIMATED_HEIGHT = 320;

function scrollColumnToSelected(column: HTMLDivElement | null) {
  if (!column) {
    return;
  }

  const selected = column.querySelector<HTMLElement>('[data-selected="true"]');
  if (!selected) {
    return;
  }

  const top = selected.offsetTop - column.clientHeight / 2 + selected.clientHeight / 2;
  column.scrollTop = Math.max(0, top);
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = 'дд.мм.гггг --:--',
}: DateTimePickerProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(parseLocalDateTime(value) ?? getDefaultDate()));
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
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
    minWidth: POPOVER_MIN_WIDTH,
    estimatedHeight: POPOVER_ESTIMATED_HEIGHT,
  });

  const selectedDate = useMemo(() => parseLocalDateTime(value), [value]);
  const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

  useLayoutEffect(() => {
    if (!open || selectedDate === null) {
      return;
    }

    scrollColumnToSelected(hoursRef.current);
    scrollColumnToSelected(minutesRef.current);
  }, [open, selectedDate]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    toggleOpen(() => {
      const currentDate = selectedDate ?? getDefaultDate();
      setViewMonth(startOfMonth(currentDate));
    });
  };

  const handleDateSelect = (day: Date) => {
    const base = selectedDate ?? getDefaultDate();
    const next = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      base.getHours(),
      base.getMinutes(),
      0,
      0,
    );
    onChange?.(formatLocalDateTime(next));
  };

  const handleHourSelect = (hour: number) => {
    const base = selectedDate ?? getDefaultDate();
    const next = new Date(base);
    next.setHours(hour, next.getMinutes(), 0, 0);
    onChange?.(formatLocalDateTime(next));
  };

  const handleMinuteSelect = (minute: number) => {
    const base = selectedDate ?? getDefaultDate();
    const next = new Date(base);
    next.setMinutes(minute, 0, 0);
    onChange?.(formatLocalDateTime(next));
  };

  const handleToday = () => {
    const now = getDefaultDate();
    onChange?.(formatLocalDateTime(now));
    setViewMonth(startOfMonth(now));
  };

  const handleClear = () => {
    onChange?.('');
    closeOverlay();
    onBlur?.();
  };

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
        <span className={selectedDate ? styles.value : styles.placeholder}>
          {selectedDate ? formatDisplayValue(selectedDate) : placeholder}
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
          <div className={styles.calendarPane}>
            <div className={styles.calendarHeader}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => setViewMonth((current) => addMonths(current, -1))}
                aria-label="Предыдущий месяц"
              >
                ‹
              </button>
              <strong className={styles.monthTitle}>{formatMonthTitle(viewMonth)}</strong>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => setViewMonth((current) => addMonths(current, 1))}
                aria-label="Следующий месяц"
              >
                ›
              </button>
            </div>

            <div className={styles.dayHeadRow}>
              {DAY_LABELS.map((label) => (
                <span key={label} className={styles.dayHead}>{label}</span>
              ))}
            </div>

            <div className={styles.dayGrid}>
              {calendarDays.map((day) => {
                const isSelected = selectedDate !== null && isSameDay(day, selectedDate);
                const isOutsideMonth = day.getMonth() !== viewMonth.getMonth();

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={[
                      styles.dayCell,
                      isSelected ? styles.dayCellSelected : '',
                      isOutsideMonth ? styles.dayCellMuted : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.footerAction} onClick={handleClear}>
                Очистить
              </button>
              <button type="button" className={styles.footerAction} onClick={handleToday}>
                Сегодня
              </button>
            </div>
          </div>

          <div className={styles.timePane}>
            <div className={styles.timeHeader}>
              <span>Часы</span>
              <span>Мин</span>
            </div>

            <div className={styles.timeColumns}>
              <div ref={hoursRef} className={styles.timeColumn}>
                {HOURS.map((hour) => {
                  const selectedHour = selectedDate?.getHours() === hour;

                  return (
                    <button
                      key={hour}
                      type="button"
                      data-selected={selectedHour ? 'true' : 'false'}
                      className={[
                        styles.timeCell,
                        selectedHour ? styles.timeCellSelected : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleHourSelect(hour)}
                    >
                      {padNumber(hour)}
                    </button>
                  );
                })}
              </div>

              <div ref={minutesRef} className={styles.timeColumn}>
                {MINUTES.map((minute) => {
                  const selectedMinute = selectedDate?.getMinutes() === minute;

                  return (
                    <button
                      key={minute}
                      type="button"
                      data-selected={selectedMinute ? 'true' : 'false'}
                      className={[
                        styles.timeCell,
                        selectedMinute ? styles.timeCellSelected : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleMinuteSelect(minute)}
                    >
                      {padNumber(minute)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
      </PopoverOverlay>
    </div>
  );
}

function parseLocalDateTime(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hours, minutes] = match;
  return new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
    Number.parseInt(day, 10),
    Number.parseInt(hours, 10),
    Number.parseInt(minutes, 10),
    0,
    0,
  );
}

function formatLocalDateTime(date: Date): string {
  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join('-') + `T${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function formatDisplayValue(date: Date): string {
  return `${padNumber(date.getDate())}.${padNumber(date.getMonth() + 1)}.${date.getFullYear()} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function formatMonthTitle(date: Date): string {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
  const formatted = formatter.format(date).replace(' г.', '');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function padNumber(value: number): string {
  return String(value).padStart(2, '0');
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const mondayFirstOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - mondayFirstOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

function getDefaultDate(): Date {
  const now = new Date();
  now.setSeconds(0, 0);
  return now;
}
