// Kurze Hinweis-Blase am unteren Bildschirmrand (für Screenreader per aria-live angekündigt).
import { h } from '../core/dom.js';

let region = null;
let timer = null;

export function showToast(message, duration = 2600) {
  if (!region) {
    region = h('div', { class: 'toast-region', role: 'status', 'aria-live': 'polite' });
    document.body.append(region);
  }
  region.replaceChildren(h('div', { class: 'toast' }, message));
  clearTimeout(timer);
  timer = setTimeout(() => region.replaceChildren(), duration);
}
