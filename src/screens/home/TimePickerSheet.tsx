import { format, parse } from 'date-fns';
import { useId, useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { DomainError } from '../../data/db';
import { useI18n } from '../../i18n/context';
import type { Dictionary } from '../../i18n/locales/en';
import styles from './Home.module.css';

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

type AttackErrors = Dictionary['errors']['attack'];

function errorMessage(error: unknown, messages: AttackErrors): string {
  if (error instanceof DomainError && error.code in messages) {
    return messages[error.code as keyof AttackErrors];
  }
  throw error;
}

type TimePickerSheetProps = {
  title: string;
  initialTime: number;
  onClose: () => void;
  /** Rejections with a DomainError are shown inside the sheet. */
  onConfirm: (time: number) => Promise<unknown>;
};

export function TimePickerSheet({ title, initialTime, onClose, onConfirm }: TimePickerSheetProps) {
  const { t } = useI18n();
  const inputId = useId();
  const [value, setValue] = useState(() => format(initialTime, INPUT_FORMAT));
  const [error, setError] = useState<string>();
  const time = parse(value, INPUT_FORMAT, new Date()).getTime();

  const confirm = async () => {
    try {
      await onConfirm(time);
      onClose();
    } catch (caught) {
      setError(errorMessage(caught, t.errors.attack));
    }
  };

  return (
    <BottomSheet open onClose={onClose} title={title}>
      <div className={styles.sheetContent}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          {t.timePicker.label}
        </label>
        <input
          id={inputId}
          type="datetime-local"
          className={styles.input}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(undefined);
          }}
        />
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <Button large disabled={Number.isNaN(time)} onClick={() => void confirm()}>
          {t.timePicker.save}
        </Button>
      </div>
    </BottomSheet>
  );
}
