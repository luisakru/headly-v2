import { fireEvent, screen, waitFor } from '@testing-library/react';
import { db } from '../data/db';
import { listDayEvents, listDayEventTypes } from '../data/dayEventRepository';
import { renderWithI18n } from '../test/renderWithI18n';
import { DayEventChips } from './DayEventChips';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

test('adds a suggested event and logs it on that day', async () => {
  await renderWithI18n(<DayEventChips types={[]} events={[]} date="2026-03-05" />);

  fireEvent.click(screen.getByRole('button', { name: 'Add an event' }));
  expect(screen.getByRole('button', { name: 'Period' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Flight' }));

  await waitFor(async () => expect(await listDayEvents()).toHaveLength(1));
  const [type] = await listDayEventTypes();
  expect(type).toMatchObject({ name: 'Flight', kind: 'custom' });
  expect((await listDayEvents())[0]).toMatchObject({ typeId: type!.id, date: '2026-03-05' });
});
