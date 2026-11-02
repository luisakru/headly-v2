import { fireEvent, screen } from '@testing-library/react';
import { addMonths, startOfMonth } from 'date-fns';
import { createAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { logIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
import { createPrevention } from '../../data/preventionRepository';
import { toMonthKey } from '../../domain/dateRange';
import { toDayKey } from '../../domain/days';
import { formatMonthYear } from '../../i18n/format';
import { renderWithI18n } from '../../test/renderWithI18n';
import { StatsScreen } from './StatsScreen';

const HOUR_MS = 60 * 60 * 1000;

/** A day of last month at the given hour. */
function lastMonth(day: number, hour = 9): number {
  const date = addMonths(startOfMonth(new Date()), -1);
  date.setDate(day);
  date.setHours(hour);
  return date.getTime();
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('shows stat cards for the default 3 month range', async () => {
  const medication = await createMedication({ name: 'Ibuprofen', isTriptan: false });
  const attack = await createAttack({
    startedAt: lastMonth(3),
    endedAt: lastMonth(3) + 2 * HOUR_MS,
    painLevel: 6,
  });
  await logIntake(medication.id, { attackId: attack.id, takenAt: lastMonth(3, 10) });

  await renderWithI18n(<StatsScreen />);

  expect(await screen.findByRole('radio', { name: '3M' })).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByText('Avg. migraine days / month').previousSibling).toHaveTextContent('0.3');
  expect(screen.getByText('Avg. pain').previousSibling).toHaveTextContent('6');
  expect(screen.getByText('Medication days').previousSibling).toHaveTextContent('1');
  expect(screen.getByText('Effectiveness').previousSibling).toHaveTextContent('–');
  expect(screen.getByText('1 not rated')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('warns about medication overuse', async () => {
  const medication = await createMedication({ name: 'Sumatriptan', isTriptan: true });
  for (let day = 1; day <= 10; day++) {
    await logIntake(medication.id, { takenAt: lastMonth(day) });
  }

  await renderWithI18n(<StatsScreen />);

  expect(await screen.findByRole('alert')).toHaveTextContent(formatMonthYear(lastMonth(1), 'en'));
});

test('custom range shows month pickers and changes the numbers', async () => {
  const twoYearsAgo = addMonths(new Date(), -24).getTime();
  await createAttack({ startedAt: twoYearsAgo, endedAt: twoYearsAgo + HOUR_MS });

  await renderWithI18n(<StatsScreen />);
  fireEvent.click(await screen.findByRole('radio', { name: 'Custom' }));
  expect(screen.getByText('Avg. migraine days / month').previousSibling).toHaveTextContent('0');

  fireEvent.change(screen.getByLabelText('From'), { target: { value: toMonthKey(twoYearsAgo) } });
  fireEvent.change(screen.getByLabelText('To'), { target: { value: toMonthKey(twoYearsAgo) } });
  expect(screen.getByText('Avg. migraine days / month').previousSibling).toHaveTextContent('1');
});

test('lists preventions in the range with their effect', async () => {
  await createPrevention({
    name: 'Amitriptyline',
    type: 'medication',
    dose: '10 mg',
    startDate: toDayKey(lastMonth(1)),
  });

  await renderWithI18n(<StatsScreen />);

  expect(await screen.findByText('Amitriptyline 10 mg')).toBeInTheDocument();
  expect(screen.getByText(/· active$/)).toBeInTheDocument();
  expect(screen.getByText('No data yet')).toBeInTheDocument();
});
