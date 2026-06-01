import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Field, Input, Select, Textarea } from '../../components/ui/Field/Field';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useRedemptionQueue } from '../../contexts/redemptionQueue';
import { listPrizes } from '../../api/prizes';
import { getPrizeRedemptionByCode } from '../../api/prizeRedemptions';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { usePrizeRedemptions } from '../../hooks/usePrizeRedemptions';
import type { AdminPrize } from '../../types/prize';
import {
  PRIZE_REDEMPTION_STATUSES,
  type AdminPrizeRedemption,
  type PrizeRedemptionStatus,
} from '../../types/prizeRedemption';
import { playFulfillmentSuccessFeedback } from '../../utils/fulfillmentFeedback';
import {
  buildVkUserUrl,
  formatRedemptionDateTime,
  matchesRedemptionSearch,
  normalizeRedemptionCodeQuery,
  sortRedemptionsForQueue,
} from '../../utils/prizeRedemption';
import { formatReceiveType } from '../../utils/prizeReceiveType';
import styles from './PrizeRedemptionsPage.module.css';

const statusLabels: Record<PrizeRedemptionStatus, string> = {
  reserved: 'Ожидает выдачи',
  issued: 'Выдан',
  canceled: 'Отменён',
};

const statusFilterOptions = [
  { value: 'reserved', label: 'Ожидают выдачи' },
  { value: 'issued', label: 'Выданные' },
  { value: 'canceled', label: 'Отменённые' },
  { value: '', label: 'Все статусы' },
];

const VIEW_MODE_STORAGE_KEY = 'volnateca_admin_redemption_view_mode';
const CODE_SEARCH_INPUT_ID = 'redemption-code-search';
const COUNTER_CODE_INPUT_ID = 'redemption-counter-code';
const COUNTER_CODE_LOOKUP_DELAY_MS = 250;
const MIN_COUNTER_CODE_LOOKUP_LENGTH = 3;

type ViewMode = 'counter' | 'full';

interface CounterCodeLookupState {
  query: string;
  result: AdminPrizeRedemption | null;
  loading: boolean;
  searched: boolean;
  error: string | null;
}

function readViewMode(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === 'full' ? 'full' : 'counter';
  } catch {
    return 'counter';
  }
}

function parseStatusParam(value: string | null): PrizeRedemptionStatus | null {
  if (!value) {
    return 'reserved';
  }
  if (value === 'all') {
    return null;
  }
  return PRIZE_REDEMPTION_STATUSES.includes(value as PrizeRedemptionStatus)
    ? (value as PrizeRedemptionStatus)
    : 'reserved';
}

function parsePrizesIdParam(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function PrizeRedemptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = parseStatusParam(searchParams.get('status'));
  const prizesIdFilter = parsePrizesIdParam(searchParams.get('prizes_id'));

  const [viewMode, setViewMode] = useState<ViewMode>(readViewMode);
  const [prizes, setPrizes] = useState<AdminPrize[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [operatorComment, setOperatorComment] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [counterCodeLookup, setCounterCodeLookup] = useState<CounterCodeLookupState>({
    query: '',
    result: null,
    loading: false,
    searched: false,
    error: null,
  });

  const statusRef = useRef<HTMLDivElement>(null);
  const { refreshQueueCount } = useRedemptionQueue();

  const {
    items,
    hasMore,
    loading,
    loadingMore,
    acting,
    error,
    lastAction,
    fetchList,
    loadMore,
    fulfill,
    cancel,
    resetStatus,
  } = usePrizeRedemptions();

  const filters = useMemo(
    () => ({ status: statusFilter, prizes_id: prizesIdFilter }),
    [statusFilter, prizesIdFilter],
  );

  const reload = useCallback(async () => {
    await fetchList(filters);
    await refreshQueueCount();
  }, [fetchList, filters, refreshQueueCount]);

  useEffect(() => {
    void listPrizes()
      .then((data) => setPrizes([...data].sort((a, b) => a.prize_name.localeCompare(b.prize_name, 'ru'))))
      .catch(() => setPrizes([]));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [reload]);

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => matchesRedemptionSearch(item, searchQuery));
    return sortRedemptionsForQueue(filtered, statusFilter);
  }, [items, searchQuery, statusFilter]);

  const queueCount = useMemo(
    () => items.filter((item) => item.prize_redemption_status === 'reserved').length,
    [items],
  );

  const normalizedSearch = normalizeRedemptionCodeQuery(searchQuery);
  const localExactCodeMatch = useMemo(() => {
    if (!normalizedSearch) {
      return null;
    }
    return (
      items.find(
        (item) => normalizeRedemptionCodeQuery(item.redemption_code) === normalizedSearch,
      ) ?? null
    );
  }, [items, normalizedSearch]);

  const remoteExactCodeMatch = useMemo(() => {
    if (
      counterCodeLookup.query !== normalizedSearch ||
      counterCodeLookup.result == null ||
      normalizeRedemptionCodeQuery(counterCodeLookup.result.redemption_code) !== normalizedSearch
    ) {
      return null;
    }
    return counterCodeLookup.result;
  }, [counterCodeLookup, normalizedSearch]);

  const exactCodeMatch = localExactCodeMatch ?? remoteExactCodeMatch;
  const currentCodeLookup =
    counterCodeLookup.query === normalizedSearch
      ? counterCodeLookup
      : {
          query: normalizedSearch,
          result: null,
          loading: false,
          searched: false,
          error: null,
        };

  const selected = useMemo(
    () =>
      exactCodeMatch ??
      visibleItems.find((item) => item.prize_redemptions_id === selectedId) ??
      null,
    [exactCodeMatch, visibleItems, selectedId],
  );

  const counterTarget = selected;

  useEffect(() => {
    if (
      viewMode !== 'counter' ||
      normalizedSearch.length < MIN_COUNTER_CODE_LOOKUP_LENGTH ||
      localExactCodeMatch != null
    ) {
      return undefined;
    }

    let active = true;
    const lookupQuery = normalizedSearch;

    const timeoutId = window.setTimeout(() => {
      setCounterCodeLookup({
        query: lookupQuery,
        result: null,
        loading: true,
        searched: false,
        error: null,
      });

      void getPrizeRedemptionByCode(lookupQuery)
        .then((result) => {
          if (!active) {
            return;
          }
          setCounterCodeLookup({
            query: lookupQuery,
            result,
            loading: false,
            searched: true,
            error: null,
          });
        })
        .catch((e) => {
          if (!active) {
            return;
          }
          setCounterCodeLookup({
            query: lookupQuery,
            result: null,
            loading: false,
            searched: true,
            error: e instanceof Error ? e.message : String(e),
          });
        });
    }, COUNTER_CODE_LOOKUP_DELAY_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [localExactCodeMatch, normalizedSearch, viewMode]);

  useAutoStatusMessage({
    active: Boolean(lastAction || error),
    scrollRef: statusRef,
    onDismiss: lastAction ? resetStatus : undefined,
    dismissAfter: lastAction ? 6000 : 0,
  });

  const updateFilters = useCallback(
    (next: { status?: PrizeRedemptionStatus | null; prizes_id?: number | null }) => {
      const params = new URLSearchParams(searchParams);
      const nextStatus = next.status !== undefined ? next.status : statusFilter;
      const nextPrizeId = next.prizes_id !== undefined ? next.prizes_id : prizesIdFilter;

      if (nextStatus === null) {
        params.set('status', 'all');
      } else {
        params.set('status', nextStatus);
      }

      if (nextPrizeId == null) {
        params.delete('prizes_id');
      } else {
        params.set('prizes_id', String(nextPrizeId));
      }

      setSelectedId(null);
      setShowCancelForm(false);
      setSearchParams(params, { replace: true });
    },
    [prizesIdFilter, searchParams, setSearchParams, statusFilter],
  );

  useEffect(() => {
    if (viewMode === 'counter' && statusFilter !== 'reserved') {
      const timeoutId = window.setTimeout(() => {
        updateFilters({ status: 'reserved' });
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [updateFilters, viewMode, statusFilter]);

  const persistViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // localStorage недоступен — режим только в сессии.
    }
    if (mode === 'counter' && statusFilter !== 'reserved') {
      updateFilters({ status: 'reserved' });
    }
  };

  const handleFulfill = async (target: AdminPrizeRedemption | null = selected) => {
    if (!target || target.prize_redemption_status !== 'reserved') {
      return;
    }

    const updated = await fulfill(target.prize_redemptions_id, operatorComment);
    if (updated) {
      playFulfillmentSuccessFeedback();
      setOperatorComment('');
      setShowCancelForm(false);
      setSearchQuery('');
      await refreshQueueCount();
      if (statusFilter === 'reserved') {
        setSelectedId(null);
      }
    }
  };

  const handleCancel = async () => {
    if (!selected || selected.prize_redemption_status !== 'reserved') {
      return;
    }

    const reason = cancelReason.trim();
    if (!reason) {
      return;
    }

    const updated = await cancel(selected.prize_redemptions_id, reason);
    if (updated) {
      setCancelReason('');
      setShowCancelForm(false);
      await refreshQueueCount();
      if (statusFilter === 'reserved') {
        setSelectedId(null);
      }
    }
  };

  const prizeOptions = [
    { value: '', label: 'Все призы' },
    ...prizes.map((prize) => ({
      value: String(prize.prizes_id),
      label: prize.prize_name,
    })),
  ];

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Store fulfillment"
        title="Выдача призов"
        subtitle={
          viewMode === 'counter'
            ? 'Режим стойки: введите код с экрана пользователя и нажмите Enter или «Выдано»'
            : 'Очередь заявок после покупки в магазине: сверка кода, отметка «Выдано» или отмена с возвратом ✦'
        }
        aside={
          <div className={styles.queueMeta} aria-hidden="true">
            <div className={styles.queueCount}>
              <span>В очереди</span>
              <strong>{queueCount}</strong>
            </div>
          </div>
        }
      />

      {(lastAction || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {lastAction && <Alert variant="success">{lastAction}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}

      <Card title="Режим работы" className={styles.toolbarCard}>
        <div className={styles.modeSwitch}>
          <Button
            type="button"
            variant={viewMode === 'counter' ? 'primary' : 'ghost'}
            onClick={() => persistViewMode('counter')}
          >
            Стойка
          </Button>
          <Button
            type="button"
            variant={viewMode === 'full' ? 'primary' : 'ghost'}
            onClick={() => persistViewMode('full')}
          >
            Полный список
          </Button>
          <Button
            variant="ghost"
            loading={loading}
            onClick={() => {
              resetStatus();
              void reload();
            }}
          >
            Обновить
          </Button>
        </div>
      </Card>

      {viewMode === 'counter' ? (
        <CounterModePanel
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          counterTarget={counterTarget}
          normalizedSearch={normalizedSearch}
          itemsLoaded={items.length > 0}
          loading={loading}
          codeLookupLoading={currentCodeLookup.loading}
          codeLookupSearched={currentCodeLookup.searched}
          codeLookupError={currentCodeLookup.error}
          acting={acting}
          operatorComment={operatorComment}
          onOperatorCommentChange={setOperatorComment}
          onFulfill={() => void handleFulfill(counterTarget)}
          onSwitchToFull={() => persistViewMode('full')}
          onLoadMore={() => void loadMore(filters)}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      ) : (
        <>
          <Card title="Поиск и фильтры" className={styles.toolbarCard}>
            <div className={styles.toolbar}>
              <div className={styles.toolbarRow}>
                <Field
                  label="Код выдачи, VK ID или приз"
                  hint="Поиск по уже загруженным заявкам. Если кода нет в списке — нажмите «Загрузить ещё» или смените фильтр статуса."
                >
                  <Input
                    id={CODE_SEARCH_INPUT_ID}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Например: ABC12DEF"
                    autoComplete="off"
                  />
                </Field>

                <Field label="Статус">
                  <Select
                    name="status_filter"
                    value={statusFilter ?? ''}
                    onChange={(value) =>
                      updateFilters({
                        status: value === '' ? null : (value as PrizeRedemptionStatus),
                      })
                    }
                    options={statusFilterOptions}
                  />
                </Field>

                <Field label="Приз">
                  <Select
                    name="prize_filter"
                    value={prizesIdFilter == null ? '' : String(prizesIdFilter)}
                    onChange={(value) =>
                      updateFilters({
                        prizes_id: value === '' ? null : Number.parseInt(value, 10),
                      })
                    }
                    options={prizeOptions}
                  />
                </Field>
              </div>

              <p className={styles.hint}>
                Для пункта выдачи удобнее режим «Стойка». Отмена доступна только для статуса
                «ожидает выдачи» — ✦ вернутся на баланс автоматически.
              </p>
            </div>
          </Card>

          <div className={styles.layout}>
            <Card
              title="Заявки"
              className={styles.listCard}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById(CODE_SEARCH_INPUT_ID)?.focus()}
                >
                  К поиску
                </Button>
              }
            >
              {loading && items.length === 0 && <p className={styles.empty}>Загрузка заявок…</p>}

              {!loading && visibleItems.length === 0 && (
                <div className={styles.empty}>
                  <p>Заявок по текущим фильтрам нет.</p>
                  {normalizedSearch && items.length > 0 && (
                    <p className={styles.searchMiss}>
                      Код «{searchQuery.trim()}» не найден среди загруженных записей — попробуйте
                      загрузить следующую страницу или сменить статус на «Все».
                    </p>
                  )}
                </div>
              )}

              {visibleItems.length > 0 && (
                <div className={styles.list}>
                  {visibleItems.map((item) => (
                    <RedemptionListItem
                      key={item.prize_redemptions_id}
                      item={item}
                      selected={item.prize_redemptions_id === selected?.prize_redemptions_id}
                      onSelect={() => {
                        setSelectedId(item.prize_redemptions_id);
                        setShowCancelForm(false);
                        resetStatus();
                      }}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className={styles.listFooter}>
                  <Button
                    variant="secondary"
                    loading={loadingMore}
                    disabled={loading}
                    onClick={() => void loadMore(filters)}
                  >
                    Загрузить ещё
                  </Button>
                </div>
              )}
            </Card>

            <Card title="Карточка заявки" className={styles.detailCard}>
              {!selected ? (
                <div className={styles.detailPlaceholder}>
                  <p>Выберите заявку из списка или введите точный код выдачи в поиске.</p>
                </div>
              ) : (
                <RedemptionDetail
                  item={selected}
                  acting={acting}
                  operatorComment={operatorComment}
                  cancelReason={cancelReason}
                  showCancelForm={showCancelForm}
                  onOperatorCommentChange={setOperatorComment}
                  onCancelReasonChange={setCancelReason}
                  onToggleCancelForm={() => setShowCancelForm((value) => !value)}
                  onFulfill={() => void handleFulfill()}
                  onCancel={() => void handleCancel()}
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

interface CounterModePanelProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  counterTarget: AdminPrizeRedemption | null;
  normalizedSearch: string;
  itemsLoaded: boolean;
  loading: boolean;
  codeLookupLoading: boolean;
  codeLookupSearched: boolean;
  codeLookupError: string | null;
  acting: boolean;
  operatorComment: string;
  onOperatorCommentChange: (value: string) => void;
  onFulfill: () => void;
  onSwitchToFull: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

function CounterModePanel({
  searchQuery,
  onSearchQueryChange,
  counterTarget,
  normalizedSearch,
  itemsLoaded,
  loading,
  codeLookupLoading,
  codeLookupSearched,
  codeLookupError,
  acting,
  operatorComment,
  onOperatorCommentChange,
  onFulfill,
  onSwitchToFull,
  onLoadMore,
  hasMore,
  loadingMore,
}: CounterModePanelProps) {
  const canFulfill = counterTarget?.prize_redemption_status === 'reserved';

  const handleCodeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || acting) {
      return;
    }
    event.preventDefault();
    if (canFulfill) {
      onFulfill();
    }
  };

  return (
    <Card title="Стойка выдачи" className={styles.counterCard}>
      <div className={styles.counterBody}>
        <Field
          label="Код выдачи"
          hint="С экрана VK пользователя. Enter — отметить «Выдано», если заявка найдена."
        >
          <Input
            id={COUNTER_CODE_INPUT_ID}
            className={styles.counterInput}
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            onKeyDown={handleCodeKeyDown}
            placeholder="Введите код"
            autoComplete="off"
            autoFocus
          />
        </Field>

        {loading && !itemsLoaded && <p className={styles.empty}>Загрузка очереди…</p>}

        {codeLookupLoading && !counterTarget && (
          <p className={styles.empty}>Ищем код выдачи…</p>
        )}

        {codeLookupError && !counterTarget && (
          <Alert variant="error">
            {codeLookupError}
          </Alert>
        )}

        {!loading && !codeLookupLoading && codeLookupSearched && normalizedSearch && !counterTarget && (
          <Alert variant="error">
            Код «{searchQuery.trim()}» не найден. Проверьте код или откройте{' '}
            <button type="button" className={styles.inlineAction} onClick={onSwitchToFull}>
              полный список
            </button>
            .
          </Alert>
        )}

        {counterTarget && (
          <div className={styles.counterMatch}>
            <code className={styles.counterMatchCode}>{counterTarget.redemption_code}</code>
            <p className={styles.counterMatchTitle}>{counterTarget.prize_name}</p>
            <div className={styles.counterMatchMeta}>
              <span>{counterTarget.points_spent} ✦</span>
              {counterTarget.vk_user_id != null && <span>VK id{counterTarget.vk_user_id}</span>}
              <span
                className={[styles.badge, getStatusBadgeClass(counterTarget.prize_redemption_status)].join(
                  ' ',
                )}
              >
                {statusLabels[counterTarget.prize_redemption_status]}
              </span>
            </div>
            {counterTarget.comment && (
              <p className={styles.hint}>Комментарий: {counterTarget.comment}</p>
            )}
            {counterTarget.prize_redemption_status !== 'reserved' && (
              <Alert variant="info">
                Эта заявка уже в статусе «{statusLabels[counterTarget.prize_redemption_status].toLowerCase()}» —
                выдать повторно нельзя.
              </Alert>
            )}
          </div>
        )}

        <Field label="Комментарий оператора (необязательно)">
          <Textarea
            value={operatorComment}
            onChange={(event) => onOperatorCommentChange(event.target.value)}
            rows={2}
            placeholder="Например: выдан размер M"
          />
        </Field>

        <div className={styles.counterActions}>
          <Button
            variant="primary"
            size="md"
            className={styles.counterFulfillBtn}
            loading={acting}
            disabled={!canFulfill}
            onClick={onFulfill}
          >
            Выдано
          </Button>
          {hasMore && (
            <Button variant="secondary" loading={loadingMore} onClick={onLoadMore}>
              Загрузить ещё
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

interface RedemptionListItemProps {
  item: AdminPrizeRedemption;
  selected: boolean;
  onSelect: () => void;
}

function RedemptionListItem({ item, selected, onSelect }: RedemptionListItemProps) {
  return (
    <button
      type="button"
      className={[styles.redemptionItem, selected ? styles.redemptionItemSelected : '']
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
    >
      <div className={styles.redemptionHead}>
        <div>
          <h3 className={styles.redemptionTitle}>{item.prize_name}</h3>
          <code className={styles.redemptionCode}>{item.redemption_code}</code>
        </div>
        <div className={styles.badges}>
          <span className={[styles.badge, getStatusBadgeClass(item.prize_redemption_status)].join(' ')}>
            {statusLabels[item.prize_redemption_status]}
          </span>
        </div>
      </div>

      <div className={styles.metaGrid}>
        <div>
          <span className={styles.metaLabel}>Создана</span>
          <strong className={styles.metaValue}>{formatRedemptionDateTime(item.created_at)}</strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Списано</span>
          <strong className={styles.metaValue}>{item.points_spent} ✦</strong>
        </div>
        <div>
          <span className={styles.metaLabel}>VK</span>
          <strong className={styles.metaValue}>
            {item.vk_user_id != null ? `id${item.vk_user_id}` : '—'}
          </strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Заявка</span>
          <strong className={styles.metaValue}>#{item.prize_redemptions_id}</strong>
        </div>
      </div>
    </button>
  );
}

interface RedemptionDetailProps {
  item: AdminPrizeRedemption;
  acting: boolean;
  operatorComment: string;
  cancelReason: string;
  showCancelForm: boolean;
  onOperatorCommentChange: (value: string) => void;
  onCancelReasonChange: (value: string) => void;
  onToggleCancelForm: () => void;
  onFulfill: () => void;
  onCancel: () => void;
}

function RedemptionDetail({
  item,
  acting,
  operatorComment,
  cancelReason,
  showCancelForm,
  onOperatorCommentChange,
  onCancelReasonChange,
  onToggleCancelForm,
  onFulfill,
  onCancel,
}: RedemptionDetailProps) {
  const isReserved = item.prize_redemption_status === 'reserved';

  return (
    <div className={styles.detailBody}>
      <code className={styles.detailCode}>{item.redemption_code}</code>

      <div className={styles.badges}>
        <span className={[styles.badge, getStatusBadgeClass(item.prize_redemption_status)].join(' ')}>
          {statusLabels[item.prize_redemption_status]}
        </span>
        <span className={styles.badge}>{formatReceiveType(item.receive_type)}</span>
      </div>

      <div className={styles.metaGrid}>
        <div>
          <span className={styles.metaLabel}>Приз</span>
          <strong className={styles.metaValue}>{item.prize_name}</strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Списано</span>
          <strong className={styles.metaValue}>{item.points_spent} ✦</strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Пользователь VK</span>
          <strong className={styles.metaValue}>
            {item.vk_user_id != null ? (
              <a
                className={styles.metaValueLink}
                href={buildVkUserUrl(item.vk_user_id)}
                target="_blank"
                rel="noreferrer"
              >
                id{item.vk_user_id}
              </a>
            ) : (
              `users_id ${item.users_id}`
            )}
          </strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Заявка</span>
          <strong className={styles.metaValue}>#{item.prize_redemptions_id}</strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Создана</span>
          <strong className={styles.metaValue}>{formatRedemptionDateTime(item.created_at)}</strong>
        </div>
        <div>
          <span className={styles.metaLabel}>Выдана</span>
          <strong className={styles.metaValue}>{formatRedemptionDateTime(item.issued_at)}</strong>
        </div>
      </div>

      {item.comment && (
        <div>
          <span className={styles.metaLabel}>Комментарий пользователя</span>
          <p className={styles.hint}>{item.comment}</p>
        </div>
      )}

      {item.cancel_reason && (
        <div>
          <span className={styles.metaLabel}>Причина отмены</span>
          <p className={styles.hint}>{item.cancel_reason}</p>
        </div>
      )}

      {isReserved ? (
        <>
          <p className={styles.notice}>
            Перед выдачей сверьте код с экраном пользователя в VK. После «Выдано» изменить статус
            нельзя.
          </p>

          <div className={styles.operatorForm}>
            <Field label="Комментарий оператора (необязательно)">
              <Textarea
                value={operatorComment}
                onChange={(event) => onOperatorCommentChange(event.target.value)}
                rows={2}
                placeholder="Например: выдан размер M"
              />
            </Field>
          </div>

          <div className={styles.detailActions}>
            <Button variant="primary" loading={acting} onClick={onFulfill}>
              Выдано
            </Button>
            <Button variant="ghost" disabled={acting} onClick={onToggleCancelForm}>
              {showCancelForm ? 'Скрыть отмену' : 'Отменить заявку'}
            </Button>
          </div>

          {showCancelForm && (
            <div className={styles.operatorForm}>
              <Field label="Причина отмены" required>
                <Textarea
                  value={cancelReason}
                  onChange={(event) => onCancelReasonChange(event.target.value)}
                  rows={3}
                  placeholder="Например: пользователь не пришёл на пункт выдачи"
                />
              </Field>
              <Button
                variant="danger"
                loading={acting}
                disabled={!cancelReason.trim()}
                onClick={onCancel}
              >
                Подтвердить отмену и вернуть ✦
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className={styles.hint}>
          Действия доступны только для заявок в статусе «ожидает выдачи». Текущий статус:{' '}
          {statusLabels[item.prize_redemption_status].toLowerCase()}.
        </p>
      )}
    </div>
  );
}

function getStatusBadgeClass(status: PrizeRedemptionStatus): string {
  if (status === 'reserved') {
    return styles.badgeReserved;
  }
  if (status === 'issued') {
    return styles.badgeIssued;
  }
  return styles.badgeCanceled;
}
