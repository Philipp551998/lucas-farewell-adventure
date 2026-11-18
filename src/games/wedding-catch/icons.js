/*
 * Motive für Wedding Catch: Ring, Blumenstrauß, Korb – einfache, selbst gezeichnete SVGs
 * (vorläufig, werden im Design-Schritt durch die endgültigen Illustrationen ersetzt).
 * Die Ablenkungen (Sock, Rubber duck, Alarm clock) kommen aus shared/decoyIcons.js.
 *
 * Bewusst nur das fröhliche Hochzeitsmotiv – keine privaten Details.
 */
import { svg } from '../../core/dom.js';
import { alarmClock, rubberDuck, sock } from '../shared/decoyIcons.js';

const icon = (viewBox, ...children) =>
  svg('svg', { viewBox, 'aria-hidden': 'true', focusable: 'false' }, ...children);
const path = (d, attrs) => svg('path', { d, ...attrs });
const circle = (cx, cy, r, fill, attrs) => svg('circle', { cx, cy, r, fill, ...attrs });
const stroke = (color, width = 3) => ({
  fill: 'none',
  stroke: color,
  'stroke-width': width,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
});

function ring() {
  return icon(
    '0 0 64 64',
    circle(32, 40, 15, 'none', { stroke: '#e0a526', 'stroke-width': 7 }),
    circle(32, 40, 15, 'none', { stroke: '#f6cf55', 'stroke-width': 3, 'stroke-dasharray': '40 60' }),
    path('M32 6 L41 15 L32 27 L23 15 Z', { fill: '#bfe9ff', stroke: '#4f9fc9', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    path('M23 15 H41 M32 6 L28 15 L32 27 M32 6 L36 15 L32 27', stroke('#4f9fc9', 1.2)),
    path('M27 29 L32 27 L37 29', stroke('#e0a526', 3)),
  );
}

function bouquet() {
  const flower = (x, y, r, petal, center = '#ffd23f') => [
    circle(x, y, r, petal, { stroke: 'rgba(59,42,32,0.18)', 'stroke-width': 1.2 }),
    circle(x, y, r * 0.38, center),
  ];
  return icon(
    '0 0 64 64',
    path('M32 58 L19 28 M32 58 L32 24 M32 58 L45 28', stroke('#4f9a45', 3)),
    path('M18 36 H46 L35 61 H29 Z', { fill: '#fff6e6', stroke: '#d7c3a0', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    ...flower(19, 25, 9, '#ff8fab'),
    ...flower(45, 25, 9, '#ff8fab'),
    ...flower(32, 17, 10, '#ffffff'),
    ...flower(26, 32, 7, '#ffb347', '#fff'),
    ...flower(38, 32, 7, '#d9a0ff', '#fff'),
    path('M32 44 C26 38 24 46 29 48 Z M32 44 C38 38 40 46 35 48 Z', { fill: '#e4577a' }),
    circle(32, 45, 2.6, '#c93a60'),
  );
}

/** Der Korb des Spielers (breiter als hoch). */
export function basket() {
  return icon(
    '0 0 96 64',
    path('M20 28 C20 -4 76 -4 76 28', stroke('#8a5a2b', 5)),
    path('M10 28 H86 L78 61 H18 Z', { fill: '#cf9755', stroke: '#8a5a2b', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
    path('M13 40 H83 M16 51 H80', stroke('#a9722f', 2.5)),
    path('M30 29 L26 60 M44 29 L42 60 M58 29 L60 60 M72 29 L76 60', stroke('#a9722f', 2)),
    svg('rect', { x: 6, y: 22, width: 84, height: 9, rx: 4, fill: '#b87a3a', stroke: '#8a5a2b', 'stroke-width': 3 }),
  );
}

/** needed = muss gefangen werden. oops = lustiger Kommentar beim Fangen einer Ablenkung. */
export const BOUQUET = { key: 'bouquet', label: 'Bouquet', needed: true, icon: bouquet };
export const RING = { key: 'ring', label: 'Ring', needed: true, icon: ring };
export const DECOYS = [
  { key: 'sock', label: 'Sock', needed: false, icon: sock, oops: 'A sock? Not this time!' },
  { key: 'duck', label: 'Rubber duck', needed: false, icon: rubberDuck, oops: 'Quack! Wrong catch.' },
  { key: 'clock', label: 'Alarm clock', needed: false, icon: alarmClock, oops: 'Not now, alarm clock!' },
];
