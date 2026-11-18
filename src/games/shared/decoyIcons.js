/*
 * Lustige Ablenkungs-Motive, die in mehreren Spielen vorkommen (Recipe Rush, Wedding Catch).
 * Einfache, selbst gezeichnete SVGs – werden im Design-Schritt durch die endgültigen
 * Illustrationen ersetzt.
 */
import { svg } from '../../core/dom.js';

const icon = (...children) =>
  svg('svg', { viewBox: '0 0 64 64', 'aria-hidden': 'true', focusable: 'false' }, ...children);
const path = (d, attrs) => svg('path', { d, ...attrs });
const circle = (cx, cy, r, fill, attrs) => svg('circle', { cx, cy, r, fill, ...attrs });
const ellipse = (cx, cy, rx, ry, fill, attrs) => svg('ellipse', { cx, cy, rx, ry, fill, ...attrs });
const rect = (x, y, width, height, fill, attrs) => svg('rect', { x, y, width, height, fill, ...attrs });
const line = (d, color, width = 3) =>
  path(d, { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

export function sock() {
  return icon(
    path('M22 8 H40 V34 L53 40 C59 44 57 56 48 56 H28 C19 56 19 49 22 42 Z', {
      fill: '#e4572e',
      stroke: '#a93a18',
      'stroke-width': 2.5,
      'stroke-linejoin': 'round',
    }),
    rect(22, 8, 18, 7, '#fff6e6', { stroke: '#a93a18', 'stroke-width': 2 }),
    rect(22, 22, 18, 4, '#fff6e6'),
    rect(22, 30, 18, 4, '#fff6e6'),
  );
}

export function rubberDuck() {
  return icon(
    ellipse(30, 42, 20, 14, '#ffd23f', { stroke: '#d9a300', 'stroke-width': 2.5 }),
    circle(40, 24, 11, '#ffd23f', { stroke: '#d9a300', 'stroke-width': 2.5 }),
    path('M49 23 L59 26.5 L49 30 Z', { fill: '#f08a24', stroke: '#c46a10', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
    circle(42.5, 21.5, 1.8, '#3b2a20'),
    path('M16 40 Q24 52 36 44', { fill: 'none', stroke: '#d9a300', 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
  );
}

export function alarmClock() {
  return icon(
    circle(17, 14, 6.5, '#e4572e', { stroke: '#a93a18', 'stroke-width': 2 }),
    circle(47, 14, 6.5, '#e4572e', { stroke: '#a93a18', 'stroke-width': 2 }),
    line('M20 55 L16 60 M44 55 L48 60', '#3b2a20', 3),
    circle(32, 35, 20, '#fffaf0', { stroke: '#3b2a20', 'stroke-width': 3 }),
    line('M32 35 V23 M32 35 L41 40', '#3b2a20', 3),
    circle(32, 35, 2, '#3b2a20'),
  );
}
