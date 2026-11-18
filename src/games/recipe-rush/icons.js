/*
 * Zutaten und Ablenkungen für Recipe Rush als einfache, selbst gezeichnete SVGs.
 * Rezept: Pancakes (Flour, Eggs, Milk, Butter) – Entscheidung von Philipp.
 * Die Motive sind vorläufig und werden im Design-Schritt durch die endgültigen
 * Illustrationen ersetzt.
 */
import { svg } from '../../core/dom.js';
import { alarmClock, rubberDuck, sock } from '../shared/decoyIcons.js';

const icon = (...children) =>
  svg('svg', { viewBox: '0 0 64 64', 'aria-hidden': 'true', focusable: 'false' }, ...children);
const path = (d, attrs) => svg('path', { d, ...attrs });
const ellipse = (cx, cy, rx, ry, fill, attrs) => svg('ellipse', { cx, cy, rx, ry, fill, ...attrs });
const rect = (x, y, width, height, fill, attrs) => svg('rect', { x, y, width, height, fill, ...attrs });
const line = (d, color, width = 3) =>
  path(d, { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

// ---------- Zutaten ----------

function flour() {
  return icon(
    path('M16 16 H48 L51 57 H13 Z', { fill: '#f6ecd6', stroke: '#c4ab78', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
    path('M16 16 L19 8 H45 L48 16 Z', { fill: '#e8d6ae', stroke: '#c4ab78', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
    // Ähre
    line('M32 49 V30', '#b9822f', 2.4),
    ellipse(28.5, 33, 3, 5, '#e3a93c', { transform: 'rotate(-28 28.5 33)' }),
    ellipse(35.5, 33, 3, 5, '#e3a93c', { transform: 'rotate(28 35.5 33)' }),
    ellipse(29, 41, 3, 5, '#e3a93c', { transform: 'rotate(-28 29 41)' }),
    ellipse(35, 41, 3, 5, '#e3a93c', { transform: 'rotate(28 35 41)' }),
    ellipse(32, 27, 2.8, 5, '#e3a93c'),
  );
}

function eggs() {
  return icon(
    ellipse(23, 38, 12, 15, '#fff4de', { stroke: '#d3b283', 'stroke-width': 2.5 }),
    ellipse(42, 41, 12, 15, '#f7e3bf', { stroke: '#d3b283', 'stroke-width': 2.5 }),
    path('M16 33 Q17 26 22 24', { fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }),
    path('M36 36 Q37 30 41 28', { fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }),
  );
}

function milk() {
  return icon(
    rect(17, 24, 30, 33, '#ffffff', { stroke: '#6f9fd1', 'stroke-width': 2.5, rx: 2 }),
    path('M17 24 L24 11 H40 L47 24 Z', { fill: '#cfe1f5', stroke: '#6f9fd1', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
    rect(17, 35, 30, 11, '#6f9fd1'),
    path('M32 37 C29.5 40.5 29.5 44 32 44 C34.5 44 34.5 40.5 32 37 Z', { fill: '#fff' }),
  );
}

function butter() {
  return icon(
    path('M10 30 L22 19 H54 L42 30 Z', { fill: '#fdeba0', stroke: '#d9b53a', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    path('M10 30 H42 V51 H10 Z', { fill: '#f7d65a', stroke: '#d9b53a', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    path('M42 30 L54 19 V40 L42 51 Z', { fill: '#ebc13c', stroke: '#d9b53a', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    line('M16 38 H34', '#e1b73b', 2),
  );
}

/**
 * needed = gehört ins Rezept.  oops = lustiger Kommentar, wenn man die Ablenkung versucht.
 * `order` bei den Zutaten ist die Reihenfolge auf der Rezeptkarte.
 */
export const INGREDIENTS = [
  { key: 'flour', label: 'Flour', needed: true, order: 1, icon: flour },
  { key: 'eggs', label: 'Eggs', needed: true, order: 2, icon: eggs, plural: true },
  { key: 'milk', label: 'Milk', needed: true, order: 3, icon: milk },
  { key: 'butter', label: 'Butter', needed: true, order: 4, icon: butter },
  { key: 'sock', label: 'Sock', needed: false, icon: sock, oops: "Socks don't belong in pancakes!" },
  { key: 'duck', label: 'Rubber duck', needed: false, icon: rubberDuck, oops: 'The duck is not an ingredient.' },
  { key: 'clock', label: 'Alarm clock', needed: false, icon: alarmClock, oops: 'No time for the alarm clock!' },
];
