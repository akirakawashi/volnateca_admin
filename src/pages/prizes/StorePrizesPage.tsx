import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Field, Input, Select, Textarea } from '../../components/ui/Field/Field';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { usePrizes } from '../../hooks/usePrizes';
import {
  ADMIN_PRIZE_STATUSES,
  ADMIN_PRIZE_TYPES,
  type AdminPrize,
  type PrizeStatus,
  type PrizeType,
} from '../../types/prize';
import { formatReceiveType } from '../../utils/prizeReceiveType';
import { extractVkPhotoAttachment } from '../../utils/vkAttachments';
import { defaultPrizeFormValues, prizeFormSchema, type PrizeFormValues } from './schema';
import styles from './StorePrizesPage.module.css';

const prizeTypeLabels: Record<PrizeType, string> = {
  merch: 'Мерч',
  partner: 'Партнёрский приз',
  super_prize: 'Суперприз',
};

const statusLabels: Record<PrizeStatus, string> = {
  available: 'Доступен',
  sold_out: 'Разобрали',
  hidden: 'Скрыт',
};

const prizeTypeOptions = ADMIN_PRIZE_TYPES.map((type) => ({
  value: type,
  label: prizeTypeLabels[type],
}));

const statusOptions = ADMIN_PRIZE_STATUSES.map((status) => ({
  value: status,
  label: statusLabels[status],
}));

function formatQuantity(prize: AdminPrize): string {
  if (prize.quantity_total === null) {
    return `${prize.quantity_claimed} / —`;
  }
  return `${prize.quantity_claimed} / ${prize.quantity_total}`;
}

export function StorePrizesPage() {
  const { prizes, loading, creating, error, result, fetch, create, resetStatus } = usePrizes();
  const statusRef = useRef<HTMLDivElement>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeFormSchema),
    defaultValues: defaultPrizeFormValues,
  });

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useAutoStatusMessage({
    active: Boolean(result || error),
    scrollRef: statusRef,
    onDismiss: result ? resetStatus : undefined,
  });

  const selectedPrizeType = useWatch({
    control,
    name: 'prize_type',
  });

  useEffect(() => {
    if (selectedPrizeType === 'super_prize') {
      setValue('quantity_total', 1, { shouldValidate: true });
    }
  }, [selectedPrizeType, setValue]);
  const prizeStats = useMemo(() => {
    const items = prizes ?? [];
    return {
      total: items.length,
      active: items.filter((prize) => prize.is_active).length,
      withImages: items.filter((prize) => prize.image_attachment !== null).length,
    };
  }, [prizes]);

  const onSubmit = async (values: PrizeFormValues) => {
    const created = await create({
      prize_name: values.prize_name.trim(),
      description: values.description?.trim() || null,
      image_attachment: extractVkPhotoAttachment(values.image_attachment),
      prize_type: values.prize_type,
      receive_type: 'pickup',
      status: values.status,
      cost_points: values.cost_points,
      quantity_total: values.quantity_total,
      required_level: values.required_level ?? null,
      sort_order: values.sort_order,
      is_active: values.is_active,
    });

    if (created) {
      reset(defaultPrizeFormValues);
    }
  };

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Store inventory"
        title="Призы магазина"
        subtitle="Добавление мерча, партнёрских призов и суперпризов без промокодов"
        aside={
          <div className={styles.heroStats} aria-hidden="true">
            <div className={styles.metricCard}>
              <span>Всего призов</span>
              <strong>{prizeStats.total}</strong>
            </div>
            <div className={styles.metricCard}>
              <span>Активных</span>
              <strong>{prizeStats.active}</strong>
            </div>
            <div className={styles.metricCard}>
              <span>С картинкой</span>
              <strong>{prizeStats.withImages}</strong>
            </div>
          </div>
        }
      />

      {(result || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {result && (
            <Alert variant="success">
              Приз <strong>{result.prize_name}</strong> создан — code: {result.code}
            </Alert>
          )}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}

      <div className={styles.layout}>
        <Card title="Создать приз" className={styles.formCard}>
          <form
            onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
            onFocus={resetStatus}
            noValidate
            className={styles.form}
          >
            <Field label="Тип приза" required error={errors.prize_type?.message}>
              <Controller
                control={control}
                name="prize_type"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={prizeTypeOptions}
                  />
                )}
              />
            </Field>

            <div className={styles.row2}>
              <Field label="Статус" required error={errors.status?.message}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      options={statusOptions}
                    />
                  )}
                />
              </Field>
              <Field label="Стоимость, ✦" required error={errors.cost_points?.message}>
                <Input
                  {...register('cost_points', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="320"
                />
              </Field>
            </div>

            <Field label="Название приза" required error={errors.prize_name?.message}>
              <Input {...register('prize_name')} placeholder="Футболка Волнатеки" />
            </Field>

            <Field label="Описание">
              <Textarea
                {...register('description')}
                rows={3}
                placeholder="Краткое описание приза для карточки магазина..."
              />
            </Field>

            <Field
              label="Картинка VK attachment"
              error={errors.image_attachment?.message}
              hint="Например: photo-123_456. Можно вставить и полную строку, если в ней есть attachment."
            >
              <Input {...register('image_attachment')} placeholder="photo-123_456" />
            </Field>

            <div className={styles.row3}>
              <Field
                label="Количество"
                required
                error={errors.quantity_total?.message}
                hint={
                  selectedPrizeType === 'super_prize'
                    ? 'Суперприз — одна единица на всех.'
                    : 'Все призы лимитированы. Укажите общий остаток.'
                }
              >
                <Input
                  {...register('quantity_total', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder={selectedPrizeType === 'super_prize' ? '1' : '10'}
                />
              </Field>
              <Field label="Мин. уровень" error={errors.required_level?.message}>
                <Input
                  {...register('required_level', {
                    setValueAs: (value: string) => (value === '' ? null : Number.parseInt(value, 10)),
                  })}
                  type="number"
                  min={1}
                  max={4}
                  placeholder="Без ограничения"
                />
              </Field>
              <Field label="Sort order" error={errors.sort_order?.message}>
                <Input
                  {...register('sort_order', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="0"
                />
              </Field>
            </div>

            <Field label="Публикация">
              <label className={styles.toggle}>
                <input {...register('is_active')} type="checkbox" className={styles.toggleInput} />
                <span className={styles.toggleText}>Показывать приз в магазине</span>
              </label>
            </Field>

            <div className={styles.helperBox}>
              <strong>{prizeTypeLabels[selectedPrizeType]}</strong>
              <span>
                Выдача только на пункте самовывоза. Промокоды в этом экране не поддерживаются —
                укажите картинку VK и лимит количества.
              </span>
            </div>

            <div className={styles.formActions}>
              <Button type="submit" variant="primary" loading={creating}>
                Создать приз
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title="Список призов"
          className={styles.listCard}
          action={
            <Button variant="ghost" size="sm" loading={loading} onClick={() => void fetch()}>
              Обновить
            </Button>
          }
        >
          {loading && prizes === null && <p className={styles.empty}>Загрузка списка призов…</p>}

          {!loading && prizes?.length === 0 && (
            <p className={styles.empty}>Призов пока нет. Создай первый приз из формы слева.</p>
          )}

          {prizes && prizes.length > 0 && (
            <div className={styles.list}>
              {prizes.map((prize) => (
                <article key={prize.prizes_id} className={styles.prizeItem}>
                  <div className={styles.prizeHead}>
                    <div className={styles.prizeHeadText}>
                      <h3 className={styles.prizeTitle}>{prize.prize_name}</h3>
                      <code className={styles.prizeCode}>{prize.code}</code>
                    </div>
                    <div className={styles.prizeHeadActions}>
                      <Link
                        className={styles.redemptionsLink}
                        to={`/store/redemptions?status=reserved&prizes_id=${prize.prizes_id}`}
                      >
                        Заявки на выдачу
                      </Link>
                    <div className={styles.badges}>
                      <span className={[styles.badge, styles.badgeType].join(' ')}>
                        {prizeTypeLabels[prize.prize_type]}
                      </span>
                      <span className={[styles.badge, getStatusBadgeClass(prize.status, styles)].join(' ')}>
                        {statusLabels[prize.status]}
                      </span>
                      <span
                        className={[
                          styles.badge,
                          prize.is_active ? styles.badgeActive : styles.badgeInactive,
                        ].join(' ')}
                      >
                        {prize.is_active ? 'Активен' : 'Выключен'}
                      </span>
                    </div>
                    </div>
                  </div>

                  {prize.description && <p className={styles.prizeDescription}>{prize.description}</p>}

                  <div className={styles.metaGrid}>
                    <div>
                      <span className={styles.metaLabel}>Стоимость</span>
                      <strong className={styles.metaValue}>{prize.cost_points} ✦</strong>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Способ получения</span>
                      <strong className={styles.metaValue}>{formatReceiveType(prize.receive_type)}</strong>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Количество</span>
                      <strong className={styles.metaValue}>{formatQuantity(prize)}</strong>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Мин. уровень</span>
                      <strong className={styles.metaValue}>
                        {prize.required_level === null ? 'Без ограничения' : prize.required_level}
                      </strong>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Sort order</span>
                      <strong className={styles.metaValue}>{prize.sort_order}</strong>
                    </div>
                    <div>
                      <span className={styles.metaLabel}>Картинка</span>
                      <strong className={styles.metaValue}>
                        {prize.image_attachment ?? 'Не указана'}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: PrizeStatus, stylesMap: Record<string, string>): string {
  if (status === 'available') {
    return stylesMap.badgeAvailable;
  }
  if (status === 'sold_out') {
    return stylesMap.badgeSoldOut;
  }
  return stylesMap.badgeHidden;
}
