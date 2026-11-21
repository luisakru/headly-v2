import { differenceInCalendarDays } from 'date-fns';
import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, DownloadIcon, InfoIcon, TrashIcon, UploadIcon } from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { parseBackup, type Backup, type BackupError } from '../../data/backup';
import { exportBackup } from '../../data/backupFile';
import { DomainError } from '../../data/db';
import { updateSettings } from '../../data/settingsRepository';
import { useI18n } from '../../i18n/context';
import { useHomeData, useNow, useSettings } from '../home/useHomeData';
import { DeleteAllSheet } from './DeleteAllSheet';
import { ImportSheet } from './ImportSheet';
import styles from './Profile.module.css';
import { BackToProfile } from './ProfilePages';
import { ProfileRow } from './ProfileRow';

/** Backup, restore and deleting everything, one level below Profile. */
export function DataPage() {
  const { t } = useI18n();
  const data = useHomeData();
  const settings = useSettings();
  const now = useNow();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [importResult, setImportResult] = useState<Backup | BackupError>();
  const [exported, setExported] = useState(false);

  if (!data || !settings) return null;
  const daysSinceBackup =
    settings.lastBackupAt === undefined
      ? undefined
      : differenceInCalendarDays(now, settings.lastBackupAt);

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again fires another change.
    event.target.value = '';
    if (!file) return;
    try {
      setImportResult(parseBackup(await file.text()));
    } catch (error) {
      if (!(error instanceof DomainError)) throw error;
      setImportResult(error.code as BackupError);
    }
  };

  return (
    <>
      <BackToProfile />
      <ScreenTitle>{t.profile.backupAndRestore}</ScreenTitle>
      <section className={styles.section}>
        <div className={styles.card}>
          <ProfileRow
            icon={<DownloadIcon />}
            title={t.profile.exportData}
            subtitle={exported ? t.profile.exported : t.profile.lastBackup(daysSinceBackup)}
            onClick={() =>
              void exportBackup({
                attacks: data.attacks,
                medications: data.medications,
                medicationIntakes: data.intakes,
                preventions: data.preventions,
                lifeEvents: data.lifeEvents,
                dayEventTypes: data.dayEventTypes,
                dayEvents: data.dayEvents,
                symptoms: data.symptoms,
              }).then(setExported)
            }
          />
          <ProfileRow
            icon={<UploadIcon />}
            title={t.profile.importData}
            subtitle={t.profile.importHint}
            onClick={() => fileInput.current?.click()}
          />
          <ProfileRow
            icon={<InfoIcon />}
            title={t.importGuide.title}
            subtitle={t.importGuide.rowHint}
            onClick={() => void navigate('/profile/import-guide')}
          />
          <ProfileRow
            icon={<BellIcon />}
            title={t.profile.backupReminder}
            subtitle={t.profile.backupReminderHint}
            checked={settings.backupReminderEnabled}
            onClick={() =>
              void updateSettings({ backupReminderEnabled: !settings.backupReminderEnabled })
            }
          />
          <ProfileRow
            icon={<TrashIcon />}
            title={t.profile.deleteAll}
            subtitle={t.profile.deleteAllHint}
            danger
            onClick={() => setDeleting(true)}
          />
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => void readFile(event)}
        />
        <p className={styles.muted}>{t.profile.removeAppHint}</p>
      </section>

      {deleting && <DeleteAllSheet onClose={() => setDeleting(false)} />}
      {importResult && (
        <ImportSheet result={importResult} onClose={() => setImportResult(undefined)} />
      )}
    </>
  );
}
