import { fireEvent, screen } from '@testing-library/react';
import { addMonths, startOfMonth } from 'date-fns';
import { createAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { logIntake } from '../../data/intakeRepository';
import { createLifeEvent } from '../../data/lifeEventRepository';
import { createMedication } from '../../data/medicationRepository';
import { createPrevention } from '../../data/preventionRepository';
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

test('shows stat cards for the visible 13 weeks of the default 3M range', async () => {
  const medication = await createMedication({ name: 'Ibuprofen', isTriptan: false });
  const attack = await createAttack({
    startedAt: lastMonth(3),
    endedAt: lastMonth(3) + 2 * HOUR_MS,
    painLevel: 6,
  });
  await logIntake(medication.id, { attackId: attack.id, takenAt: lastMonth(3, 10) });

  await renderWithI18n(<StatsScreen />);

  expect(await screen.findByRole('radio', { name: '3M' })).toHaveAttribute('aria-checked', 'true');
  // 1 migraine day in the 84–91 days of the page up to today.
  expect(screen.getByText('Avg. migraine days / month').previousSibling?.textContent).toMatch(
    /^0\.[34]$/,
  );
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

test('All covers the data since the first entry', async () => {
  const twoYearsAgo = addMonths(new Date(), -24).getTime();
  // A four-day attack, so the average over two years is still visible.
  await createAttack({ startedAt: twoYearsAgo, endedAt: twoYearsAgo + 72 * HOUR_MS });

  await renderWithI18n(<StatsScreen />);
  const average = () => screen.getByText('Avg. migraine days / month').previousSibling?.textContent;
  expect(await screen.findByRole('radio', { name: '3M' })).toHaveAttribute('aria-checked', 'true');
  expect(average()).toBe('0');

  fireEvent.click(screen.getByRole('radio', { name: 'All' }));
  expect(average()).not.toBe('0');
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

test('lists life events in the range', async () => {
  await createLifeEvent({ name: 'New job', date: toDayKey(lastMonth(1)) });

  await renderWithI18n(<StatsScreen />);

  expect(await screen.findByText('Life events in this period')).toBeInTheDocument();
  expect(screen.getByText('New job')).toBeInTheDocument();
});
