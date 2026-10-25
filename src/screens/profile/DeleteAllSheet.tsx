import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { deleteAllData } from '../../data/backup';
import { useI18n } from '../../i18n/context';
import styles from './Profile.module.css';

/** Opening the sheet is the first confirmation, the button's second tap the second. */
export function DeleteAllSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);

  return (
    <BottomSheet open onClose={onClose} title={t.backup.deleteAllTitle}>
      <div className={styles.sheetContent}>
        <p className={styles.text}>{t.backup.deleteAllText}</p>
        <Button
          variant="outline"
          className={styles.deleteButton}
          onClick={() => (confirming ? void deleteAllData().then(onClose) : setConfirming(true))}
        >
          {confirming ? t.backup.confirmDeleteAll : t.backup.deleteAll}
        </Button>
      </div>
    </BottomSheet>
  );
}
