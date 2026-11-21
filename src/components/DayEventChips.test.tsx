import { fireEvent, screen, waitFor } from '@testing-library/react';
import { db } from '../data/db';
import { createDayEventType, listDayEvents } from '../data/dayEventRepository';
import { renderWithI18n } from '../test/renderWithI18n';
import { DayEventChips } from './DayEventChips';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('logs an event on that day and offers no way to add new kinds', async () => {
  const flight = await createDayEventType({ name: 'Flight', kind: 'custom' });
  await renderWithI18n(<DayEventChips types={[flight]} events={[]} date="2026-03-05" />);

  fireEvent.click(screen.getByRole('button', { name: 'Flight' }));
  await waitFor(async () =>
    expect(await listDayEvents()).toMatchObject([{ typeId: flight.id, date: '2026-03-05' }]),
  );
  expect(screen.queryByRole('button', { name: 'Add an event' })).not.toBeInTheDocument();
});
