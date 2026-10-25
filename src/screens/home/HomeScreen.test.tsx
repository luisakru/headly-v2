import { fireEvent, screen, waitFor } from '@testing-library/react';
import { getActiveAttack, listAttacks, startAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { listIntakes, logIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
import { formatDate } from '../../i18n/format';
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

test('tapping a day shows each attack in its own card with its medication', async () => {
  const day = new Date();
  day.setDate(day.getDate() - 1);
  const morning = day.setHours(8, 0, 0, 0);
  const evening = day.setHours(18, 0, 0, 0);
  const ibuprofen = await createMedication({ name: 'Ibuprofen', isTriptan: false });
  const sumatriptan = await createMedication({ name: 'Sumatriptan', isTriptan: true });
  const first = await startAttack(morning);
  await db.attacks.update(first.id, { endedAt: morning + 2 * HOUR_MS, painAtStart: 4, painMax: 6 });
  const second = await startAttack(evening);
  await db.attacks.update(second.id, { endedAt: evening + HOUR_MS, painAtStart: 7, painMax: 8 });
  await logIntake(ibuprofen.id, { takenAt: morning + HOUR_MS, attackId: first.id });
  await logIntake(sumatriptan.id, { takenAt: evening, attackId: second.id });
  await renderWithI18n(<HomeScreen />);

  fireEvent.click(await screen.findByRole('button', { name: formatDate(day, 'en') }));

  const firstCard = (await screen.findByText('6/10')).closest('dl')!.parentElement!;
  const secondCard = screen.getByText('8/10').closest('dl')!.parentElement!;
  expect(firstCard).not.toBe(secondCard);
  expect(firstCard).toHaveTextContent('Ibuprofen');
  expect(firstCard).not.toHaveTextContent('Sumatriptan');
  expect(secondCard).toHaveTextContent('Sumatriptan');
});
