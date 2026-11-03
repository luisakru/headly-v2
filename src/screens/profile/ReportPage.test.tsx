import { fireEvent, screen } from '@testing-library/react';
import { addMonths } from 'date-fns';
import { MemoryRouter } from 'react-router-dom';
import { createAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { logIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
import { renderWithI18n } from '../../test/renderWithI18n';
import { ReportPage } from './ReportPage';

const HOUR_MS = 60 * 60 * 1000;

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('lists attacks of the chosen months and prints', async () => {
  const medication = await createMedication({ name: 'Sumatriptan', isTriptan: true });
  const recent = addMonths(new Date(), -1).getTime();
  const old = addMonths(new Date(), -4).getTime();
  const attack = await createAttack({
    startedAt: recent,
    endedAt: recent + 5 * HOUR_MS,
    painLevel: 7,
  });
  await logIntake(medication.id, { attackId: attack.id, takenAt: recent + HOUR_MS });
  await createAttack({ startedAt: old, endedAt: old + 2 * HOUR_MS });
  const print = vi.spyOn(window, 'print').mockImplementation(() => {});

  await renderWithI18n(
    <MemoryRouter>
      <ReportPage />
    </MemoryRouter>,
  );

  expect(await screen.findByText('Migraine report')).toBeInTheDocument();
  expect(screen.getByText('7/10')).toBeInTheDocument();
  expect(screen.getByText(/Sumatriptan/)).toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(2);

  fireEvent.click(screen.getByRole('radio', { name: '6 months' }));
  expect(screen.getAllByRole('row')).toHaveLength(3);

  fireEvent.click(screen.getByRole('button', { name: 'Create PDF' }));
  expect(print).toHaveBeenCalled();
});
