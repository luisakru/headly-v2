import { fireEvent, screen, waitFor } from '@testing-library/react';
import { addMonths } from 'date-fns';
import { toInputValue } from '../../components/attackForm';
import { createAttack, listAttacks } from '../../data/attackRepository';
import { db } from '../../data/db';
import { listIntakes } from '../../data/intakeRepository';
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
  fireEvent.change(screen.getByLabelText('Start'), {
    target: { value: toInputValue(day.getTime()) },
  });
  fireEvent.change(screen.getByLabelText('End'), {
    target: { value: toInputValue(day.getTime() + 3 * HOUR_MS) },
  });
  fireEvent.click(screen.getByRole('radio', { name: '5' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add medication' }));
  fireEvent.click(screen.getByRole('button', { name: /Ibuprofen/ }));
  expect(screen.queryByRole('button', { name: 'Delete migraine' })).not.toBeInTheDocument();
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
  fireEvent.change(screen.getByLabelText('Start'), {
    target: { value: toInputValue(day.getTime() + HOUR_MS) },
  });
  fireEvent.change(screen.getByLabelText('End'), {
    target: { value: toInputValue(day.getTime() + 5 * HOUR_MS) },
  });
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
  fireEvent.change(screen.getByLabelText('Start'), {
    target: { value: toInputValue(day.getTime()) },
  });
  expect(screen.getByLabelText('End')).toHaveValue(toInputValue(day.getTime() + HOUR_MS));

  fireEvent.change(screen.getByLabelText('End'), {
    target: { value: toInputValue(day.getTime() + 4 * HOUR_MS) },
  });
  fireEvent.change(screen.getByLabelText('Start'), {
    target: { value: toInputValue(day.getTime() + HOUR_MS) },
  });
  expect(screen.getByLabelText('End')).toHaveValue(toInputValue(day.getTime() + 4 * HOUR_MS));
});
