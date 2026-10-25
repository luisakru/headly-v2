import { useId, useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { useI18n } from '../../i18n/context';
import { errorMessage, fromInputValue, toInputValue } from './attackForm';
import styles from './Home.module.css';

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
  const [value, setValue] = useState(() => toInputValue(initialTime));
  const [error, setError] = useState<string>();
  const time = fromInputValue(value);

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
