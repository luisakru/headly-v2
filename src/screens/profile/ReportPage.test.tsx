import { fireEvent, screen } from '@testing-library/react';
import { addMonths } from 'date-fns';
import { MemoryRouter } from 'react-router-dom';
import { createAttack } from '../../data/attackRepository';
import { db } from '../../data/db';
import { logIntake, rateIntake } from '../../data/intakeRepository';
import { createMedication } from '../../data/medicationRepository';
import { renderWithI18n } from '../../test/renderWithI18n';
import { ReportPage } from './ReportPage';

const HOUR_MS = 60 * 60 * 1000;

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('lists one row per day and prints', async () => {
  const medication = await createMedication({ name: 'Sumatriptan', isTriptan: true });
  const recent = addMonths(new Date(), -1).getTime();
  const old = addMonths(new Date(), -4).getTime();
  const attack = await createAttack({ startedAt: recent, endedAt: recent + HOUR_MS });
  const intake = await logIntake(medication.id, { attackId: attack.id, takenAt: recent + HOUR_MS });
  await rateIntake(intake.id, 'strong');
  await createAttack({ startedAt: old, endedAt: old + HOUR_MS });
  const print = vi.spyOn(window, 'print').mockImplementation(() => {});

  await renderWithI18n(
    <MemoryRouter>
      <ReportPage />
    </MemoryRouter>,
  );

  expect(await screen.findByText('Migraine report')).toBeInTheDocument();
  expect(screen.getByText('Sumatriptan')).toBeInTheDocument();
  expect(screen.getByText('Strongly improved')).toBeInTheDocument();
  const rows = () => screen.getAllByRole('row').length;
  const threeMonths = rows();

  fireEvent.click(screen.getByRole('radio', { name: '6 months' }));
  // About three more months of days.
  expect(rows() - threeMonths).toBeGreaterThan(88);

  fireEvent.click(screen.getByRole('button', { name: 'Create PDF' }));
  expect(print).toHaveBeenCalled();
});
