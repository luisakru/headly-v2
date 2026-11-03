import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createAttack, listAttacks } from '../../data/attackRepository';
import { buildBackup } from '../../data/backup';
import { db } from '../../data/db';
import { createMedication, listMedications } from '../../data/medicationRepository';
import { listPreventions } from '../../data/preventionRepository';
import { getSettings } from '../../data/settingsRepository';
import { at } from '../../test/factories';
import { renderWithI18n } from '../../test/renderWithI18n';
import { MemoryRouter } from 'react-router-dom';
import { ProfileScreen } from './ProfileScreen';

function renderProfile() {
  return renderWithI18n(
    <MemoryRouter>
      <ProfileScreen />
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('adds, edits and archives a medication', async () => {
  await renderProfile();

  fireEvent.click(await screen.findByRole('button', { name: /Manage medications/ }));
  fireEvent.click(screen.getByRole('button', { name: 'New medication' }));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Sumatriptan' } });
  fireEvent.change(screen.getByLabelText('Dose (optional)'), { target: { value: '50 mg' } });
  fireEvent.click(screen.getByRole('button', { name: 'Triptan' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  fireEvent.click(await screen.findByRole('button', { name: /Sumatriptan/ }));
  fireEvent.change(screen.getByLabelText('Dose (optional)'), { target: { value: '100 mg' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(async () =>
    expect(await listMedications()).toMatchObject([
      { name: 'Sumatriptan', dose: '100 mg', isTriptan: true },
    ]),
  );

  fireEvent.click(await screen.findByRole('button', { name: /Sumatriptan/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
  expect(await screen.findByRole('heading', { name: 'Archived' })).toBeInTheDocument();
  expect(await listMedications()).toEqual([]);
});

test('adds a prevention and rejects an end before the start', async () => {
  await renderProfile();

  fireEvent.click(await screen.findByRole('button', { name: /Manage prevention/ }));
  fireEvent.click(screen.getByRole('button', { name: 'New prevention' }));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Magnesium' } });
  fireEvent.click(screen.getByRole('radio', { name: 'Lifestyle' }));
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-03-01' } });
  fireEvent.change(screen.getByLabelText('End date (optional)'), {
    target: { value: '2026-02-01' },
  });

  expect(screen.getByRole('alert')).toHaveTextContent('cannot be before');
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

  fireEvent.change(screen.getByLabelText('End date (optional)'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('heading', { name: 'Active' })).toBeInTheDocument();
  expect(await listPreventions()).toMatchObject([
    { name: 'Magnesium', type: 'lifestyle', startDate: '2026-03-01' },
  ]);
});

test('imports a backup file by replacing all data', async () => {
  await createMedication({ name: 'Ibuprofen', isTriptan: false });
  const backup = buildBackup(
    {
      attacks: [
        {
          id: 'a1',
          startedAt: at(2026, 3, 5, 9),
          endedAt: at(2026, 3, 5, 12),
          createdAt: 1,
          updatedAt: 1,
        },
      ],
      medications: [],
      medicationIntakes: [],
      preventions: [],
    },
    Date.now(),
  );
  const { container } = await renderProfile();
  await screen.findByRole('button', { name: /Import data/ });

  const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
  fireEvent.change(container.ownerDocument.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });

  expect(
    await screen.findByText(
      'This backup contains 1 migraine, 0 medications, 0 intakes, 0 preventions.',
    ),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Replace all' }));
  fireEvent.click(screen.getByRole('button', { name: 'Really replace everything?' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Imported 1 migraine');
  expect(await listAttacks()).toHaveLength(1);
  expect(await listMedications()).toEqual([]);
});

test('shows an error for a file that is not a backup', async () => {
  const { container } = await renderProfile();
  await screen.findByRole('button', { name: /Import data/ });

  const file = new File(['{"hello":1}'], 'other.json', { type: 'application/json' });
  fireEvent.change(container.ownerDocument.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });

  expect(await screen.findByRole('alert')).toHaveTextContent('not a Headly backup');
});

test('deletes all data after two confirmations', async () => {
  await createAttack({ startedAt: at(2026, 3, 5, 9), endedAt: at(2026, 3, 5, 12) });
  await renderProfile();

  fireEvent.click(await screen.findByRole('button', { name: /Delete all data/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete all data' }));
  expect(await listAttacks()).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Really delete everything?' }));

  await waitFor(async () => expect(await listAttacks()).toEqual([]));
});

test('toggles the backup reminder and switches the language', async () => {
  await renderProfile();

  fireEvent.click(await screen.findByRole('switch', { name: /Backup reminder/ }));
  await waitFor(async () => expect((await getSettings()).backupReminderEnabled).toBe(false));

  fireEvent.click(screen.getByRole('radio', { name: 'Deutsch' }));
  expect(await screen.findByRole('heading', { name: 'Profil' })).toBeInTheDocument();
});

test('confirms a finished export', async () => {
  URL.createObjectURL = () => 'blob:backup';
  URL.revokeObjectURL = () => {};
  await renderProfile();

  fireEvent.click(await screen.findByRole('button', { name: /Export data/ }));
  expect(await screen.findByText('Backup saved')).toBeInTheDocument();
});
