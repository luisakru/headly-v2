import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  createDayEventType,
  listDayEvents,
  listDayEventTypes,
  toggleDayEvent,
} from '../../data/dayEventRepository';
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

  fireEvent.click(await screen.findByRole('button', { name: /^Events/ }));
  fireEvent.click(screen.getByRole('button', { name: 'New event' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Flight' }));

  await waitFor(async () =>
    expect((await listDayEventTypes()).map((t) => t.name)).toEqual(['Flight']),
  );
  expect(await screen.findByText('Flight')).toBeInTheDocument();
});

test('hides an event without losing its days and shows it again', async () => {
  const flight = await createDayEventType({ name: 'Flight', kind: 'custom' });
  await toggleDayEvent(flight.id, '2026-10-01');
  await renderWithI18n(
    <MemoryRouter>
      <ProfileScreen />
    </MemoryRouter>,
  );

  fireEvent.click(await screen.findByRole('button', { name: /^Events/ }));
  fireEvent.click(await screen.findByRole('switch', { name: 'Flight' }));
  await waitFor(async () => expect((await listDayEventTypes())[0]?.hidden).toBe(true));
  expect(await listDayEvents()).toHaveLength(1);

  fireEvent.click(screen.getByRole('switch', { name: 'Flight' }));
  await waitFor(async () => expect((await listDayEventTypes())[0]?.hidden).toBe(false));
});

test('renames an event with one save button', async () => {
  await createDayEventType({ name: 'Flight', kind: 'custom' });
  await renderWithI18n(
    <MemoryRouter>
      <ProfileScreen />
    </MemoryRouter>,
  );

  fireEvent.click(await screen.findByRole('button', { name: /^Events/ }));
  fireEvent.click(await screen.findByRole('button', { name: /^Flight/ }));
  expect(screen.getByText('Edit event')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Long flight' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(async () => expect((await listDayEventTypes())[0]?.name).toBe('Long flight'));
});
