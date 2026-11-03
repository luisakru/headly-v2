import sampleBackup from '../../sample-data/headly-sample-backup.json?raw';
import { parseBackup } from './backup';

test('the sample backup in sample-data can be imported', () => {
  const backup = parseBackup(sampleBackup);
  expect(backup.data.attacks).toHaveLength(10);
});
