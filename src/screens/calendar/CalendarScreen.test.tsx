import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { addMonths } from 'date-fns';
import { toInputValue } from '../../components/attackForm';
import { createAttack, listAttacks, startAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { listIntakes, logIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
import { formatDate, formatMonthYear } from '../../i18n/format';
import { renderWithI18n } from '../../test/renderWithI18n';
import { CalendarScreen } from './CalendarScreen';

const HOUR_MS = 60 * 60 * 1000;

/** The 10th of last month at the given hour. */
function lastMonth(hour: number): Date {
  const day = addMonths(new Date(), -1);
  day.setDate(10);
  day.setHours(hour, 0, 0, 0);
  return day;
}

/** Opens the start or end row of the edit sheet, sets the time and goes back. */
function setTime(label: 'Start' | 'End', time: number) {
  const sheet = screen.getByRole('dialog');
  fireEvent.click(within(sheet).getByRole('button', { name: new RegExp(`^${label}`) }));
  fireEvent.change(screen.getByLabelText(label, { selector: 'input' }), {
    target: { value: toInputValue(time) },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('selects today on open and toggles the selection', async () => {
  await renderWithI18n(<CalendarScreen />);

  const today = await screen.findByRole('button', { name: formatDate(new Date(), 'en') });
  expect(today).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByText('No entry on this day')).not.toBeInTheDocument();
  expect(screen.getByText('Add migraine')).toBeInTheDocument();

  fireEvent.click(today);
  expect(screen.getByText('Tap a day for details')).toBeInTheDocument();
});

test('changes month, returns to the current one and counts migraine days', async () => {
  const day = lastMonth(8);
  await createAttack({ startedAt: day.getTime(), endedAt: day.getTime() + 30 * HOUR_MS });
  await renderWithI18n(<CalendarScreen />);

  fireEvent.click(await screen.findByRole('button', { name: 'Previous month' }));
  expect(screen.getByRole('heading', { name: formatMonthYear(day.getTime(), 'en') })).toBeVisible();
  expect(screen.getByText('2 migraine days')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: `← ${formatMonthYear(Date.now(), 'en')}` }));
  expect(screen.getByText('0 migraine days')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /←/ })).not.toBeInTheDocument();
});

test('adds a past migraine with medication', async () => {
  const day = lastMonth(9);
  const medication = await createMedication({ name: 'Ibuprofen', isTriptan: false });
  await renderWithI18n(<CalendarScreen />);

  fireEvent.click(await screen.findByRole('button', { name: 'Previous month' }));
  fireEvent.click(screen.getByRole('button', { name: formatDate(day, 'en') }));
  fireEvent.click(screen.getByRole('button', { name: 'Add migraine' }));
  setTime('Start', day.getTime());
  setTime('End', day.getTime() + 3 * HOUR_MS);
  fireEvent.click(screen.getByRole('button', { name: /^Pain/ }));
  fireEvent.click(screen.getByRole('radio', { name: '5' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add medication' }));
  fireEvent.click(screen.getByRole('button', { name: /Ibuprofen/ }));
  expect(screen.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(async () => expect(await listAttacks()).toHaveLength(1));
  const [attack] = await listAttacks();
  expect(attack).toMatchObject({
    startedAt: day.getTime(),
    endedAt: day.getTime() + 3 * HOUR_MS,
    painLevel: 5,
  });
  expect(await listIntakes()).toMatchObject([
    { medicationId: medication.id, attackId: attack!.id, takenAt: day.getTime() },
  ]);
});

test('rejects an overlapping new migraine and saves nothing', async () => {
  const day = lastMonth(9);
  await createAttack({ startedAt: day.getTime(), endedAt: day.getTime() + 3 * HOUR_MS });
  await renderWithI18n(<CalendarScreen />);

  fireEvent.click(await screen.findByRole('button', { name: 'Previous month' }));
  fireEvent.click(screen.getByRole('button', { name: formatDate(day, 'en') }));
  fireEvent.click(screen.getByRole('button', { name: 'Add migraine' }));
  setTime('Start', day.getTime() + HOUR_MS);
  setTime('End', day.getTime() + 5 * HOUR_MS);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'This overlaps with another migraine.',
  );
  expect(await listAttacks()).toHaveLength(1);
});

test('prefills the end one hour after the chosen start', async () => {
  const day = lastMonth(10);
  await renderWithI18n(<CalendarScreen />);

  fireEvent.click(await screen.findByRole('button', { name: 'Previous month' }));
  fireEvent.click(screen.getByRole('button', { name: formatDate(day, 'en') }));
  fireEvent.click(screen.getByRole('button', { name: 'Add migraine' }));
  setTime('Start', day.getTime());
  fireEvent.click(screen.getByRole('button', { name: /^End/ }));
  expect(screen.getByLabelText('End', { selector: 'input' })).toHaveValue(
    toInputValue(day.getTime() + HOUR_MS),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));

  setTime('End', day.getTime() + 4 * HOUR_MS);
  setTime('Start', day.getTime() + HOUR_MS);
  fireEvent.click(screen.getByRole('button', { name: /^End/ }));
  expect(screen.getByLabelText('End', { selector: 'input' })).toHaveValue(
    toInputValue(day.getTime() + 4 * HOUR_MS),
  );
});

test('tapping a day shows each attack in its own card with its medication', async () => {
  const day = lastMonth(0);
  const morning = day.setHours(8, 0, 0, 0);
  const evening = day.setHours(18, 0, 0, 0);
  const ibuprofen = await createMedication({ name: 'Ibuprofen', isTriptan: false });
  const sumatriptan = await createMedication({ name: 'Sumatriptan', isTriptan: true });
  const first = await startAttack(morning);
  await db.attacks.update(first.id, { endedAt: morning + 2 * HOUR_MS, painLevel: 6 });
  const second = await startAttack(evening);
  await db.attacks.update(second.id, { endedAt: evening + HOUR_MS, painLevel: 8 });
  await logIntake(ibuprofen.id, { takenAt: morning + HOUR_MS, attackId: first.id });
  await logIntake(sumatriptan.id, { takenAt: evening, attackId: second.id });
  await renderWithI18n(<CalendarScreen />);
  fireEvent.click(await screen.findByRole('button', { name: 'Previous month' }));

  fireEvent.click(await screen.findByRole('button', { name: formatDate(day, 'en') }));

  const firstCard = (await screen.findByText('6/10')).closest('dl')!.parentElement!;
  const secondCard = screen.getByText('8/10').closest('dl')!.parentElement!;
  expect(firstCard).not.toBe(secondCard);
  expect(firstCard).toHaveTextContent('Ibuprofen');
  expect(firstCard).not.toHaveTextContent('Sumatriptan');
  expect(secondCard).toHaveTextContent('Sumatriptan');
});

test('editing an attack from the day overview saves times, pain and medication', async () => {
  const day = lastMonth(0);
  const startedAt = day.setHours(8, 0, 0, 0);
  const ibuprofen = await createMedication({ name: 'Ibuprofen', isTriptan: false });
  await createMedication({ name: 'Sumatriptan', isTriptan: true });
  const attack = await startAttack(startedAt);
  await db.attacks.update(attack.id, {
    endedAt: startedAt + 2 * HOUR_MS,
    painLevel: 6,
  });
  await logIntake(ibuprofen.id, { takenAt: startedAt + HOUR_MS, attackId: attack.id });
  await renderWithI18n(<CalendarScreen />);
  fireEvent.click(await screen.findByRole('button', { name: 'Previous month' }));

  fireEvent.click(await screen.findByRole('button', { name: formatDate(day, 'en') }));
  fireEvent.click(await screen.findByRole('button', { name: /Duration/ }));
  setTime('End', startedAt + 3 * HOUR_MS);
  fireEvent.click(screen.getByRole('button', { name: /^Pain/ }));
  fireEvent.click(screen.getByRole('radio', { name: '8' }));
  fireEvent.click(screen.getByRole('button', { name: 'Effect pending' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove Ibuprofen' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add medication' }));
  fireEvent.click(screen.getByRole('button', { name: /Sumatriptan/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Effect pending' }));
  const sumatriptanEffect = screen.getByRole('radiogroup', { name: 'Effect · Sumatriptan' });
  fireEvent.click(within(sumatriptanEffect).getByRole('radio', { name: 'Strongly improved' }));
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(screen.queryByText('Edit migraine')).not.toBeInTheDocument());
  expect(await db.attacks.get(attack.id)).toMatchObject({
    endedAt: startedAt + 3 * HOUR_MS,
    painLevel: 8,
  });
  const intakes = await listIntakes();
  expect(intakes).toHaveLength(1);
  expect(intakes[0]).toMatchObject({
    attackId: attack.id,
    takenAt: startedAt,
    effectiveness: 'strong',
  });
});

test('editing rejects an end before the start and deletes after confirmation', async () => {
  const day = lastMonth(0);
  const startedAt = day.setHours(8, 0, 0, 0);
  const attack = await startAttack(startedAt);
  await db.attacks.update(attack.id, { endedAt: startedAt + HOUR_MS });
  await renderWithI18n(<CalendarScreen />);
  fireEvent.click(await screen.findByRole('button', { name: 'Previous month' }));

  fireEvent.click(await screen.findByRole('button', { name: formatDate(day, 'en') }));
  fireEvent.click(await screen.findByRole('button', { name: /Duration/ }));
  setTime('End', startedAt - HOUR_MS);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('The end has to be after the start.');

  fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete migraine' }));
  expect(await listAttacks()).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Really delete?' }));
  await waitFor(async () => expect(await listAttacks()).toHaveLength(0));
});
