import { Dexie } from 'dexie';
import { db, newRecordFields } from './db';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('creates a v4 uuid when crypto.randomUUID is missing', () => {
  vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) });

  const { id } = newRecordFields();

  expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('version 2 merges start and maximum pain into one pain level', async () => {
  db.close();
  await Dexie.delete('headly');
  const v1 = new Dexie('headly');
  v1.version(1).stores({ attacks: 'id, startedAt' });
  await v1.table('attacks').bulkAdd([
    { id: 'a', startedAt: 1, painAtStart: 4, painMax: 7 },
    { id: 'b', startedAt: 2, painAtStart: 5 },
    { id: 'c', startedAt: 3 },
  ]);
  v1.close();

  await db.open();

  expect(await db.attacks.toArray()).toEqual([
    { id: 'a', startedAt: 1, painLevel: 7 },
    { id: 'b', startedAt: 2, painLevel: 5 },
    { id: 'c', startedAt: 3 },
  ]);
});
