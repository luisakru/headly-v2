import { differenceInCalendarDays } from 'date-fns';
import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  DocumentIcon,
  DownloadIcon,
  InfoIcon,
  LockIcon,
  MedicationIcon,
  PreventionIcon,
  TrashIcon,
  UploadIcon,
} from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { parseBackup, type Backup, type BackupError } from '../../data/backup';
import { exportBackup } from '../../data/backupFile';
import { DomainError } from '../../data/db';
import { updateSettings } from '../../data/settingsRepository';
import { isActivePrevention } from '../../domain/prevention';
import type { Language } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { useHomeData, useNow, useSettings } from '../home/useHomeData';
import { DeleteAllSheet } from './DeleteAllSheet';
import { ImportSheet } from './ImportSheet';
import { MedicationsSheet } from './MedicationsSheet';
import { PreventionsSheet } from './PreventionsSheet';
import styles from './Profile.module.css';
import { ProfileRow } from './ProfileRow';

const LANGUAGES: Language[] = ['de', 'en'];

type OpenSheet = 'medications' | 'preventions' | 'deleteAll';

export function ProfileScreen() {
  const { t, language, setLanguage } = useI18n();
  const data = useHomeData();
  const settings = useSettings();
  const now = useNow();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [openSheet, setOpenSheet] = useState<OpenSheet>();
  const [importResult, setImportResult] = useState<Backup | BackupError>();

  if (!data || !settings) return null;
  const { attacks, intakes, medications, preventions } = data;

  const activeMedications = medications.filter((medication) => !medication.archived);
  const activePreventions = preventions.filter((prevention) => isActivePrevention(prevention, now));
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
      <ScreenTitle>{t.profile.title}</ScreenTitle>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.medications}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<MedicationIcon />}
            title={t.profile.manageMedications}
            subtitle={t.profile.medicationCount(activeMedications.length)}
            onClick={() => setOpenSheet('medications')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.preventions}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<PreventionIcon />}
            title={t.profile.managePreventions}
            subtitle={t.profile.preventionCount(preventions.length, activePreventions.length)}
            onClick={() => setOpenSheet('preventions')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.data}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<DownloadIcon />}
            title={t.profile.exportData}
            subtitle={t.profile.lastBackup(daysSinceBackup)}
            onClick={() =>
              void exportBackup({ attacks, medications, medicationIntakes: intakes, preventions })
            }
          />
          <ProfileRow
            icon={<UploadIcon />}
            title={t.profile.importData}
            subtitle={t.profile.importHint}
            onClick={() => fileInput.current?.click()}
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
            onClick={() => setOpenSheet('deleteAll')}
          />
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => void readFile(event)}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.app}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<LockIcon />}
            title={t.profile.privacy}
            onClick={() => void navigate('/profile/privacy')}
          />
          <ProfileRow
            icon={<DocumentIcon />}
            title={t.profile.imprint}
            onClick={() => void navigate('/profile/imprint')}
          />
          <ProfileRow
            icon={<InfoIcon />}
            title={t.profile.about}
            onClick={() => void navigate('/profile/about')}
          />
          <div className={styles.languageRow}>
            <span className={styles.rowSubtitle}>{t.profile.language}</span>
            <SegmentedControl
              label={t.profile.language}
              options={LANGUAGES.map((value) => ({ value, label: t.languages[value] }))}
              value={language}
              onChange={(value) => void setLanguage(value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.comingSoon}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<DocumentIcon />}
            title={t.profile.pdfExport}
            subtitle={t.profile.pdfExportHint}
            soon
          />
          <ProfileRow
            icon={<BellIcon />}
            title={t.profile.notifications}
            subtitle={t.profile.notificationsHint}
            soon
          />
        </div>
      </section>

      {openSheet === 'medications' && (
        <MedicationsSheet medications={medications} onClose={() => setOpenSheet(undefined)} />
      )}
      {openSheet === 'preventions' && (
        <PreventionsSheet
          preventions={preventions}
          now={now}
          onClose={() => setOpenSheet(undefined)}
        />
      )}
      {openSheet === 'deleteAll' && <DeleteAllSheet onClose={() => setOpenSheet(undefined)} />}
      {importResult && (
        <ImportSheet result={importResult} onClose={() => setImportResult(undefined)} />
      )}
    </>
  );
}
