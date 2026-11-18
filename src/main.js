import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';

import { startApp } from './app.js';

startApp(document.getElementById('app'));

// Service Worker nur im Produktions-Build (im Dev-Server würde er das Neuladen stören).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((error) => console.warn('Service worker registration failed', error));
  });
}
