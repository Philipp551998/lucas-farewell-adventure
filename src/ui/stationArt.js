/*
 * Illustrationen der acht Stationen, der Schatztruhe und der Spielfigur (alles eigene SVGs,
 * keine fremden Assets). Jede Station hat einen eigenen kleinen Schauplatz mit Bezug zu ihrem Spiel:
 *
 *   joana    – Haus mit Azulejo-Kacheln am Meer (Portugal Swipe)
 *   murielle – Pfannkuchen-Stapel (Recipe Rush)
 *   ilonka   – Blumenbogen mit Ringen (Wedding Catch)
 *   borke    – Hundehütte mit Knochen (Lotta's Treat Trail)
 *   natalia  – Schloss mit Fragezeichen (Erlangen Quiz)
 *   dominic  – Café mit gestreifter Markise und Pizza (Italian Starter Quiz)
 *   philipp  – Smartphone im Smartphone (App-in-an-App Builder)
 *   acelya   – Terminal mit Python-Schlange (Python Path Decoder)
 *
 * Gemeinsame Zeichenfläche: viewBox 0 0 80 80. Die Motive sind bewusst schlicht und warm gehalten.
 */
import { svg } from '../core/dom.js';

const art = (...children) =>
  svg('svg', { viewBox: '0 0 80 80', 'aria-hidden': 'true', focusable: 'false', class: 'station-art' }, ...children);
const path = (d, attrs) => svg('path', { d, ...attrs });
const circle = (cx, cy, r, fill, attrs) => svg('circle', { cx, cy, r, fill, ...attrs });
const ellipse = (cx, cy, rx, ry, fill, attrs) => svg('ellipse', { cx, cy, rx, ry, fill, ...attrs });
const rect = (x, y, width, height, fill, attrs) => svg('rect', { x, y, width, height, fill, ...attrs });
const line = (d, color, width = 3) =>
  path(d, { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
const outline = (color, width = 2) => ({ stroke: color, 'stroke-width': width, 'stroke-linejoin': 'round' });
const rad = (deg) => (deg * Math.PI) / 180;
const f1 = (n) => n.toFixed(1);

function joana() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = rad(i * 45);
    return line(`M${f1(62 + 11 * Math.cos(a))} ${f1(16 + 11 * Math.sin(a))} L${f1(62 + 15 * Math.cos(a))} ${f1(16 + 15 * Math.sin(a))}`, '#f4a700', 2.4);
  });
  return art(
    ...rays,
    circle(62, 16, 8, '#ffcf3f', outline('#f4a700')),
    rect(0, 62, 80, 18, '#4aa3c7'),
    path('M0 64 Q10 59 20 64 T40 64 T60 64 T80 64', { fill: 'none', stroke: '#d6efff', 'stroke-width': 2, 'stroke-linecap': 'round' }),
    ellipse(40, 66, 34, 8, '#f3d9a0', outline('#d8b97a')),
    rect(21, 36, 38, 28, '#fff6e6', outline('#c9b48a')),
    path('M16 38 L40 17 L64 38 Z', { fill: '#d9653b', ...outline('#a93a18') }),
    path('M34 64 V52 Q40 44 46 52 V64 Z', { fill: '#2a6fd6' }),
    rect(24, 40, 9, 9, '#fdfdf8', outline('#2a6fd6', 1.6)),
    circle(28.5, 44.5, 2.2, '#2a6fd6'),
    rect(47, 40, 9, 9, '#fdfdf8', outline('#2a6fd6', 1.6)),
    circle(51.5, 44.5, 2.2, '#2a6fd6'),
  );
}

function murielle() {
  const pancake = (y) => [
    rect(17, y, 46, 9, '#e3a85c', { rx: 4.5 }),
    ellipse(40, y + 1, 23, 4.5, '#f2c27d'),
  ];
  return art(
    ellipse(40, 66, 32, 8, '#fff6e6', outline('#d7c3a0')),
    ellipse(40, 64, 24, 5, '#f1e4cc'),
    ...pancake(52),
    ...pancake(44),
    ...pancake(36),
    path('M20 38 Q40 47 60 38 L60 42 Q57 51 53 43 Q50 54 45 44 Q40 51 36 44 Q32 54 28 43 Q24 49 20 42 Z', { fill: '#b8671b', opacity: 0.92 }),
    rect(33, 24, 14, 10, '#ffe27a', { rx: 2.5, ...outline('#d9b53a', 1.8) }),
    path('M33 28 H47', { fill: 'none', stroke: '#f1c93f', 'stroke-width': 1.6 }),
    line('M26 20 Q22 14 26 8 M40 18 Q36 11 40 4 M54 20 Q50 14 54 8', '#cfd8dc', 2),
  );
}

function ilonka() {
  const flower = (x, y, petal) => [circle(x, y, 5.6, petal, outline('rgba(59,42,32,0.2)', 1)), circle(x, y, 2, '#ffd23f')];
  return art(
    ellipse(40, 71, 32, 6, 'rgba(59,42,32,0.18)'),
    line('M14 70 V38 Q14 10 40 10 Q66 10 66 38 V70', '#5aa14d', 5),
    ...flower(14, 54, '#ff8fab'),
    ...flower(14, 40, '#ffffff'),
    ...flower(19, 26, '#ff8fab'),
    ...flower(29, 15, '#ffffff'),
    ...flower(40, 10, '#ff8fab'),
    ...flower(51, 15, '#ffffff'),
    ...flower(61, 26, '#ff8fab'),
    ...flower(66, 40, '#ffffff'),
    ...flower(66, 54, '#ff8fab'),
    circle(34, 52, 8, 'none', { stroke: '#e0a526', 'stroke-width': 3.4 }),
    circle(46, 52, 8, 'none', { stroke: '#f2c548', 'stroke-width': 3.4 }),
    path('M40 28 L44 33 L40 40 L36 33 Z', { fill: '#bfe9ff', ...outline('#4f9fc9', 1.4) }),
    line('M40 40 V44', '#e0a526', 2),
  );
}

function borke() {
  const bone = [
    svg(
      'g',
      { transform: 'rotate(-30 63 64)' },
      circle(54, 62, 3.6, '#fff3da', outline('#c8a46a', 1.6)),
      circle(54, 67, 3.6, '#fff3da', outline('#c8a46a', 1.6)),
      circle(72, 62, 3.6, '#fff3da', outline('#c8a46a', 1.6)),
      circle(72, 67, 3.6, '#fff3da', outline('#c8a46a', 1.6)),
      rect(54, 62, 18, 5, '#fff3da'),
    ),
  ];
  return art(
    ellipse(40, 72, 34, 6, 'rgba(59,42,32,0.18)'),
    rect(16, 38, 40, 30, '#d9a05b', outline('#a9722f')),
    path('M10 40 L36 16 L62 40 Z', { fill: '#c2512a', ...outline('#9f3f1d') }),
    path('M28 68 V54 Q36 43 44 54 V68 Z', { fill: '#4a2f1a' }),
    circle(36, 31, 3, '#ffd23f'),
    ...bone,
  );
}

function natalia() {
  return art(
    ellipse(40, 72, 34, 6, 'rgba(59,42,32,0.18)'),
    rect(12, 40, 56, 28, '#e8d8bf', outline('#bda888')),
    rect(31, 22, 18, 46, '#efe0c6', outline('#bda888')),
    path('M28 24 L40 8 L52 24 Z', { fill: '#5a7bb5', ...outline('#3f5f98') }),
    line('M40 8 V2', '#8a5a2b', 2),
    path('M40 2 L48 5 L40 8 Z', { fill: '#e4572e' }),
    path('M35 68 V56 Q40 50 45 56 V68 Z', { fill: '#6b4a2f' }),
    rect(16, 46, 8, 10, '#bfe0ef', outline('#8fb4c8', 1.4)),
    rect(56, 46, 8, 10, '#bfe0ef', outline('#8fb4c8', 1.4)),
    rect(36, 30, 8, 10, '#bfe0ef', outline('#8fb4c8', 1.4)),
    circle(65, 16, 10, '#ffd23f', outline('#d9a300')),
    line('M61 12.5 Q61 9 65 9 Q69 9 69 13 Q69 16 65 17.5 V19.5', '#3b2a20', 2.2),
    circle(65, 23, 1.4, '#3b2a20'),
  );
}

function dominic() {
  const colors = ['#2f9e57', '#fffdf8', '#d8412f'];
  const stripes = Array.from({ length: 6 }, (_, i) => rect(14 + i * 8.67, 28, 8.67, 10, colors[i % 3]));
  const scallops = Array.from({ length: 6 }, (_, i) => circle(14 + i * 8.67 + 4.33, 38, 4.33, colors[i % 3]));
  return art(
    ellipse(40, 72, 34, 6, 'rgba(59,42,32,0.18)'),
    rect(14, 36, 52, 32, '#fff6e6', outline('#c9b48a')),
    ...stripes,
    ...scallops,
    rect(36, 50, 12, 18, '#8a5a2b', outline('#5e3a17', 1.6)),
    circle(45, 59, 1.1, '#ffd23f'),
    rect(18, 48, 14, 12, '#bfe0ef', outline('#8fb4c8', 1.6)),
    circle(25, 54, 4.8, '#f2c14e', outline('#c47a1c', 1.2)),
    circle(23.5, 52.8, 1, '#d8412f'),
    circle(26.5, 55, 1, '#d8412f'),
    circle(24.5, 56, 1, '#d8412f'),
    circle(56, 58, 6, '#f2c14e', outline('#c47a1c', 1.4)),
    circle(54, 56, 1.2, '#d8412f'),
    circle(58, 59, 1.2, '#d8412f'),
    circle(55.5, 61, 1.2, '#d8412f'),
    path('M10 36 H70', { fill: 'none', stroke: 'rgba(59,42,32,0.25)', 'stroke-width': 1.4 }),
  );
}

function philipp() {
  const appDots = [
    ['#e4572e', 26, 18],
    ['#2f8f83', 36, 18],
    ['#f0b429', 46, 18],
    ['#6a8fe6', 56, 18],
  ].map(([color, x, y]) => rect(x - 4, y - 4, 8, 8, color, { rx: 2.4 }));
  return art(
    ellipse(40, 75, 24, 4, 'rgba(59,42,32,0.18)'),
    rect(16, 4, 48, 70, '#3b4a63', { rx: 9 }),
    rect(20, 10, 40, 58, '#e8f1fb', { rx: 4 }),
    ...appDots,
    rect(29, 28, 22, 34, '#3b4a63', { rx: 5 }),
    rect(32, 33, 16, 25, '#cde7ff', { rx: 2.5 }),
    rect(34, 36, 5, 5, '#e4572e', { rx: 1.4 }),
    rect(41, 36, 5, 5, '#2f8f83', { rx: 1.4 }),
    rect(34, 43, 5, 5, '#f0b429', { rx: 1.4 }),
    path('M41 49.5 L43.5 52 L46 49.5', { fill: 'none', stroke: '#c2512a', 'stroke-width': 1.6, 'stroke-linecap': 'round' }),
    circle(40, 71, 1.6, '#8d9bb0'),
    line('M28 4 H52', '#2a3547', 2),
  );
}

function acelya() {
  return art(
    ellipse(40, 76, 28, 4, 'rgba(59,42,32,0.18)'),
    line('M14 26 Q22 6 32 15 Q42 24 50 11 Q58 2 66 16', '#3776ab', 7.5),
    line('M14 26 Q22 6 32 15 Q42 24 50 11 Q58 2 66 16', '#ffd43b', 2.4),
    circle(67, 17, 5.6, '#3776ab', outline('#2a5a86', 1.6)),
    circle(69, 15.5, 1.6, '#ffd43b'),
    circle(69.4, 15.5, 0.8, '#1d2b36'),
    path('M72 18 L77 17.5 M77 17.5 L79 16 M77 17.5 L79 19', { fill: 'none', stroke: '#d8412f', 'stroke-width': 1.2, 'stroke-linecap': 'round' }),
    rect(10, 26, 60, 38, '#1f2a3a', { rx: 5, ...outline('#3776ab', 2.4) }),
    line('M17 37 L24 42 L17 47', '#6fd39a', 2.6),
    line('M28 48 H40', '#ffd43b', 2.6),
    line('M44 37 H60 M44 43 H55', '#8fd0f0', 2),
    rect(33, 64, 14, 6, '#3776ab'),
    rect(25, 70, 30, 4, '#3776ab', { rx: 2 }),
  );
}

function chest(open) {
  const body = [
    ellipse(40, 72, 34, 6, 'rgba(59,42,32,0.2)'),
    rect(12, 40, 56, 30, '#a9722f', outline('#7a4f1c', 2.4)),
    rect(34, 40, 12, 30, '#f2c548', outline('#c9941f', 1.6)),
    rect(12, 50, 56, 5, '#f2c548'),
    circle(40, 56, 4, '#ffe08a', outline('#c9941f', 1.6)),
  ];
  if (!open) {
    return art(
      ...body,
      path('M12 40 Q40 10 68 40 Z', { fill: '#c98f4e', ...outline('#7a4f1c', 2.4) }),
      path('M34 40 Q40 22 46 40 Z', { fill: '#f2c548' }),
    );
  }
  const rays = Array.from({ length: 7 }, (_, i) => {
    const a = rad(-160 + i * 23);
    return line(`M40 36 L${f1(40 + 30 * Math.cos(a))} ${f1(36 + 30 * Math.sin(a))}`, '#ffe08a', 3);
  });
  return art(
    ...rays,
    path('M14 40 Q10 20 24 14 L36 38 Z', { fill: '#c98f4e', ...outline('#7a4f1c', 2.4) }),
    ...body,
    ellipse(40, 40, 24, 5, '#fff2b8'),
    path('M40 22 L43 30 L52 30 L45 35 L48 43 L40 38 L32 43 L35 35 L28 30 L37 30 Z', { fill: '#ffd23f', ...outline('#c9941f', 1.4) }),
  );
}

/** Spielfigur wie im Brettspiel (Hütchenfigur). */
export function createPawn() {
  return svg(
    'svg',
    { viewBox: '0 0 40 56', 'aria-hidden': 'true', focusable: 'false', class: 'pawn-art' },
    ellipse(20, 51, 14, 4.5, 'rgba(59,42,32,0.3)'),
    path('M10 48 C12 34 16 30 20 25 C24 30 28 34 30 48 Z', { fill: '#c2512a', ...outline('#9f3f1d', 2) }),
    circle(20, 16, 10, '#e4572e', outline('#9f3f1d', 2)),
    circle(16.5, 12.5, 3, 'rgba(255,255,255,0.55)'),
  );
}

const BUILDERS = { joana, murielle, ilonka, borke, natalia, dominic, philipp, acelya };

/** Frische SVG-Illustration der Station (jeder Aufruf liefert ein neues Element). */
export function createStationArt(id) {
  return (BUILDERS[id] ?? (() => art()))();
}

/** Schatztruhe (Finale): geschlossen oder geöffnet. */
export function createChest(open = false) {
  return chest(open);
}
