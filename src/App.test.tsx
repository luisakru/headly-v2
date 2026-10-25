import { fireEvent, render, screen } from '@testing-library/react';
import { updateSettings } from './data/settingsRepository';
import { App } from './App';

beforeEach(async () => {
  window.history.pushState({}, '', '/');
  await updateSettings({ language: 'en' });
});

test('navigates between tabs', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Hello' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Statistics' }));
  expect(await screen.findByRole('heading', { name: 'Statistics' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Statistics' })).toHaveAttribute('aria-current', 'page');
});

test('switches language without a reload', async () => {
  window.history.pushState({}, '', '/dev/components');
  render(<App />);

  fireEvent.click(await screen.findByRole('radio', { name: 'Deutsch' }));
  expect(await screen.findByRole('heading', { name: 'Komponenten' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Statistik' })).toBeInTheDocument();
  expect(document.documentElement.lang).toBe('de');
});
