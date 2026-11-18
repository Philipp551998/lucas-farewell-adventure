/*
 * Icons für die vier Bauschritte des App-in-an-App Builders: Idea, Design, Build, Launch.
 * Einfache, selbst gezeichnete SVGs – vorläufig, werden im Design-Schritt ersetzt.
 */
import { svg } from '../../core/dom.js';

const icon = (...children) =>
  svg('svg', { viewBox: '0 0 64 64', 'aria-hidden': 'true', focusable: 'false' }, ...children);
const path = (d, attrs) => svg('path', { d, ...attrs });
const circle = (cx, cy, r, fill, attrs) => svg('circle', { cx, cy, r, fill, ...attrs });
const rect = (x, y, width, height, fill, attrs) => svg('rect', { x, y, width, height, fill, ...attrs });
const line = (d, color, width = 3) =>
  path(d, { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

const rad = (deg) => (deg * Math.PI) / 180;

function idea() {
  const rays = [-90, -45, 0, 180, 225].map((deg) => {
    const a = rad(deg);
    const f = (n) => n.toFixed(1);
    return line(`M${f(32 + 22 * Math.cos(a))} ${f(26 + 22 * Math.sin(a))} L${f(32 + 28 * Math.cos(a))} ${f(26 + 28 * Math.sin(a))}`, '#f4a700', 3);
  });
  return icon(
    ...rays,
    path('M32 10 C21 10 16 18 16 25 C16 31 19 34 22 38 C23.5 40 24 42 24 45 H40 C40 42 40.5 40 42 38 C45 34 48 31 48 25 C48 18 43 10 32 10 Z', {
      fill: '#ffd23f',
      stroke: '#d9a300',
      'stroke-width': 2.5,
      'stroke-linejoin': 'round',
    }),
    rect(24, 46, 16, 5, '#c9c2b8', { rx: 2, stroke: '#8d857a', 'stroke-width': 1.5 }),
    rect(26, 52, 12, 4, '#8d857a', { rx: 2 }),
    line('M27 22 Q29 17 34 16', '#fff', 2.5),
  );
}

function design() {
  return icon(
    svg(
      'g',
      { transform: 'rotate(40 32 32)' },
      rect(27, 6, 10, 38, '#4f9fe0', { rx: 2, stroke: '#2f78b4', 'stroke-width': 2 }),
      rect(27, 6, 10, 8, '#f08a9f', { rx: 2, stroke: '#c4607a', 'stroke-width': 2 }),
      path('M27 44 H37 L32 56 Z', { fill: '#f3d9a0', stroke: '#b8925a', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
      path('M30 52 H34 L32 56 Z', { fill: '#3b2a20' }),
    ),
    circle(14, 52, 4, '#e4572e'),
    circle(24, 58, 3, '#2f8f83'),
  );
}

function build() {
  const teeth = Array.from({ length: 8 }, (_, i) =>
    rect(28, 6, 8, 12, '#8aa0b8', { rx: 2, transform: `rotate(${i * 45} 32 32)` }),
  );
  return icon(
    ...teeth,
    circle(32, 32, 18, '#a7bad0', { stroke: '#6f879f', 'stroke-width': 2.5 }),
    circle(32, 32, 7, '#fff6e6', { stroke: '#6f879f', 'stroke-width': 2.5 }),
  );
}

function launch() {
  return icon(
    path('M32 4 C42 12 45 26 42 42 H22 C19 26 22 12 32 4 Z', { fill: '#f5f5f0', stroke: '#9aa3ad', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
    path('M32 4 C37 8 40 13 41 18 H23 C24 13 27 8 32 4 Z', { fill: '#e4572e' }),
    circle(32, 28, 6, '#8fd0f0', { stroke: '#4f9fc9', 'stroke-width': 2.5 }),
    path('M22 34 L12 46 L22 44 Z', { fill: '#e4572e', stroke: '#a93a18', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    path('M42 34 L52 46 L42 44 Z', { fill: '#e4572e', stroke: '#a93a18', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    path('M26 44 H38 L32 60 Z', { fill: '#ffb347', stroke: '#f08a24', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    path('M29 44 H35 L32 54 Z', { fill: '#ffe08a' }),
  );
}

/** Die richtige Reihenfolge von oben nach unten (Excel: Idea, Design, Build, Launch). */
export const STEPS = [
  { key: 'idea', label: 'Idea', icon: idea },
  { key: 'design', label: 'Design', icon: design },
  { key: 'build', label: 'Build', icon: build },
  { key: 'launch', label: 'Launch', icon: launch },
];
