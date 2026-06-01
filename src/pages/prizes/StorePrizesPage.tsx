import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  defaultPrizeFormValues,
  mapPrizeToEditFormValues,
  prizeEditFormSchema,
  prizeFormSchema,
  type PrizeEditFormValues,
  type PrizeFormValues,
} from './schema';
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

interface StorePrizeFormPanelProps {
  editingPrize: AdminPrize | null;
  creating: boolean;
  updating: boolean;
  onCancelEdit: () => void;
  onCreate: (values: PrizeFormValues) => Promise<void>;
  onUpdate: (prizesId: number, values: PrizeEditFormValues) => Promise<void>;
  onFocus: () => void;
}

function StorePrizeFormPanel({
  editingPrize,
  creating,
  updating,
  onCancelEdit,
  onCreate,
  onUpdate,
  onFocus,
}: StorePrizeFormPanelProps) {
  const isEditing = editingPrize !== null;
  const saving = isEditing ? updating : creating;

  const createForm = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeFormSchema),
    defaultValues: defaultPrizeFormValues,
  });

  const editForm = useForm<PrizeEditFormValues>({
    resolver: zodResolver(prizeEditFormSchema),
    defaultValues: mapPrizeToEditFormValues(editingPrize ?? {
      prize_name: '',
      description: null,
      image_attachment: null,
      status: 'available',
      cost_points: 60,
      quantity_total: 10,
      required_level: null,
      sort_order: 0,
      is_active: true,
    }),
  });

  useEffect(() => {
    if (editingPrize) {
      editForm.reset(mapPrizeToEditFormValues(editingPrize));
    } else {
      createForm.reset(defaultPrizeFormValues);
    }
  }, [editingPrize, createForm, editForm]);

  const selectedPrizeType = useWatch({
    control: createForm.control,
    name: 'prize_type',
    disabled: isEditing,
  });
  const editQuantityTotal = useWatch({
    control: editForm.control,
    name: 'quantity_total',
    disabled: !isEditing,
  });

  useEffect(() => {
    if (isEditing || selectedPrizeType !== 'super_prize') {
      return;
    }
    createForm.setValue('quantity_total', 1, { shouldValidate: true });
  }, [createForm, isEditing, selectedPrizeType]);

  const onSubmitCreate = createForm.handleSubmit(async (values) => {
    await onCreate(values);
    createForm.reset(defaultPrizeFormValues);
  });

  const onSubmitEdit = editForm.handleSubmit(async (values) => {
    if (!editingPrize) {
      return;
    }
    if (values.status === 'available' && values.quantity_total <= editingPrize.quantity_claimed) {
      editForm.setError('status', {
        type: 'manual',
        message: `Увеличьте количество выше ${editingPrize.quantity_claimed}, чтобы сделать приз доступным.`,
      });
      return;
    }
    await onUpdate(editingPrize.prizes_id, values);
  });

  if (isEditing && editingPrize) {
    const { register, control, formState: { errors } } = editForm;
    const editPrizeType = editingPrize.prize_type;
    const editQuantityTotalValue = typeof editQuantityTotal === 'number' ? editQuantityTotal : Number.NaN;
    const canSetAvailable = Number.isFinite(editQuantityTotalValue)
      && editQuantityTotalValue > editingPrize.quantity_claimed;
    const editStatusOptions = statusOptions.map((option) => {
      if (option.value !== 'available' || canSetAvailable) {
        return option;
      }
      return {
        ...option,
        disabled: true,
        disabledHint: `Увеличьте количество выше ${editingPrize.quantity_claimed}`,
      };
    });

    return (
      <Card title="Редактировать приз" className={styles.formCard}>
        <form onSubmit={onSubmitEdit} onFocus={onFocus} noValidate className={styles.form}>
          <div className={styles.editMeta}>
            <code className={styles.prizeCode}>{editingPrize.code}</code>
            <span className={styles.editMetaText}>
              Занято: {formatQuantity(editingPrize)} · тип: {prizeTypeLabels[editPrizeType]}
            </span>
          </div>

          <div className={styles.row2}>
            <Field
              label="Статус"
              required
              error={errors.status?.message}
              hint={
                canSetAvailable
                  ? undefined
                  : `Чтобы сделать доступным, увеличьте количество выше ${editingPrize.quantity_claimed}.`
              }
            >
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={editStatusOptions}
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
            hint="Например: photo-123_456"
          >
            <Input {...register('image_attachment')} placeholder="photo-123_456" />
          </Field>

          <div className={styles.row3}>
            <Field
              label="Количество"
              required
              error={errors.quantity_total?.message}
              hint={
                editPrizeType === 'super_prize'
                  ? 'Суперприз — не меньше уже выданных.'
                  : `Минимум ${editingPrize.quantity_claimed} (уже в резерве/выдано).`
              }
            >
              <Input
                {...register('quantity_total', { valueAsNumber: true })}
                type="number"
                min={editingPrize.quantity_claimed}
                placeholder="10"
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

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" size="sm" onClick={onCancelEdit}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Сохранить изменения
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  const { register, control, formState: { errors } } = createForm;

  return (
    <Card title="Создать приз" className={styles.formCard}>
      <form onSubmit={onSubmitCreate} onFocus={onFocus} noValidate className={styles.form}>
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
          <strong>{prizeTypeLabels[selectedPrizeType ?? 'merch']}</strong>
          <span>
            Выдача только на пункте самовывоза. Промокоды в этом экране не поддерживаются —
            укажите картинку VK и лимит количества.
          </span>
        </div>

        <div className={styles.formActions}>
          <Button type="submit" variant="primary" loading={saving}>
            Создать приз
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function StorePrizesPage() {
  const {
    prizes,
    loading,
    creating,
    updating,
    error,
    result,
    fetch,
    create,
    update,
    resetStatus,
  } = usePrizes();
  const [editingPrize, setEditingPrize] = useState<AdminPrize | null>(null);
  const [lastSaveAction, setLastSaveAction] = useState<'create' | 'update' | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useAutoStatusMessage({
    active: Boolean(result || error),
    scrollRef: statusRef,
    onDismiss: result ? resetStatus : undefined,
  });

  const prizeStats = useMemo(() => {
    const items = prizes ?? [];
    return {
      total: items.length,
      active: items.filter((prize) => prize.is_active).length,
      withImages: items.filter((prize) => prize.image_attachment !== null).length,
    };
  }, [prizes]);

  const buildUpdatePayload = (values: PrizeEditFormValues) => ({
    prize_name: values.prize_name.trim(),
    description: values.description?.trim() || null,
    image_attachment: extractVkPhotoAttachment(values.image_attachment),
    status: values.status,
    cost_points: values.cost_points,
    quantity_total: values.quantity_total,
    required_level: values.required_level ?? null,
    sort_order: values.sort_order,
    is_active: values.is_active,
  });

  const handleCreate = async (values: PrizeFormValues) => {
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
      setLastSaveAction('create');
      setEditingPrize(null);
    }
  };

  const handleUpdate = async (prizesId: number, values: PrizeEditFormValues) => {
    const updated = await update(prizesId, buildUpdatePayload(values));
    if (updated) {
      setLastSaveAction('update');
      setEditingPrize(null);
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
              Приз <strong>{result.prize_name}</strong>{' '}
              {lastSaveAction === 'update' ? 'обновлён' : 'создан'} — code: {result.code}
            </Alert>
          )}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}

      <div className={styles.layout}>
        <StorePrizeFormPanel
          editingPrize={editingPrize}
          creating={creating}
          updating={updating}
          onCancelEdit={() => setEditingPrize(null)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onFocus={resetStatus}
        />

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
                <article
                  key={prize.prizes_id}
                  className={[
                    styles.prizeItem,
                    editingPrize?.prizes_id === prize.prizes_id ? styles.prizeItemActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.prizeHead}>
                    <div className={styles.prizeHeadText}>
                      <h3 className={styles.prizeTitle}>{prize.prize_name}</h3>
                      <code className={styles.prizeCode}>{prize.code}</code>
                    </div>
                    <div className={styles.prizeHeadActions}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          resetStatus();
                          setEditingPrize(prize);
                        }}
                      >
                        Редактировать
                      </Button>
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
