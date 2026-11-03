import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { exportBackup } from '../../data/backupFile';
import { updateSettings } from '../../data/settingsRepository';
import { BACKUP_REMINDER_SNOOZE_MS } from '../../domain/constants';
import { shouldShowBackupReminder } from '../../domain/prompts';
import { useI18n } from '../../i18n/context';
import styles from './Home.module.css';
import { useSettings, type HomeData } from './useHomeData';

/** Only shown on the idle home screen, so never during an active attack. */
export function BackupReminderCard({ data, now }: { data: HomeData; now: number }) {
  const { t } = useI18n();
  const settings = useSettings();
  const { attacks, intakes, medications, preventions, lifeEvents } = data;
  const recordCount =
    attacks.length + intakes.length + medications.length + preventions.length + lifeEvents.length;
  if (!settings || !shouldShowBackupReminder(settings, recordCount, false, now)) return null;

  return (
    <Card className={styles.promptCard}>
      <p className={styles.promptTitle}>{t.backup.reminder}</p>
      <div className={styles.promptActions}>
        <Button
          onClick={() =>
            void exportBackup({
              attacks,
              medications,
              medicationIntakes: intakes,
              preventions,
              lifeEvents,
            })
          }
        >
          {t.backup.backUpNow}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            void updateSettings({
              backupReminderSnoozedUntil: Date.now() + BACKUP_REMINDER_SNOOZE_MS,
            })
          }
        >
          {t.backup.later}
        </Button>
      </div>
    </Card>
  );
}
