import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders the wordmark', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Headly' })).toBeInTheDocument();
});
