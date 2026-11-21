import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { listDayEventTypes } from '../../data/dayEventRepository';
import { db } from '../../data/db';
import { renderWithI18n } from '../../test/renderWithI18n';
import { ProfileScreen } from './ProfileScreen';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('adds a suggested small event from Profile', async () => {
  await renderWithI18n(
    <MemoryRouter>
      <ProfileScreen />
    </MemoryRouter>,
  );

  fireEvent.click(await screen.findByRole('button', { name: /^Small events/ }));
  fireEvent.click(screen.getByRole('button', { name: 'New event' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Flight' }));

  await waitFor(async () =>
    expect((await listDayEventTypes()).map((t) => t.name)).toEqual(['Flight']),
  );
  expect(await screen.findByText('Flight')).toBeInTheDocument();
});
