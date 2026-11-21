import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithI18n } from '../../test/renderWithI18n';
import { ImportGuidePage } from './ProfilePages';

test('warns about sharing health data and copies the prompt with the time zone', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  await renderWithI18n(
    <MemoryRouter>
      <ImportGuidePage />
    </MemoryRouter>,
  );

  expect(screen.getByText('You are sharing health data')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));

  expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining(`time zone ${timeZone}`));
});
