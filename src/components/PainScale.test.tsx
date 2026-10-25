import { fireEvent, screen } from '@testing-library/react';
import { renderWithI18n } from '../test/renderWithI18n';
import { PainScale } from './PainScale';

test('reports the tapped pain level and marks the current one', async () => {
  const onChange = vi.fn();
  await renderWithI18n(<PainScale value={7} onChange={onChange} />);

  expect(screen.getByRole('radio', { name: '7' })).toBeChecked();
  fireEvent.click(screen.getByRole('radio', { name: '3' }));
  expect(onChange).toHaveBeenCalledWith(3);
  expect(screen.getByText('barely noticeable')).toBeInTheDocument();
});
