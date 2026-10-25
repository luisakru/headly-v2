import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { updateSettings } from '../data/settingsRepository';
import type { Language } from '../domain/types';
import { I18nProvider } from '../i18n/I18nProvider';

/** Renders inside I18nProvider and waits until the settings have loaded. */
export async function renderWithI18n(ui: ReactElement, language: Language = 'en') {
  await updateSettings({ language });
  const result = render(
    <I18nProvider>
      <div data-testid="i18n-ready">{ui}</div>
    </I18nProvider>,
  );
  await screen.findByTestId('i18n-ready');
  return result;
}
