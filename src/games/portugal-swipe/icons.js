/*
 * Die acht Motive der Portugal Swipe Challenge als einfache, selbst gezeichnete SVGs
 * (original, keine fremden Assets). Sie sind bewusst schlicht gehalten und werden im
 * Design-Schritt durch die endgültigen Illustrationen ersetzt.
 *
 * Quelle der Motive: Excel-Blatt "App Game Plan", Checkpoint 1.
 */
import { svg } from '../../core/dom.js';

const icon = (...children) =>
  svg('svg', { viewBox: '0 0 64 64', 'aria-hidden': 'true', focusable: 'false' }, ...children);
const path = (d, attrs) => svg('path', { d, ...attrs });
const circle = (cx, cy, r, fill, attrs) => svg('circle', { cx, cy, r, fill, ...attrs });
const ellipse = (cx, cy, rx, ry, fill, attrs) => svg('ellipse', { cx, cy, rx, ry, fill, ...attrs });
const stroke = (color, width = 3) => ({
  fill: 'none',
  stroke: color,
  'stroke-width': width,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
});

const rad = (deg) => (deg * Math.PI) / 180;

// ---------- Portugiesisch ----------

function pastelDeNata() {
  return icon(
    path('M12 32 L18 55 H46 L52 32 Z', { fill: '#d99a4e' }),
    path('M22 38 L23 54 M29 39 L29.5 54 M35 39 L34.5 54 M42 38 L41 54', stroke('#b97a35', 1.6)),
    ellipse(32, 32, 21, 8, '#e9b96e'),
    ellipse(32, 32, 17, 6, '#f8d86f'),
    circle(25, 31, 2.6, '#b3571a'),
    circle(38, 33, 2.2, '#b3571a'),
    circle(33, 29.5, 2, '#b3571a'),
  );
}

function beach() {
  return icon(
    svg('rect', { x: 2, y: 50, width: 60, height: 14, fill: '#f3d9a0' }),
    path('M2 46 Q12 41 22 46 T42 46 T62 46 V52 H2 Z', { fill: '#4aa3c7' }),
    path('M10 30 A22 20 0 0 1 54 30 Z', { fill: '#e4572e' }),
    path('M32 10.5 L22 30 H42 Z', { fill: '#fff6e6' }),
    path('M32 30 L30 54', stroke('#7a4a1e', 3)),
    circle(32, 10, 2.2, '#7a4a1e'),
  );
}

function sun() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = rad(i * 45);
    return path(
      `M${(32 + 18 * Math.cos(a)).toFixed(1)} ${(32 + 18 * Math.sin(a)).toFixed(1)} L${(32 + 26 * Math.cos(a)).toFixed(1)} ${(32 + 26 * Math.sin(a)).toFixed(1)}`,
      stroke('#f4a700', 4),
    );
  });
  return icon(
    ...rays,
    circle(32, 32, 13, '#ffc933', { stroke: '#f4a700', 'stroke-width': 2 }),
    circle(27.5, 30, 1.8, '#5a3a00'),
    circle(36.5, 30, 1.8, '#5a3a00'),
    path('M26.5 35.5 Q32 40.5 37.5 35.5', stroke('#5a3a00', 2)),
  );
}

function sardine() {
  return icon(
    path('M50 32 L62 21 L62 43 Z', { fill: '#7fa8c4' }),
    ellipse(30, 32, 22, 11, '#7fa8c4'),
    ellipse(29, 37, 18, 5, '#dbe9f1'),
    path('M14 24 Q30 18 46 26', stroke('#4f7f9c', 2)),
    path('M20 26 Q23 32 20 38', stroke('#4f7f9c', 1.8)),
    circle(14, 30, 2.4, '#fff'),
    circle(14, 30, 1.2, '#1d2b36'),
  );
}

function azulejo() {
  return icon(
    svg('rect', { x: 6, y: 6, width: 52, height: 52, rx: 5, fill: '#fdfdf8', stroke: '#1f5aa6', 'stroke-width': 3 }),
    path('M32 12 L52 32 L32 52 L12 32 Z', stroke('#2a6fd6', 2.4)),
    circle(32, 32, 7, '#2a6fd6'),
    circle(32, 32, 3, '#fdfdf8'),
    circle(32, 18, 2.6, '#2a6fd6'),
    circle(32, 46, 2.6, '#2a6fd6'),
    circle(18, 32, 2.6, '#2a6fd6'),
    circle(46, 32, 2.6, '#2a6fd6'),
    circle(12, 12, 2.4, '#2a6fd6'),
    circle(52, 12, 2.4, '#2a6fd6'),
    circle(12, 52, 2.4, '#2a6fd6'),
    circle(52, 52, 2.4, '#2a6fd6'),
  );
}

// ---------- Deutsche Ablenkung ----------

function pretzel() {
  return icon(
    path(
      'M20 50 C8 40 8 22 22 18 C30 16 32 24 32 28 C32 24 34 16 42 18 C56 22 56 40 44 50 C38 54 32 46 32 40 C32 46 26 54 20 50 Z',
      stroke('#b8651b', 6.5),
    ),
    path('M24 36 C29 45 35 45 40 36', stroke('#b8651b', 6.5)),
    circle(16, 28, 1.3, '#fff'),
    circle(26, 19, 1.3, '#fff'),
    circle(47, 30, 1.3, '#fff'),
    circle(38, 19, 1.3, '#fff'),
    circle(22, 48, 1.3, '#fff'),
    circle(43, 46, 1.3, '#fff'),
    circle(32, 34, 1.3, '#fff'),
  );
}

function lederhosen() {
  return icon(
    path('M22 14 H42 V30 H22 Z', { fill: '#8a5a2b' }),
    path('M14 30 H50 L52 56 H36 L32 44 L28 56 H12 Z', { fill: '#8a5a2b' }),
    path('M24 8 V30 M40 8 V30', stroke('#3f7d3a', 4)),
    path('M24 21 H40', stroke('#3f7d3a', 3.5)),
    path('M32 25.5 C28 22.5 29.5 19.5 32 21.5 C34.5 19.5 36 22.5 32 25.5 Z', { fill: '#e4572e' }),
    path('M16 34 H48', stroke('#5e3a17', 1.6)),
  );
}

function snowflake() {
  const arms = [];
  for (let i = 0; i < 6; i += 1) {
    const a = rad(i * 60);
    const point = (len, angleOffset = 0, from = [32, 32]) => [
      from[0] + len * Math.cos(a + angleOffset),
      from[1] + len * Math.sin(a + angleOffset),
    ];
    const fmt = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
    const tip = point(26);
    const mid = point(16);
    const b1 = point(7, rad(40), mid);
    const b2 = point(7, rad(-40), mid);
    arms.push(
      path(`M32 32 L${fmt(tip)} M${fmt(mid)} L${fmt(b1)} M${fmt(mid)} L${fmt(b2)}`, stroke('#5fb4d6', 3)),
    );
  }
  return icon(...arms, circle(32, 32, 3.4, '#bfe6f5'));
}

/** Reihenfolge ist egal – die Spiellogik mischt zufällig. */
export const ITEMS = [
  { key: 'nata', label: 'Pastel de nata', portuguese: true, icon: pastelDeNata },
  { key: 'beach', label: 'Beach', portuguese: true, icon: beach },
  { key: 'sun', label: 'Sun', portuguese: true, icon: sun },
  { key: 'sardine', label: 'Sardine', portuguese: true, icon: sardine },
  { key: 'azulejo', label: 'Azulejo', portuguese: true, icon: azulejo },
  { key: 'pretzel', label: 'Pretzel', portuguese: false, icon: pretzel },
  { key: 'lederhosen', label: 'Lederhosen', portuguese: false, icon: lederhosen },
  { key: 'snowflake', label: 'Snowflake', portuguese: false, icon: snowflake },
];
