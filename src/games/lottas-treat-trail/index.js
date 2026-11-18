/*
 * Checkpoint 4 – Borke: Lotta's Treat Trail
 *
 * Lotta läuft über einen kleinen Park-Weg (7 × 8 Felder) zur Zielflagge und sammelt
 * unterwegs Knochen. Es liegen 6 Knochen aus, benötigt werden mindestens 4.
 * Erfolg (Excel): Ziel erreichen und mindestens 4 Leckerlis sammeln; kein hartes Fail-State.
 *
 * Steuerung – jede Variante geht ohne Wischen:
 *   - Tippen: auf ein freies Feld tippen, Lotta läuft automatisch den kürzesten Weg dorthin
 *   - Pfeil-Buttons: ein Schritt pro Antippen, gedrückt halten läuft weiter
 *   - Tastatur: Pfeiltasten
 *
 * Fehler = gegen Baum, Busch oder Teich laufen (oder darauf tippen). Das ist freundlich
 * gemeint: kurzer Spruch, kein Game Over. Das Ziel ohne genug Leckerlis zu erreichen ist
 * kein Fehler – Lotta sagt nur, wie viele noch fehlen. Der Hinweis zeigt den Weg zum
 * nächsten Knochen (oder zum Ziel, wenn schon genug gesammelt sind).
 *
 * Der Park-Plan ist eine eigene Gestaltung (kein Inhalt aus der Excel).
 */
import './lottas-treat-trail.css';
import { h } from '../../core/dom.js';
import { bone, bush, flag, lotta, pond, tree } from './icons.js';

// Legende: '.' Weg · '#' Baum/Busch · '~' Teich · 'T' Knochen · 'S' Start · 'F' Ziel
const MAP = [
  '.T#...F',
  '.#..#..',
  '...#T.#',
  '~.#...T',
  'T...~~.',
  '.#T#...',
  '.....#T',
  'S#.#...',
];

const TREATS_NEEDED = 4;
const STEP_MS = 150; // Zeit pro Feld beim Laufen
const HOLD_REPEAT_MS = 170; // Wiederholung beim Gedrückthalten der Pfeil-Buttons
const BUMP_COOLDOWN_MS = 600; // so oft kann ein "Anstoßen" als Fehler zählen
const MAX_CELL_PX = 46;
const HINT_DURATION_MS = 6000;

const DIRECTIONS = {
  up: { dr: -1, dc: 0, label: 'Move up', symbol: '▲' },
  left: { dr: 0, dc: -1, label: 'Move left', symbol: '◀' },
  down: { dr: 1, dc: 0, label: 'Move down', symbol: '▼' },
  right: { dr: 0, dc: 1, label: 'Move right', symbol: '▶' },
};

const TEXT = {
  treats: 'Treats',
  treatsCount: (n) => `${n} collected, ${TREATS_NEEDED} needed`,
  bump: {
    tree: "Lotta can't walk through a tree!",
    bush: 'Oops – that is a very thick bush!',
    pond: 'Splash? Lotta would rather stay dry.',
  },
  needMore: (missing) => `Lotta wants ${missing} more treat${missing === 1 ? '' : 's'} first!`,
  fieldLabel: 'Park map. Tap a free spot to send Lotta there, or use the arrow buttons.',
};

// ----- Karte einlesen -----
const ROWS = MAP.length;
const COLS = MAP[0].length;

const GRID = MAP.map((row, r) =>
  [...row].map((symbol, c) => {
    const blocked = symbol === '#' || symbol === '~';
    return {
      symbol,
      r,
      c,
      walkable: !blocked,
      kind: symbol === '~' ? 'pond' : symbol === '#' ? ((r + c) % 2 === 0 ? 'tree' : 'bush') : 'path',
      treat: symbol === 'T',
      start: symbol === 'S',
      finish: symbol === 'F',
    };
  }),
);

const START = GRID.flat().find((cell) => cell.start);
const FINISH = GRID.flat().find((cell) => cell.finish);
const keyOf = (r, c) => `${r},${c}`;
const inBounds = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

/** Kürzester Weg (ohne Startfeld) oder null, wenn nicht erreichbar. */
function findPath(from, to) {
  const queue = [from];
  const cameFrom = new Map([[keyOf(from.r, from.c), null]]);
  while (queue.length) {
    const current = queue.shift();
    if (current.r === to.r && current.c === to.c) {
      const path = [];
      for (let node = current; cameFrom.get(keyOf(node.r, node.c)); node = cameFrom.get(keyOf(node.r, node.c))) {
        path.unshift(node);
      }
      return path;
    }
    for (const { dr, dc } of Object.values(DIRECTIONS)) {
      const r = current.r + dr;
      const c = current.c + dc;
      if (!inBounds(r, c) || !GRID[r][c].walkable || cameFrom.has(keyOf(r, c))) continue;
      cameFrom.set(keyOf(r, c), current);
      queue.push(GRID[r][c]);
    }
  }
  return null;
}

export default {
  meta: {
    instructions:
      'Guide Lotta through the park to the finish flag and collect at least 4 treats on the way. Tap where she should go – or use the arrow buttons.',
    hint: 'Follow the sandy path and take little detours for the bones. Collect 4 treats, then head for the flag.',
  },

  mount(container, ctx) {
    const timers = new Set();
    const intervals = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    let position = { r: START.r, c: START.c };
    let queue = []; // Felder, die Lotta beim automatischen Laufen noch abläuft
    let walking = false;
    let collected = 0;
    let finished = false;
    let destroyed = false;
    let lastMoveAt = 0;
    let lastBumpAt = 0;
    let messageTimer = 0;
    let hintTimer = 0;
    const treatEls = new Map();
    const cellEls = GRID.map(() => []);

    // ----- Oberfläche -----
    const cellSize = Math.min(MAX_CELL_PX, Math.floor((container.clientWidth || 344) / COLS));
    const dots = Array.from({ length: TREATS_NEEDED }, () => h('span', { class: 'tt-dot', 'aria-hidden': 'true' }));
    const treatLabel = h('span', { class: 'tt-count', role: 'status' }, TEXT.treatsCount(0));
    const message = h('p', { class: 'tt-message', role: 'status', hidden: true });
    const lottaEl = h('div', { class: 'tt-lotta', 'aria-hidden': 'true' }, lotta());

    const grid = h(
      'div',
      { class: 'tt-grid', style: { '--tt-cell': `${cellSize}px` } },
      GRID.flat().map((cell) => {
        const el = h(
          'div',
          { class: `tt-cell tt-cell--${cell.kind}${cell.finish ? ' tt-cell--finish' : ''}`, 'aria-hidden': 'true' },
          cell.kind === 'tree' && tree(),
          cell.kind === 'bush' && bush(),
          cell.kind === 'pond' && pond(),
          cell.finish && h('span', { class: 'tt-flag' }, flag()),
        );
        cellEls[cell.r][cell.c] = el;
        if (cell.treat) {
          const treatEl = h('span', { class: 'tt-treat' }, bone());
          el.append(treatEl);
          treatEls.set(keyOf(cell.r, cell.c), treatEl);
        }
        return el;
      }),
      lottaEl,
    );

    const field = h(
      'div',
      { class: 'tt-field', role: 'group', 'aria-label': TEXT.fieldLabel },
      message,
      grid,
    );

    const pad = h(
      'div',
      { class: 'tt-pad' },
      ['left', 'up', 'down', 'right'].map((name) =>
        h(
          'button',
          { type: 'button', class: 'btn btn--soft tt-pad__button', 'aria-label': DIRECTIONS[name].label, dataset: { dir: name } },
          DIRECTIONS[name].symbol,
        ),
      ),
    );

    container.append(
      h(
        'div',
        { class: 'tt-status' },
        h('span', { class: 'tt-status__icon', 'aria-hidden': 'true' }, bone()),
        h('div', { class: 'tt-dots' }, dots),
        treatLabel,
      ),
      field,
      pad,
    );

    function updateStatus() {
      dots.forEach((dot, i) => dot.classList.toggle('is-full', i < collected));
      treatLabel.textContent = TEXT.treatsCount(collected);
    }

    function say(text, ms = 2200) {
      message.textContent = text;
      message.hidden = false;
      clearTimeout(messageTimer);
      timers.delete(messageTimer);
      messageTimer = later(() => (message.hidden = true), ms);
    }

    function placeLotta() {
      lottaEl.style.transform = `translate3d(${position.c * cellSize}px, ${position.r * cellSize}px, 0)`;
    }
    placeLotta();

    // ----- Bewegen -----
    function arrive() {
      const key = keyOf(position.r, position.c);
      const treatEl = treatEls.get(key);
      if (treatEl) {
        treatEls.delete(key);
        treatEl.classList.add('tt-treat--got');
        later(() => treatEl.remove(), 350);
        collected += 1;
        updateStatus();
      }

      if (position.r === FINISH.r && position.c === FINISH.c) {
        if (collected >= TREATS_NEEDED) {
          win();
        } else {
          queue = [];
          say(TEXT.needMore(TREATS_NEEDED - collected));
        }
      }
    }

    function moveTo(cell) {
      position = { r: cell.r, c: cell.c };
      lastMoveAt = performance.now();
      lottaEl.classList.remove('tt-lotta--bump');
      placeLotta();
      arrive();
    }

    function bump(r, c) {
      queue = [];
      const cell = inBounds(r, c) ? GRID[r][c] : null;
      say(cell ? TEXT.bump[cell.kind] : TEXT.bump.bush, 1800);
      lottaEl.classList.remove('tt-lotta--bump');
      void lottaEl.offsetWidth; // Animation neu starten
      lottaEl.classList.add('tt-lotta--bump');
      const now = performance.now();
      if (now - lastBumpAt > BUMP_COOLDOWN_MS) {
        lastBumpAt = now;
        ctx.mistake();
      }
    }

    function walkTick() {
      if (finished || destroyed || queue.length === 0) {
        walking = false;
        return;
      }
      moveTo(queue.shift());
      later(walkTick, STEP_MS);
    }

    function walkAlong(path) {
      queue = path;
      if (!walking && queue.length) {
        walking = true;
        walkTick();
      }
    }

    /** Ein einzelner Schritt per Pfeil-Button oder Pfeiltaste. */
    function stepInDirection(name) {
      if (finished || destroyed) return;
      const { dr, dc } = DIRECTIONS[name];
      const r = position.r + dr;
      const c = position.c + dc;
      if (!inBounds(r, c) || !GRID[r][c].walkable) {
        bump(r, c);
        return;
      }
      if (performance.now() - lastMoveAt < STEP_MS - 10) return; // Tastaturwiederholung bremsen
      queue = [];
      moveTo(GRID[r][c]);
    }

    function onFieldClick(event) {
      if (finished || destroyed) return;
      const rect = grid.getBoundingClientRect();
      const c = Math.floor((event.clientX - rect.left) / cellSize);
      const r = Math.floor((event.clientY - rect.top) / cellSize);
      if (!inBounds(r, c)) return;
      const target = GRID[r][c];
      if (!target.walkable) {
        bump(r, c);
        return;
      }
      if (r === position.r && c === position.c) return;
      const path = findPath(position, target);
      if (path) walkAlong(path);
    }
    field.addEventListener('click', onFieldClick);

    // Pfeil-Buttons: antippen = ein Schritt, halten = weiterlaufen
    pad.querySelectorAll('button').forEach((button) => {
      const name = button.dataset.dir;
      let repeat = 0;
      const stop = () => {
        clearInterval(repeat);
        intervals.delete(repeat);
        repeat = 0;
      };
      button.addEventListener('pointerdown', () => {
        stepInDirection(name);
        stop();
        repeat = setInterval(() => stepInDirection(name), HOLD_REPEAT_MS);
        intervals.add(repeat);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((type) => button.addEventListener(type, stop));
      // Tastatur / Screenreader: click ohne Zeigerbewegung (detail 0)
      button.addEventListener('click', (event) => {
        if (event.detail === 0) stepInDirection(name);
      });
    });

    const KEY_TO_DIRECTION = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const onKeyDown = (event) => {
      const name = KEY_TO_DIRECTION[event.key];
      if (!name) return;
      event.preventDefault();
      stepInDirection(name);
    };
    window.addEventListener('keydown', onKeyDown);

    // ----- Ziel erreicht -----
    function win() {
      finished = true;
      queue = [];
      lottaEl.classList.add('tt-lotta--cheer');
      later(() => ctx.complete(), 800);
    }

    // ----- Hinweis: Weg zum nächsten Knochen (oder zum Ziel) -----
    function clearHint() {
      grid.querySelectorAll('.tt-cell--hint').forEach((el) => el.classList.remove('tt-cell--hint'));
    }

    ctx.onHint(() => {
      clearHint();
      let target = FINISH;
      if (collected < TREATS_NEEDED) {
        const candidates = [...treatEls.keys()]
          .map((key) => {
            const [r, c] = key.split(',').map(Number);
            return findPath(position, GRID[r][c]);
          })
          .filter(Boolean)
          .sort((a, b) => a.length - b.length);
        if (candidates[0]) target = candidates[0][candidates[0].length - 1];
      }
      const path = findPath(position, target) ?? [];
      path.forEach((cell) => cellEls[cell.r][cell.c].classList.add('tt-cell--hint'));
      clearTimeout(hintTimer);
      timers.delete(hintTimer);
      hintTimer = later(clearHint, HINT_DURATION_MS);
    });

    // ----- Aufräumen -----
    return () => {
      destroyed = true;
      timers.forEach(clearTimeout);
      timers.clear();
      intervals.forEach(clearInterval);
      intervals.clear();
      window.removeEventListener('keydown', onKeyDown);
    };
  },
};
