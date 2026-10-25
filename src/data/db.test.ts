import { newRecordFields } from './db';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('creates a v4 uuid when crypto.randomUUID is missing', () => {
  vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) });

  const { id } = newRecordFields();

  expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
