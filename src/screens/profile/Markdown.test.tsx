import { render, screen } from '@testing-library/react';
import { Markdown } from './Markdown';

test('renders links that open in a new tab', () => {
  render(<Markdown source="Read [the study](https://example.org/study) first." />);

  const link = screen.getByRole('link', { name: 'the study' });
  expect(link).toHaveAttribute('href', 'https://example.org/study');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link.parentElement).toHaveTextContent('Read the study first.');
});
