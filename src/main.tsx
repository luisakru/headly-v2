import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.DEV) {
  void import('./data/seed').then(({ seedDatabase }) => {
    Object.assign(window, { seedDemoData: seedDatabase });
  });
}
