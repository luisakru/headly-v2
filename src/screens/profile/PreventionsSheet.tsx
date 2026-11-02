import { parseISO } from 'date-fns';
import { useId, useState, type FormEvent } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { PlusIcon } from '../../components/icons';
import { SegmentedControl } from '../../components/SegmentedControl';
import {
  createPrevention,
  deletePrevention,
  updatePrevention,
} from '../../data/preventionRepository';
import { toDayKey } from '../../domain/days';
import { isActivePrevention, validatePrevention } from '../../domain/prevention';
import type { Prevention, PreventionType } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { formatDateShort } from '../../i18n/format';
import styles from './Profile.module.css';

const PREVENTION_TYPES: PreventionType[] = ['medication', 'lifestyle'];

type PreventionsSheetProps = {
  preventions: Prevention[];
  now: number;
  onClose: () => void;
};

export function PreventionsSheet({ preventions, now, onClose }: PreventionsSheetProps) {
  const { t, language } = useI18n();
  // Undefined = list, null = new prevention.
  const [editing, setEditing] = useState<Prevention | null>();
  const sorted = [...preventions].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const active = sorted.filter((prevention) => isActivePrevention(prevention, now));
  const past = sorted.filter((prevention) => !isActivePrevention(prevention, now));

  const title =
    editing === undefined
      ? t.profile.managePreventions
      : editing
        ? t.profile.editPrevention
        : t.profile.newPrevention;

  const formatDay = (day: string) => formatDateShort(parseISO(day).getTime(), language);
  const period = (prevention: Prevention, isActive: boolean) => {
    const range = prevention.endDate
      ? `${formatDay(prevention.startDate)} – ${formatDay(prevention.endDate)}`
      : t.profile.since(formatDay(prevention.startDate));
    return isActive ? `${range} · ${t.profile.active}` : range;
  };

  const renderGroup = (label: string, list: Prevention[], isActive: boolean) =>
    list.length > 0 && (
      <>
        <h3 className={styles.groupLabel}>{label}</h3>
        <ul className={styles.list}>
          {list.map((prevention) => (
            <li key={prevention.id}>
              <button
                type="button"
                className={styles.itemRow}
                onClick={() => setEditing(prevention)}
              >
                <span className={styles.dot} data-active={isActive} />
                <span className={styles.rowText}>
                  <span className={styles.itemName}>
                    {[prevention.name, prevention.dose].filter(Boolean).join(' ')}
                  </span>
                  <span className={styles.itemMeta}>{period(prevention, isActive)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );

  return (
    <BottomSheet open onClose={onClose} title={title}>
      {editing === undefined ? (
        <div className={styles.sheetContent}>
          {renderGroup(t.profile.activePreventions, active, true)}
          {renderGroup(t.profile.pastPreventions, past, false)}
          <button type="button" className={styles.textButton} onClick={() => setEditing(null)}>
            <PlusIcon />
            {t.profile.newPrevention}
          </button>
        </div>
      ) : (
        <PreventionForm
          prevention={editing ?? undefined}
          now={now}
          onDone={() => setEditing(undefined)}
        />
      )}
    </BottomSheet>
  );
}

type PreventionFormProps = {
  prevention?: Prevention;
  now: number;
  onDone: () => void;
};

function PreventionForm({ prevention, now, onDone }: PreventionFormProps) {
  const { t } = useI18n();
  const nameId = useId();
  const doseId = useId();
  const startId = useId();
  const effectiveId = useId();
  const endId = useId();
  const [name, setName] = useState(prevention?.name ?? '');
  const [type, setType] = useState<PreventionType>(prevention?.type ?? 'medication');
  const [dose, setDose] = useState(prevention?.dose ?? '');
  const [startDate, setStartDate] = useState(prevention?.startDate ?? toDayKey(now));
  const [effectiveFrom, setEffectiveFrom] = useState(prevention?.effectiveFrom ?? '');
  const [endDate, setEndDate] = useState(prevention?.endDate ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const error = validatePrevention({
    startDate,
    effectiveFrom: effectiveFrom || undefined,
    endDate: endDate || undefined,
  });

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const fields = {
      name: name.trim(),
      type,
      dose: dose.trim() || undefined,
      startDate,
      effectiveFrom: effectiveFrom || undefined,
      endDate: endDate || undefined,
    };
    if (prevention) await updatePrevention(prevention.id, fields);
    else await createPrevention(fields);
    onDone();
  };

  return (
    <form className={styles.form} onSubmit={(event) => void save(event)}>
      <label htmlFor={nameId} className={styles.fieldLabel}>
        {t.profile.name}
      </label>
      <input
        id={nameId}
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
      />
      <span className={styles.fieldLabel}>{t.profile.preventionType}</span>
      <SegmentedControl
        label={t.profile.preventionType}
        options={PREVENTION_TYPES.map((value) => ({
          value,
          label: t.profile.preventionTypes[value],
        }))}
        value={type}
        onChange={setType}
      />
      <label htmlFor={doseId} className={styles.fieldLabel}>
        {t.profile.dose}
      </label>
      <input
        id={doseId}
        className={styles.input}
        value={dose}
        onChange={(event) => setDose(event.target.value)}
        autoComplete="off"
      />
      <label htmlFor={startId} className={styles.fieldLabel}>
        {t.profile.startDate}
      </label>
      <input
        id={startId}
        type="date"
        className={styles.input}
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
      />
      <label htmlFor={effectiveId} className={styles.fieldLabel}>
        {t.profile.effectiveFrom}
      </label>
      <p className={styles.fieldHint}>{t.profile.effectiveFromHint}</p>
      <input
        id={effectiveId}
        type="date"
        className={styles.input}
        value={effectiveFrom}
        min={startDate}
        onChange={(event) => setEffectiveFrom(event.target.value)}
      />
      <label htmlFor={endId} className={styles.fieldLabel}>
        {t.profile.endDate}
      </label>
      <input
        id={endId}
        type="date"
        className={styles.input}
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
      />
      {error && (
        <p role="alert" className={styles.error}>
          {t.errors.prevention[error]}
        </p>
      )}
      <div className={styles.buttonRow}>
        <Button variant="outline" onClick={onDone}>
          {t.profile.cancel}
        </Button>
        <Button type="submit" disabled={name.trim() === '' || startDate === '' || !!error}>
          {t.profile.save}
        </Button>
      </div>
      {prevention && (
        <Button
          variant="outline"
          className={styles.deleteButton}
          onClick={() =>
            confirmingDelete
              ? void deletePrevention(prevention.id).then(onDone)
              : setConfirmingDelete(true)
          }
        >
          {confirmingDelete ? t.profile.confirmDelete : t.profile.delete}
        </Button>
      )}
    </form>
  );
}
