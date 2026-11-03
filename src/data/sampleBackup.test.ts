import { readFileSync } from 'node:fs';
import { parseBackup } from './backup';

test('the sample backup in sample-data can be imported', () => {
  const backup = parseBackup(readFileSync('sample-data/headly-sample-backup.json', 'utf8'));
  expect(backup.data.attacks).toHaveLength(10);
});
