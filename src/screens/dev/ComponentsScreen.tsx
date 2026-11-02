import { useState, type ReactNode } from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PainScale } from '../../components/PainScale';
import { ScreenTitle } from '../../components/ScreenTitle';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ToggleChip } from '../../components/ToggleChip';
import type { DateRangePreset } from '../../domain/dateRange';
import type { Language } from '../../domain/types';
import { useI18n } from '../../i18n/context';
import styles from './ComponentsScreen.module.css';

const RANGE_PRESETS: DateRangePreset[] = ['1W', '1M', '3M', '6M', '1Y', '2Y', 'all'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/** Hidden page at /dev/components that shows every shared component. */
export function ComponentsScreen() {
  const { t, language, setLanguage } = useI18n();
  const [painLevel, setPainLevel] = useState<number>();
  const [range, setRange] = useState<DateRangePreset>('3M');
  const [showMigraine, setShowMigraine] = useState(true);
  const [showMedication, setShowMedication] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <ScreenTitle>{t.dev.title}</ScreenTitle>

      <Section title={t.profile.language}>
        <SegmentedControl<Language>
          label={t.profile.language}
          options={[
            { value: 'de', label: t.languages.de },
            { value: 'en', label: t.languages.en },
          ]}
          value={language}
          onChange={(value) => void setLanguage(value)}
        />
      </Section>

      <Section title={t.dev.buttons}>
        <Button large>{t.home.startMigraine}</Button>
        <Button variant="secondary">{t.activeAttack.logMedication}</Button>
        <Button variant="outline">{t.activeAttack.logMedication}</Button>
        <Button disabled>{t.home.startMigraine}</Button>
      </Section>

      <Section title={t.dev.card}>
        <Card>{t.dev.cardText}</Card>
      </Section>

      <Section title={t.dev.painScale}>
        <PainScale value={painLevel} onChange={setPainLevel} />
      </Section>

      <Section title={t.dev.segmentedControl}>
        <SegmentedControl
          label={t.stats.range.label}
          options={RANGE_PRESETS.map((preset) => ({ value: preset, label: t.stats.range[preset] }))}
          value={range}
          onChange={setRange}
        />
      </Section>

      <Section title={t.dev.toggleChips}>
        <div className={styles.row}>
          <ToggleChip
            label={t.stats.series.migraine}
            pressed={showMigraine}
            onChange={setShowMigraine}
            swatchColor="var(--color-primary-soft)"
          />
          <ToggleChip
            label={t.stats.series.medication}
            pressed={showMedication}
            onChange={setShowMedication}
            swatchColor="var(--color-primary)"
          />
        </div>
      </Section>

      <Section title={t.dev.bottomSheet}>
        <Button variant="outline" onClick={() => setSheetOpen(true)}>
          {t.dev.openSheet}
        </Button>
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t.painScale.question}
        >
          <div className={styles.sheetContent}>
            <PainScale value={painLevel} onChange={setPainLevel} />
            <Button large disabled={!painLevel} onClick={() => setSheetOpen(false)}>
              {t.home.startMigraine}
            </Button>
          </div>
        </BottomSheet>
      </Section>
    </>
  );
}
