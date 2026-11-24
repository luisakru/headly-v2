import { differenceInCalendarDays } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { version } from '../../../package.json';
import {
  BookIcon,
  DocumentIcon,
  DownloadIcon,
  HeadacheIcon,
  InfoIcon,
  LifeEventIcon,
  LockIcon,
  MedicationIcon,
  PreventionIcon,
} from '../../components/icons';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { updateSettings } from '../../data/settingsRepository';
import { isActivePrevention } from '../../domain/prevention';
import type { Language, Theme } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import { knowledgeArticles } from '../../i18n/knowledge';
import { useHomeData, useNow, useSettings } from '../home/useHomeData';
import { DayEventTypesSheet } from './DayEventTypesSheet';
import { LifeEventsSheet } from './LifeEventsSheet';
import { MedicationsSheet } from './MedicationsSheet';
import { PreventionsSheet } from './PreventionsSheet';
import styles from './Profile.module.css';
import { ProfileRow } from './ProfileRow';
import { SymptomsSheet } from './SymptomsSheet';

const LANGUAGES: Language[] = ['de', 'en'];
const SUPPORT_EMAIL = 'headly@bylu.app';
const THEMES: Theme[] = ['system', 'light', 'dark'];

type OpenSheet = 'medications' | 'symptoms' | 'preventions' | 'lifeEvents' | 'dayEventTypes';

export function ProfileScreen() {
  const { t, language, setLanguage } = useI18n();
  const data = useHomeData();
  const settings = useSettings();
  const now = useNow();
  const navigate = useNavigate();
  const [openSheet, setOpenSheet] = useState<OpenSheet>();

  if (!data || !settings) return null;
  const { medications, preventions, lifeEvents, dayEventTypes, dayEvents, symptoms } = data;

  const activeMedications = medications.filter((medication) => !medication.archived);
  const activePreventions = preventions.filter((prevention) => isActivePrevention(prevention, now));
  const daysSinceBackup =
    settings.lastBackupAt === undefined
      ? undefined
      : differenceInCalendarDays(now, settings.lastBackupAt);

  return (
    <>
      <ScreenTitle>{t.profile.title}</ScreenTitle>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.tracking}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<MedicationIcon />}
            title={t.profile.medications}
            subtitle={t.profile.medicationCount(activeMedications.length)}
            onClick={() => setOpenSheet('medications')}
          />
          <ProfileRow
            icon={<PreventionIcon />}
            title={t.profile.preventions}
            subtitle={t.profile.preventionCount(preventions.length, activePreventions.length)}
            onClick={() => setOpenSheet('preventions')}
          />
          <ProfileRow
            icon={<InfoIcon />}
            title={t.symptoms.title}
            subtitle={t.symptoms.count(symptoms.filter((symptom) => symptom.enabled).length)}
            onClick={() => setOpenSheet('symptoms')}
          />
          <ProfileRow
            icon={<HeadacheIcon />}
            title={t.profile.otherHeadaches}
            subtitle={t.profile.otherHeadachesHint}
            checked={settings.trackOtherHeadaches}
            onClick={() =>
              void updateSettings({ trackOtherHeadaches: !settings.trackOtherHeadaches })
            }
          />
          <ProfileRow
            icon={<LifeEventIcon />}
            title={t.dayEvents.title}
            subtitle={t.dayEvents.hint}
            onClick={() => setOpenSheet('dayEventTypes')}
          />
          <ProfileRow
            icon={<LifeEventIcon />}
            title={t.profile.manageLifeEvents}
            subtitle={t.profile.lifeEventsHint}
            onClick={() => setOpenSheet('lifeEvents')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.data}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<DocumentIcon />}
            title={t.profile.pdfExport}
            subtitle={t.profile.pdfExportHint}
            onClick={() => void navigate('/profile/report')}
          />
          <ProfileRow
            icon={<DownloadIcon />}
            title={t.profile.backupAndRestore}
            subtitle={t.profile.lastBackup(daysSinceBackup)}
            onClick={() => void navigate('/profile/data')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.help}</h2>
        <div className={styles.card}>
          <ProfileRow
            icon={<BookIcon />}
            title={t.knowledge.title}
            subtitle={t.knowledge.articleCount(knowledgeArticles[language].length)}
            onClick={() => void navigate('/profile/knowledge')}
          />
          <ProfileRow
            icon={<InfoIcon />}
            title={t.profile.intro}
            subtitle={t.profile.introHint}
            onClick={() => void navigate('/intro')}
          />
          <ProfileRow
            icon={<InfoIcon />}
            title={t.profile.feedback}
            subtitle={SUPPORT_EMAIL}
            onClick={() => {
              const subject = encodeURIComponent(t.profile.feedbackSubject(version));
              window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
            }}
          />
          <ProfileRow
            icon={<InfoIcon />}
            title={t.profile.about}
            onClick={() => void navigate('/profile/about')}
          />
          <ProfileRow
            icon={<LockIcon />}
            title={t.profile.privacy}
            onClick={() => void navigate('/profile/privacy')}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>{t.profile.display}</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <span className={styles.rowSubtitle}>{t.profile.language}</span>
            <SegmentedControl
              label={t.profile.language}
              options={LANGUAGES.map((value) => ({ value, label: t.languages[value] }))}
              value={language}
              onChange={(value) => void setLanguage(value)}
            />
          </div>
          <div className={styles.settingRow}>
            <span className={styles.rowSubtitle}>{t.profile.theme}</span>
            <SegmentedControl
              label={t.profile.theme}
              options={THEMES.map((value) => ({ value, label: t.themes[value] }))}
              value={settings.theme}
              onChange={(theme) => void updateSettings({ theme })}
            />
          </div>
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
      {openSheet === 'lifeEvents' && (
        <LifeEventsSheet
          lifeEvents={lifeEvents}
          now={now}
          onClose={() => setOpenSheet(undefined)}
        />
      )}
      {openSheet === 'dayEventTypes' && (
        <DayEventTypesSheet
          types={dayEventTypes}
          events={dayEvents}
          onClose={() => setOpenSheet(undefined)}
        />
      )}
      {openSheet === 'symptoms' && (
        <SymptomsSheet symptoms={symptoms} onClose={() => setOpenSheet(undefined)} />
      )}
    </>
  );
}
