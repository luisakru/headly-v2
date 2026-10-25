import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedControl } from './SegmentedControl';
import { ToggleChip } from './ToggleChip';

test('segmented control selects one option', () => {
  const onChange = vi.fn();
  render(
    <SegmentedControl
      label="Range"
      options={[
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ]}
      value="a"
      onChange={onChange}
    />,
  );

  expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  fireEvent.click(screen.getByRole('radio', { name: 'B' }));
  expect(onChange).toHaveBeenCalledWith('b');
});

test('toggle chip flips its pressed state', () => {
  const onChange = vi.fn();
  render(<ToggleChip label="Migraine" pressed onChange={onChange} />);

  expect(screen.getByRole('button', { name: 'Migraine' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Migraine' }));
  expect(onChange).toHaveBeenCalledWith(false);
});
