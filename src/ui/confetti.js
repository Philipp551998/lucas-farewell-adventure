/*
 * Konfetti-Explosion (reine CSS-Animation, bei "reduzierte Bewegung" ausgeblendet).
 * Die Teilchen platzen aus der Mitte heraus und fallen dann herab.
 */
import { h } from '../core/dom.js';

const COLORS = ['#c2512a', '#f0b429', '#2f8f83', '#6fa86b', '#e58aa0', '#6a8fe6', '#ffffff'];

/**
 * @param {{ count?: number, screen?: boolean, originY?: string, spread?: number }} options
 *   screen = füllt den ganzen Bildschirm (Finale) statt nur den umgebenden Kasten
 */
export function createConfetti({ count = 54, screen = false, originY = '40%', spread = 170 } = {}) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const power = 0.45 + Math.random() * 0.55;
    return h('span', {
      class: `confetti__piece${i % 3 === 0 ? ' confetti__piece--round' : ''}`,
      style: {
        '--dx': `${Math.round(Math.cos(angle) * spread * power * (screen ? 1.6 : 1))}px`,
        '--dy': `${Math.round(Math.sin(angle) * spread * power * 0.9 - 40)}px`,
        '--rot': `${Math.round((Math.random() - 0.5) * 1080)}deg`,
        '--size': `${6 + Math.round(Math.random() * 5)}px`,
        '--delay': `${(Math.random() * 0.35).toFixed(2)}s`,
        '--duration': `${(1.9 + Math.random() * 1.1).toFixed(2)}s`,
        '--color': COLORS[i % COLORS.length],
        '--origin-y': originY,
      },
    });
  });
  return h('div', { class: `confetti${screen ? ' confetti--screen' : ''}`, 'aria-hidden': 'true' }, pieces);
}
