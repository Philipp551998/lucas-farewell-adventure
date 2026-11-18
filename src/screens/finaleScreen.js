/*
 * FinaleScreen – das große Finale nach der achten Station: geöffnete Schatztruhe mit rotierenden
 * Lichtstrahlen, Konfetti-Explosion, Feuerwerk und ein kurzer, herzlicher Text (Entwurf in
 * data/copy.js – wird mit Philipp abgestimmt). Danach geht es zur Memory Wall.
 * Alle Effekte sind reine CSS-Animationen und bei "reduzierte Bewegung" ausgeblendet.
 */
import { h } from '../core/dom.js';
import { progress } from '../core/store.js';
import { COPY } from '../data/copy.js';
import { createConfetti } from '../ui/confetti.js';
import { createChest } from '../ui/stationArt.js';

const FIREWORK_COLORS = ['#ffd23f', '#ff8fab', '#8fd0f0', '#ffffff', '#6fd39a'];
const FIREWORKS = [
  { x: '20%', y: '22%', delay: 0.2 },
  { x: '80%', y: '18%', delay: 1.1 },
  { x: '50%', y: '34%', delay: 1.9 },
  { x: '14%', y: '58%', delay: 2.6 },
  { x: '86%', y: '54%', delay: 0.7 },
];

function createFireworks() {
  return h(
    'div',
    { class: 'fireworks', 'aria-hidden': 'true' },
    FIREWORKS.map((burst, burstIndex) =>
      h(
        'div',
        { class: 'firework', style: { '--x': burst.x, '--y': burst.y } },
        Array.from({ length: 14 }, (_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const distance = 46 + (i % 2) * 16;
          return h('span', {
            class: 'firework__spark',
            style: {
              '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
              '--dy': `${Math.round(Math.sin(angle) * distance)}px`,
              '--color': FIREWORK_COLORS[(i + burstIndex) % FIREWORK_COLORS.length],
              '--delay': `${burst.delay}s`,
            },
          });
        }),
      ),
    ),
  );
}

export function mountFinale(root) {
  progress.markFinaleSeen();

  root.append(
    h(
      'section',
      { class: 'screen finale' },
      createFireworks(),
      createConfetti({ count: 90, screen: true, originY: '34%', spread: 190 }),
      h(
        'div',
        { class: 'finale__stage', 'aria-hidden': 'true' },
        h('div', { class: 'finale__rays' }),
        h('div', { class: 'finale__chest' }, createChest(true)),
      ),
      h('p', { class: 'eyebrow' }, COPY.finale.eyebrow),
      h('h1', { class: 'finale__title' }, COPY.finale.title),
      h('p', { class: 'welcome__lead finale__text' }, COPY.finale.text),
      h(
        'div',
        { class: 'stack' },
        h('a', { class: 'btn btn--primary btn--large', href: '#/wall' }, COPY.finale.toWall),
      ),
    ),
  );
}
