import { backupFileName, buildBackup, type BackupData } from './backup';
import { updateSettings } from './settingsRepository';

function download(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Opens the share sheet with the backup file (on iOS: "Save to Files"), or downloads it
 * where files can't be shared. Returns false if the user cancelled.
 */
export async function exportBackup(data: BackupData): Promise<boolean> {
  const now = Date.now();
  const json = JSON.stringify(buildBackup(data, now), null, 2);
  const file = new File([json], backupFileName(now), { type: 'application/json' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return false;
      download(file);
    }
  } else {
    download(file);
  }
  await updateSettings({ lastBackupAt: now });
  return true;
}
