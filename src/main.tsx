import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './styles/global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Asks the browser not to evict the data when storage runs low.
void navigator.storage?.persist?.();

// Reloads once a new version is installed, so an update shows on this launch, not the next.
registerSW({ immediate: true });

if (import.meta.env.DEV) {
  void import('./data/seed').then(({ seedDatabase }) => {
    Object.assign(window, { seedDemoData: seedDatabase });
  });
}
