import { fireEvent, screen, waitFor } from '@testing-library/react';
import { getActiveAttack, listAttacks, startAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { listIntakes, logIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
import { getSettings } from '../../data/settingsRepository';
import { renderWithI18n } from '../../test/renderWithI18n';
import { HomeScreen } from './HomeScreen';

const HOUR_MS = 60 * 60 * 1000;

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  localStorage.clear();
});

test('logs a full attack: start, pain, medication, end', async () => {
  const medication = await createMedication({
    name: 'Sumatriptan',
    dose: '50 mg',
    isTriptan: true,
  });
  await renderWithI18n(<HomeScreen />);

  fireEvent.click(await screen.findByRole('button', { name: 'Start migraine' }));
  expect(await screen.findByText('Migraine active')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /^Pain/ }));
  fireEvent.click(await screen.findByRole('radio', { name: '6' }));
  await waitFor(async () => expect((await getActiveAttack())?.painLevel).toBe(6));
  fireEvent.click(await screen.findByRole('button', { name: /^Pain\s*6/ }));
  fireEvent.click(await screen.findByRole('radio', { name: '0' }));
  await waitFor(async () => expect((await getActiveAttack())?.painLevel).toBe(0));

  fireEvent.click(await screen.findByRole('button', { name: 'Log medication' }));
  fireEvent.click(await screen.findByRole('button', { name: /Sumatriptan/ }));
  await waitFor(async () => expect(await listIntakes()).toHaveLength(1));
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));

  const [intake] = await listIntakes();
  expect(intake).toMatchObject({ medicationId: medication.id, attackId: expect.any(String) });
  expect(await screen.findByRole('button', { name: /Effect pending/ })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'End migraine' }));
  expect(await screen.findByRole('button', { name: 'Start migraine' })).toBeInTheDocument();
  expect((await listAttacks())[0]?.endedAt).toBeDefined();
});

test('tapping a logged medication again undoes the intake', async () => {
  await createMedication({ name: 'Ibuprofen', isTriptan: false });
  await startAttack();
  await renderWithI18n(<HomeScreen />);

  fireEvent.click(await screen.findByRole('button', { name: 'Log medication' }));
  const row = await screen.findByRole('button', { name: /Ibuprofen/ });
  fireEvent.click(row);
  await waitFor(() => expect(row).toHaveAttribute('aria-pressed', 'true'));
  fireEvent.click(row);
  await waitFor(() => expect(row).toHaveAttribute('aria-pressed', 'false'));
  expect(await listIntakes()).toHaveLength(0);
});

test('asks to rate an intake older than two hours', async () => {
  const medication = await createMedication({ name: 'Ibuprofen', isTriptan: false });
  const intake = await logIntake(medication.id, { takenAt: Date.now() - 3 * HOUR_MS });
  await renderWithI18n(<HomeScreen />);

  expect(await screen.findByText('Did Ibuprofen help?')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'Slightly improved' }));
  await waitFor(async () =>
    expect((await db.medicationIntakes.get(intake.id))?.effectiveness).toBe('slight'),
  );
  await waitFor(() => expect(screen.queryByText('Did Ibuprofen help?')).not.toBeInTheDocument());
});

test('deletes the active attack after confirmation', async () => {
  await startAttack();
  await renderWithI18n(<HomeScreen />);

  fireEvent.click(await screen.findByRole('button', { name: 'More actions' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Delete migraine' }));
  expect(await listAttacks()).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Really delete?' }));

  expect(await screen.findByRole('button', { name: 'Start migraine' })).toBeInTheDocument();
  expect(await listAttacks()).toHaveLength(0);
});

test('reminds to back up once there is enough data, and snoozes on later', async () => {
  for (const name of ['A', 'B', 'C', 'D', 'E']) {
    await createMedication({ name, isTriptan: false });
  }
  await renderWithI18n(<HomeScreen />);

  expect(await screen.findByText('Your data is stored only on this device.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Later' }));

  await waitFor(() =>
    expect(screen.queryByText(/stored only on this device/)).not.toBeInTheDocument(),
  );
  expect((await getSettings()).backupReminderSnoozedUntil).toBeGreaterThan(Date.now());
});

test('ticks symptoms of the active attack', async () => {
  await startAttack();
  await renderWithI18n(<HomeScreen />);

  fireEvent.click(await screen.findByRole('button', { name: /^Symptoms/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Aura' }));
  await waitFor(async () => expect((await getActiveAttack())?.symptomIds).toEqual(['aura']));
  expect(screen.queryByRole('button', { name: 'Sensitive to noise' })).not.toBeInTheDocument();
});

test('shows when a medication with a minimum gap may be taken again', async () => {
  const medication = await createMedication({
    name: 'Sumatriptan',
    isTriptan: true,
    minIntervalHours: 2,
  });
  const attack = await startAttack(Date.now() - 2 * HOUR_MS);
  await logIntake(medication.id, { takenAt: Date.now() - HOUR_MS, attackId: attack.id });
  await renderWithI18n(<HomeScreen />);

  expect(await screen.findByText(/next from/)).toBeInTheDocument();
});
