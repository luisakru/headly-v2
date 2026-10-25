import { fireEvent, screen, waitFor } from '@testing-library/react';
import { getActiveAttack, listAttacks, startAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { listIntakes, logIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
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

  fireEvent.click(screen.getByRole('radio', { name: '6' }));
  await waitFor(async () => expect((await getActiveAttack())?.painAtStart).toBe(6));
  fireEvent.click(screen.getByRole('radio', { name: '8' }));
  await waitFor(async () => expect((await getActiveAttack())?.painMax).toBe(8));
  fireEvent.click(screen.getByRole('radio', { name: '7' }));
  await waitFor(async () => expect((await getActiveAttack())?.painMax).toBe(7));
  expect((await getActiveAttack())?.painAtStart).toBe(6);

  fireEvent.click(await screen.findByRole('button', { name: 'Log medication' }));
  fireEvent.click(await screen.findByRole('button', { name: /Sumatriptan/ }));
  await waitFor(async () => expect(await listIntakes()).toHaveLength(1));
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));

  const [intake] = await listIntakes();
  expect(intake).toMatchObject({ medicationId: medication.id, attackId: expect.any(String) });
  expect(await screen.findByRole('button', { name: 'Effect pending' })).toBeInTheDocument();

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
