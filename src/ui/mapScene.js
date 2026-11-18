/*
 * Landschaft der Abenteuerkarte (SVG, viewBox 0 0 100 200): Wiese, Berge oben, Meer unten links,
 * ein kleiner See, Wäldchen, Blumen und Wolken. Rein dekorativ – die Stationen und der Weg
 * liegen als eigene Ebenen darüber (siehe screens/mapScreen.js).
 *
 * Die Blumen sitzen an festen "Zufalls"-Positionen (Seed), damit die Karte bei jedem Start
 * identisch aussieht.
 */
import { svg } from '../core/dom.js';

const path = (d, attrs) => svg('path', { d, ...attrs });
const circle = (cx, cy, r, fill, attrs) => svg('circle', { cx, cy, r, fill, ...attrs });
const ellipse = (cx, cy, rx, ry, fill, attrs) => svg('ellipse', { cx, cy, rx, ry, fill, ...attrs });
const rect = (x, y, width, height, fill, attrs) => svg('rect', { x, y, width, height, fill, ...attrs });

function seededRandom(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tree = (x, y, scale = 1) =>
  svg(
    'g',
    { transform: `translate(${x} ${y}) scale(${scale})` },
    rect(-0.8, 0, 1.6, 4, '#8a5a2b'),
    circle(0, -1.5, 4.2, '#5aa14d'),
    circle(-2, 0, 2.8, '#6bb55c'),
    circle(2.2, -0.2, 2.8, '#4f9644'),
  );

function mountain(x, base, width, height, color) {
  const half = width / 2;
  const top = base - height;
  const cap = height * 0.28;
  return svg(
    'g',
    null,
    path(`M${x - half} ${base} L${x} ${top} L${x + half} ${base} Z`, { fill: color }),
    path(`M${x} ${top} L${x + half * 0.28} ${top + cap} L${x + half * 0.06} ${top + cap * 0.8} L${x - half * 0.14} ${top + cap * 1.1} L${x - half * 0.28} ${top + cap} Z`, { fill: '#f6f9fc' }),
  );
}

export function createMapScene() {
  const random = seededRandom(20261117);

  const flowers = Array.from({ length: 46 }, () => {
    const colors = ['#ffffff', '#ffb3c7', '#ffe27a', '#d9b3ff'];
    return circle(3 + random() * 94, 30 + random() * 165, 0.75, colors[Math.floor(random() * colors.length)], { opacity: 0.9 });
  });

  const trees = [
    [8, 38, 1], [15, 47, 0.9], [91, 61, 1], [95, 71, 0.85], [8, 80, 1], [90, 112, 0.9],
    [94, 138, 1], [87, 152, 0.9], [93, 176, 1], [86, 186, 0.85], [48, 118, 0.8], [52, 40, 0.8],
    [46, 60, 0.7], [54, 160, 0.8],
  ].map(([x, y, s]) => tree(x, y, s));

  return svg(
    'g',
    { class: 'map__scene' },
    rect(0, 0, 100, 200, '#d4e8b4'),
    // etwas hellere Wiesenflecken
    ellipse(50, 72, 38, 18, '#dcedbf'),
    ellipse(50, 138, 40, 20, '#dcedbf'),
    // Berge oben
    mountain(86, 30, 36, 28, '#a9b8cc'),
    mountain(70, 28, 26, 20, '#b9c6d8'),
    mountain(6, 26, 24, 18, '#b4c1d3'),
    // Wolken
    ellipse(40, 6, 9, 2.6, '#ffffff', { opacity: 0.85 }),
    ellipse(46, 4.8, 6, 2.4, '#ffffff', { opacity: 0.85 }),
    ellipse(64, 12, 7, 2.2, '#ffffff', { opacity: 0.8 }),
    // Meer unten links
    path('M0 118 Q12 112 15 128 Q18 148 12 166 Q8 184 0 192 Z', { fill: '#7fc3e0' }),
    path('M0 118 Q12 112 15 128 Q18 148 12 166 Q8 184 0 192', { fill: 'none', stroke: '#e8f6fb', 'stroke-width': 1.2, 'stroke-linecap': 'round' }),
    path('M3 140 Q6 138 9 140 T14 140 M2 160 Q5 158 8 160 T13 160', { fill: 'none', stroke: '#e8f6fb', 'stroke-width': 0.8, 'stroke-linecap': 'round' }),
    // See rechts
    ellipse(88, 104, 10, 5.5, '#7fc3e0', { stroke: '#e8f6fb', 'stroke-width': 1 }),
    path('M83 104 Q86 102 89 104 T95 104', { fill: 'none', stroke: '#e8f6fb', 'stroke-width': 0.7, 'stroke-linecap': 'round' }),
    // Blumen und Bäume
    ...flowers,
    ...trees,
  );
}
