import { render, screen } from '@testing-library/react';
import { Markdown } from './Markdown';

test('renders links that open in a new tab', () => {
  render(<Markdown source="Read [the study](https://example.org/study) first." />);

  const link = screen.getByRole('link', { name: 'the study' });
  expect(link).toHaveAttribute('href', 'https://example.org/study');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link.parentElement).toHaveTextContent('Read the study first.');
});

test('renders bold text in lists and paragraphs', () => {
  const { container } = render(
    <Markdown source={'- **Aura:** before\n\nSee **this** and [that](https://example.org).'} />,
  );

  expect(screen.getByText('Aura:').tagName).toBe('STRONG');
  expect(screen.getByText('this').tagName).toBe('STRONG');
  expect(container.textContent).not.toContain('**');
});

test('renders numbered lists', () => {
  const { container } = render(<Markdown source={'1. Apply\n2. Add reports'} />);
  expect(container.querySelectorAll('ol li')).toHaveLength(2);
  expect(container.textContent).not.toContain('1.');
});
