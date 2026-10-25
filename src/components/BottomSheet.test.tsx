import { fireEvent, screen } from '@testing-library/react';
import { renderWithI18n } from '../test/renderWithI18n';
import { BottomSheet } from './BottomSheet';

function renderSheet(onClose = vi.fn()) {
  return renderWithI18n(
    <BottomSheet open onClose={onClose} title="Sheet">
      <p>Content</p>
    </BottomSheet>,
  );
}

test('closes on Escape, backdrop tap and handle tap, but not on content tap', async () => {
  const onClose = vi.fn();
  await renderSheet(onClose);
  const dialog = screen.getByRole('dialog', { name: 'Sheet' });

  fireEvent.click(screen.getByText('Content'));
  expect(onClose).not.toHaveBeenCalled();

  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.click(dialog.parentElement!);
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(3);
});

test('renders nothing when closed', async () => {
  await renderWithI18n(
    <BottomSheet open={false} onClose={vi.fn()}>
      <p>Content</p>
    </BottomSheet>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
