import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { importBackup, type Backup, type BackupError, type ImportSummary } from '../../data/backup';
import { useI18n } from '../../i18n/context';
import styles from './Profile.module.css';

type ImportSheetProps = {
  /** The parsed file, or why it could not be read. */
  result: Backup | BackupError;
  onClose: () => void;
};

export function ImportSheet({ result, onClose }: ImportSheetProps) {
  const { t } = useI18n();
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  const [summary, setSummary] = useState<ImportSummary>();

  const doneButton = <Button onClick={onClose}>{t.backup.done}</Button>;

  if (typeof result === 'string') {
    return (
      <BottomSheet open onClose={onClose} title={t.backup.importTitle}>
        <div className={styles.sheetContent}>
          <p role="alert" className={styles.error}>
            {t.backup.errors[result]}
          </p>
          {doneButton}
        </div>
      </BottomSheet>
    );
  }

  const { attacks, medications, medicationIntakes, preventions, lifeEvents } = result.data;
  const run = async (mode: 'merge' | 'replace') => setSummary(await importBackup(result, mode));

  return (
    <BottomSheet open onClose={onClose} title={t.backup.importTitle}>
      <div className={styles.sheetContent}>
        {summary ? (
          <>
            <p role="status" className={styles.text}>
              {t.backup.imported(t.backup.counts(summary))}
            </p>
            {doneButton}
          </>
        ) : (
          <>
            <p className={styles.text}>
              {t.backup.fileContains(
                t.backup.counts({
                  attacks: attacks.length,
                  medications: medications.length,
                  medicationIntakes: medicationIntakes.length,
                  preventions: preventions.length,
                  lifeEvents: lifeEvents.length,
                }),
              )}
            </p>
            <p className={styles.muted}>{t.backup.mergeHint}</p>
            <Button large onClick={() => void run('merge')}>
              {t.backup.merge}
            </Button>
            <p className={styles.muted}>{t.backup.replaceHint}</p>
            <Button
              variant="outline"
              className={styles.deleteButton}
              onClick={() => (confirmingReplace ? void run('replace') : setConfirmingReplace(true))}
            >
              {confirmingReplace ? t.backup.confirmReplace : t.backup.replace}
            </Button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
