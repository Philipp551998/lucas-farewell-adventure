/*
 * Motive für Lotta's Treat Trail: Lotta, Knochen, Baum, Busch, Teich, Zielflagge.
 * Einfache, selbst gezeichnete SVGs – vorläufig, werden im Design-Schritt ersetzt.
 *
 * Lotta ist bewusst ein neutraler Cartoon-Hund (warmes Braun, Schlappohren).
 * Fellfarbe und Rasse der echten Lotta sind nicht bekannt – sobald Philipp sie nennt,
 * wird nur `lotta()` angepasst.
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

export function lotta() {
  const fur = '#b9794a';
  const dark = '#8a5530';
  return icon(
    // Körper und Pfoten
    ellipse(32, 53, 15, 10, fur),
    ellipse(23, 60, 5.5, 3.5, '#e8c9a0'),
    ellipse(41, 60, 5.5, 3.5, '#e8c9a0'),
    // Schlappohren
    ellipse(14, 26, 7, 13, dark, { transform: 'rotate(12 14 26)' }),
    ellipse(50, 26, 7, 13, dark, { transform: 'rotate(-12 50 26)' }),
    // Kopf
    circle(32, 28, 17, fur),
    ellipse(32, 35, 9.5, 7.5, '#f0d8b4'),
    circle(25.5, 24, 2.6, '#3b2a20'),
    circle(38.5, 24, 2.6, '#3b2a20'),
    circle(26.3, 23.2, 0.9, '#fff'),
    circle(39.3, 23.2, 0.9, '#fff'),
    ellipse(32, 31.5, 3.6, 2.6, '#3b2a20'),
    line('M32 34 V37 M27.5 37.5 Q32 41.5 36.5 37.5', '#3b2a20', 1.8),
    ellipse(32, 41, 3, 2.4, '#ee7b8e'),
  );
}

export function bone() {
  return icon(
    svg(
      'g',
      { transform: 'rotate(-35 32 32)' },
      circle(13, 27, 6.5, '#fff3da', { stroke: '#c8a46a', 'stroke-width': 2.5 }),
      circle(13, 37, 6.5, '#fff3da', { stroke: '#c8a46a', 'stroke-width': 2.5 }),
      circle(51, 27, 6.5, '#fff3da', { stroke: '#c8a46a', 'stroke-width': 2.5 }),
      circle(51, 37, 6.5, '#fff3da', { stroke: '#c8a46a', 'stroke-width': 2.5 }),
      rect(13, 27.5, 38, 9, '#fff3da'),
      line('M15 27.5 H49 M15 36.5 H49', '#c8a46a', 2.5),
    ),
  );
}

export function tree() {
  return icon(
    rect(28, 40, 8, 20, '#8a5a2b', { rx: 2 }),
    circle(32, 26, 20, '#5aa14d'),
    circle(22, 32, 12, '#6bb55c'),
    circle(43, 30, 12, '#4f9644'),
    circle(30, 20, 3, '#7cc46c'),
  );
}

export function bush() {
  return icon(
    circle(19, 42, 14, '#5aa14d'),
    circle(45, 42, 14, '#4f9644'),
    circle(32, 34, 16, '#6bb55c'),
    circle(24, 36, 2.2, '#e4577a'),
    circle(40, 31, 2.2, '#e4577a'),
    circle(33, 44, 2.2, '#e4577a'),
  );
}

export function pond() {
  return icon(
    ellipse(32, 36, 29, 21, '#6fb7e0', { stroke: '#4a93be', 'stroke-width': 3 }),
    line('M16 32 Q21 28 26 32 T36 32', '#d6efff', 2.4),
    line('M30 44 Q35 40 40 44 T50 44', '#d6efff', 2.4),
    ellipse(46, 30, 6, 3.4, '#5aa14d'),
  );
}

export function flag() {
  return icon(
    ellipse(24, 58, 12, 3.5, 'rgba(59,42,32,0.25)'),
    line('M22 8 V58', '#8a5a2b', 4),
    path('M22 8 L54 17 L22 28 Z', { fill: '#e4572e', stroke: '#a93a18', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    circle(33, 17.5, 3.2, '#ffd23f'),
    circle(22, 8, 3, '#ffd23f'),
  );
}
