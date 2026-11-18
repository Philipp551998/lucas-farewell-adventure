/*
 * Checkpoint 8 – Açelya: Python-Snake (ersetzt das Excel-Konzept "Python Path Decoder")
 *
 * Konzept von Philipp: Eine Schlange frisst sehr bekannte, aufpoppende Python-Begriffe
 * (print, run, JSON, environment, terminal – "etc."; ergänzt um import, function, variable,
 * damit eine Runde etwa 30–60 Sekunden dauert) und wird nach jedem Begriff größer.
 * Berührt sie ihren eigenen Körper/Schwanz, bevor alle Begriffe gefressen sind, ist die Runde
 * verloren.
 *
 * Anpassung an die App-Regeln (kein hartes Game Over): "Verloren" startet sofort eine neue
 * Runde (etwas langsamer) und zählt als Fehler → Hinweis nach 2 Fehlern, Skip ab mehr als 3.
 *
 * Spielregeln:
 *   - Feld 10 × 10, die Ränder sind durchlässig (die Schlange kommt auf der anderen Seite heraus),
 *     nur der eigene Körper ist gefährlich
 *   - Die Begriffe poppen nacheinander in der Reihenfolge der Liste auf, jeder macht die Schlange
 *     um 2 Felder länger
 *   - Die Schlange startet erst, wenn man die erste Richtung gibt; sie kann nicht direkt
 *     umdrehen
 *
 * Bedienung – Wischen hat immer eine Tipp-Alternative:
 *   - Wischen: über das Feld wischen, um zu lenken
 *   - Pfeil-Buttons unter dem Feld (antippen)
 *   - Tastatur: Pfeiltasten
 *
 * Hinweis: Ein gepunkteter Weg zum nächsten Begriff (weicht dem Körper aus).
 */
import './python-path.css';
import { h, svg } from '../../core/dom.js';

const COLS = 10;
const ROWS = 10;
const MAX_CELL_PX = 34;
const TERMS = ['print', 'run', 'JSON', 'environment', 'terminal', 'import', 'function', 'variable'];
const START_LENGTH = 3;
const GROW_PER_TERM = 2;
const BASE_STEP_MS = 190;
const SWIPE_MIN_PX = 22;
const HINT_DURATION_MS = 6000;
const LOSS_PAUSE_MS = 1000;

const DIRECTIONS = {
  up: { dr: -1, dc: 0, angle: -90, label: 'Steer up', symbol: '▲' },
  left: { dr: 0, dc: -1, angle: 180, label: 'Steer left', symbol: '◀' },
  down: { dr: 1, dc: 0, angle: 90, label: 'Steer down', symbol: '▼' },
  right: { dr: 0, dc: 1, angle: 0, label: 'Steer right', symbol: '▶' },
};

const TEXT = {
  fileName: 'python_snake.py',
  length: 'snake.length',
  left: 'terms_left',
  start: 'Swipe or tap an arrow to start!',
  lost: 'Oops – the snake bit its own tail! Fresh start, a bit slower.',
  fieldLabel: 'Snake play area. Swipe or use the arrow buttons to steer.',
  eaten: (term, n) => `${term} eaten, ${n} of ${TERMS.length}`,
};

const wrap = (value, max) => (value + max) % max;
const same = (a, b) => a.r === b.r && a.c === b.c;

function headIcon() {
  return svg(
    'svg',
    { viewBox: '0 0 32 32', 'aria-hidden': 'true', focusable: 'false', style: { overflow: 'visible' } },
    svg('path', { d: 'M27 16 H33 M33 16 l3 -3 M33 16 l3 3', fill: 'none', stroke: '#d8412f', 'stroke-width': 2, 'stroke-linecap': 'round' }),
    svg('rect', { x: 2, y: 3, width: 28, height: 26, rx: 11, fill: '#3776ab', stroke: '#2a5a86', 'stroke-width': 2 }),
    svg('circle', { cx: 20, cy: 11, r: 4.4, fill: '#ffd43b' }),
    svg('circle', { cx: 20, cy: 21, r: 4.4, fill: '#ffd43b' }),
    svg('circle', { cx: 21.5, cy: 11, r: 1.9, fill: '#1d2b36' }),
    svg('circle', { cx: 21.5, cy: 21, r: 1.9, fill: '#1d2b36' }),
  );
}

export default {
  meta: {
    instructions:
      'Python is hungry! Steer the snake to eat the pop-up Python words – print, run, JSON, environment and more. It grows with every word, so do not bite your own tail! Swipe on the field or use the arrow buttons.',
    hint: 'Head for the glowing word and plan a little curve so you do not run into your own tail. The hint shows a dotted path to the next word.',
  },

  mount(container, ctx) {
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    // ----- Spielzustand -----
    let snake = [];
    let direction = DIRECTIONS.right;
    let queue = []; // gewünschte Richtungen (max. 2), werden pro Schritt abgearbeitet
    let food = null; // { r, c }
    let eaten = 0;
    let pendingGrow = 0;
    let started = false;
    let paused = false;
    let finished = false;
    let destroyed = false;
    let restarts = 0;
    let accumulator = 0;
    let lastFrame = 0;
    let raf = 0;
    let hintUntil = 0;
    let messageTimer = 0;

    // ----- Oberfläche -----
    const cell = Math.min(MAX_CELL_PX, Math.floor((container.clientWidth || 344) / COLS));
    const gridSize = cell * COLS;

    const lengthValue = h('b', null, String(START_LENGTH));
    const leftValue = h('b', null, String(TERMS.length));
    const status = h('p', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
    const chips = TERMS.map((term) => h('li', { class: 'ps-term' }, term));
    const message = h('p', { class: 'ps-message', role: 'status', hidden: true });
    const startNote = h('p', { class: 'ps-start' }, TEXT.start);
    const foodLabel = h('span', { class: 'ps-food__label' });
    const foodEl = h('div', { class: 'ps-food', 'aria-hidden': 'true' }, foodLabel);
    const dotsLayer = h('div', { class: 'ps-dots', 'aria-hidden': 'true' });
    const segmentLayer = h('div', { class: 'ps-snake', 'aria-hidden': 'true' });

    const grid = h(
      'div',
      { class: 'ps-grid', style: { '--ps-cell': `${cell}px`, width: `${gridSize}px`, height: `${gridSize}px` } },
      dotsLayer,
      foodEl,
      segmentLayer,
    );
    const field = h(
      'div',
      { class: 'ps-field', role: 'group', 'aria-label': TEXT.fieldLabel },
      message,
      startNote,
      grid,
    );

    const pad = h(
      'div',
      { class: 'ps-pad' },
      ['left', 'up', 'down', 'right'].map((name) =>
        h(
          'button',
          { type: 'button', class: 'btn btn--soft ps-pad__button', 'aria-label': DIRECTIONS[name].label, dataset: { dir: name } },
          DIRECTIONS[name].symbol,
        ),
      ),
    );

    container.append(
      h(
        'section',
        { class: 'ps-code' },
        h('p', { class: 'ps-code__tab' }, TEXT.fileName),
        h('p', { class: 'ps-code__line' }, h('span', { class: 'ps-kw' }, TEXT.length), ' = ', lengthValue, '   ', h('span', { class: 'ps-kw' }, TEXT.left), ' = ', leftValue),
        h('ol', { class: 'ps-terms', 'aria-label': 'Words to eat' }, chips),
        status,
      ),
      field,
      pad,
    );

    function say(text, ms = 2800) {
      message.textContent = text;
      message.hidden = false;
      clearTimeout(messageTimer);
      timers.delete(messageTimer);
      messageTimer = later(() => (message.hidden = true), ms);
    }

    function updateCode() {
      lengthValue.textContent = String(snake.length);
      leftValue.textContent = String(TERMS.length - eaten);
      chips.forEach((chip, i) => {
        chip.classList.toggle('is-done', i < eaten);
        chip.classList.toggle('is-next', i === eaten && !finished);
      });
    }

    // ----- Zeichnen -----
    const segmentEls = [];

    function renderSnake() {
      while (segmentEls.length < snake.length) {
        const el = h('div', { class: 'ps-seg' });
        segmentEls.push(el);
        segmentLayer.append(el);
      }
      while (segmentEls.length > snake.length) segmentEls.pop().remove();

      snake.forEach((part, i) => {
        const el = segmentEls[i];
        const isHead = i === 0;
        const isTail = i === snake.length - 1 && !isHead;
        el.className = `ps-seg ${isHead ? 'ps-seg--head' : isTail ? 'ps-seg--tail' : i % 2 ? 'ps-seg--b' : 'ps-seg--a'}`;
        el.dataset.r = String(part.r);
        el.dataset.c = String(part.c);
        const rotate = isHead ? ` rotate(${direction.angle}deg)` : '';
        el.style.transform = `translate3d(${part.c * cell}px, ${part.r * cell}px, 0)${rotate}`;
        if (isHead && !el.firstChild) el.append(headIcon());
        if (!isHead && el.firstChild) el.replaceChildren();
      });
    }

    function renderFood() {
      if (!food) {
        foodEl.hidden = true;
        return;
      }
      foodEl.hidden = false;
      foodLabel.textContent = TERMS[eaten];
      foodEl.dataset.r = String(food.r);
      foodEl.dataset.c = String(food.c);
      foodEl.style.left = `${food.c * cell + cell / 2}px`;
      foodEl.style.top = `${food.r * cell + cell / 2}px`;
      // Beschriftung nicht über den Feldrand hinausragen lassen
      const half = foodEl.offsetWidth / 2;
      const centerX = food.c * cell + cell / 2;
      const shift = Math.max(half - centerX, 0) - Math.max(centerX + half - gridSize, 0);
      foodEl.style.setProperty('--ps-shift', `${shift}px`);
    }

    // ----- Spielfeld-Logik -----
    function freeCell() {
      const free = [];
      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < COLS; c += 1) {
          if (!snake.some((part) => part.r === r && part.c === c)) free.push({ r, c });
        }
      }
      return free[Math.floor(Math.random() * free.length)];
    }

    function resetRound() {
      const middle = Math.floor(ROWS / 2);
      snake = Array.from({ length: START_LENGTH }, (_, i) => ({ r: middle, c: 4 - i }));
      direction = DIRECTIONS.right;
      queue = [];
      eaten = 0;
      pendingGrow = 0;
      accumulator = 0;
      started = false;
      paused = false;
      food = freeCell();
      startNote.hidden = false;
      renderSnake();
      renderFood();
      updateCode();
      renderHint();
    }

    function stepMs() {
      return BASE_STEP_MS * Math.min(1.7, 1 + 0.18 * restarts) * (ctx.reducedMotion ? 1.25 : 1);
    }

    function lose() {
      paused = true;
      ctx.mistake();
      restarts += 1;
      say(TEXT.lost, LOSS_PAUSE_MS + 1600);
      segmentEls.forEach((el) => el.classList.add('ps-seg--lost'));
      later(resetRound, LOSS_PAUSE_MS);
    }

    function win() {
      finished = true;
      paused = true;
      renderHint();
      updateCode();
      segmentEls.forEach((el) => el.classList.add('ps-seg--cheer'));
      later(() => ctx.complete(), 900);
    }

    function step() {
      // Richtung übernehmen
      if (queue.length) direction = queue.shift();

      const head = snake[0];
      const next = { r: wrap(head.r + direction.dr, ROWS), c: wrap(head.c + direction.dc, COLS) };
      const eating = food && same(next, food);
      if (eating) pendingGrow += GROW_PER_TERM;
      const growing = pendingGrow > 0;

      // Der Schwanz rückt nach, wenn die Schlange nicht gerade wächst → dieses Feld ist dann frei.
      const body = growing ? snake : snake.slice(0, -1);
      if (body.some((part) => same(part, next))) {
        lose();
        return;
      }

      snake.unshift(next);
      if (growing) pendingGrow -= 1;
      else snake.pop();

      if (eating) {
        eaten += 1;
        status.textContent = TEXT.eaten(TERMS[eaten - 1], eaten);
        food = null;
        updateCode();
        if (eaten >= TERMS.length) {
          renderSnake();
          renderFood();
          win();
          return;
        }
        food = freeCell();
        renderFood();
      }
      renderSnake();
      renderHint();
    }

    // ----- Lenken -----
    function steer(name) {
      if (finished || destroyed || paused) return;
      const wanted = DIRECTIONS[name];
      const reference = queue.length ? queue[queue.length - 1] : direction;
      const isReverse = wanted.dr === -reference.dr && wanted.dc === -reference.dc;
      const isSame = wanted === reference;

      if (!started) {
        started = true;
        startNote.hidden = true;
        lastFrame = performance.now();
        if (!isReverse && !isSame) queue.push(wanted);
        return;
      }
      if (isReverse || isSame || queue.length >= 2) return;
      queue.push(wanted);
    }

    // Wischen (Pointer Events: Touch, Maus, Stift)
    let swipeFrom = null;
    const onPointerDown = (event) => {
      swipeFrom = { x: event.clientX, y: event.clientY };
    };
    const onPointerMove = (event) => {
      if (!swipeFrom) return;
      const dx = event.clientX - swipeFrom.x;
      const dy = event.clientY - swipeFrom.y;
      if (Math.hypot(dx, dy) < SWIPE_MIN_PX) return;
      steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
      swipeFrom = { x: event.clientX, y: event.clientY }; // weitere Wischer ohne Absetzen möglich
    };
    const onPointerEnd = () => {
      swipeFrom = null;
    };
    field.addEventListener('pointerdown', onPointerDown);
    field.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);

    // Pfeil-Buttons (antippen)
    pad.querySelectorAll('button').forEach((button) => {
      const name = button.dataset.dir;
      button.addEventListener('pointerdown', () => steer(name));
      // Tastatur / Screenreader: click ohne Zeigerbewegung (detail 0)
      button.addEventListener('click', (event) => {
        if (event.detail === 0) steer(name);
      });
    });

    const KEY_TO_DIRECTION = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const onKeyDown = (event) => {
      const name = KEY_TO_DIRECTION[event.key];
      if (!name) return;
      event.preventDefault();
      steer(name);
    };
    window.addEventListener('keydown', onKeyDown);

    // ----- Hinweis: gepunkteter Weg zum nächsten Begriff -----
    function findPath() {
      if (!food) return [];
      const blocked = new Set(snake.slice(0, -1).map((part) => `${part.r},${part.c}`));
      const start = snake[0];
      const queueBfs = [start];
      const cameFrom = new Map([[`${start.r},${start.c}`, null]]);
      while (queueBfs.length) {
        const current = queueBfs.shift();
        if (same(current, food)) {
          const path = [];
          for (let node = current; cameFrom.get(`${node.r},${node.c}`); node = cameFrom.get(`${node.r},${node.c}`)) {
            path.unshift(node);
          }
          return path.slice(0, -1); // das Ziel selbst trägt schon das Wort
        }
        for (const { dr, dc } of Object.values(DIRECTIONS)) {
          const next = { r: wrap(current.r + dr, ROWS), c: wrap(current.c + dc, COLS) };
          const key = `${next.r},${next.c}`;
          if (blocked.has(key) || cameFrom.has(key)) continue;
          cameFrom.set(key, current);
          queueBfs.push(next);
        }
      }
      return [];
    }

    function renderHint() {
      const active = performance.now() < hintUntil && !finished && !paused;
      foodEl.classList.toggle('ps-food--hint', active);
      if (!active) {
        dotsLayer.replaceChildren();
        return;
      }
      dotsLayer.replaceChildren(
        ...findPath().map((part) =>
          h('span', { class: 'ps-dot', style: { left: `${part.c * cell}px`, top: `${part.r * cell}px` } }),
        ),
      );
    }

    ctx.onHint(() => {
      hintUntil = performance.now() + HINT_DURATION_MS;
      renderHint();
      later(renderHint, HINT_DURATION_MS + 50); // Weg wieder ausblenden
    });

    // ----- Spielschleife -----
    function frame(now) {
      if (destroyed) return;
      const dt = Math.min(now - lastFrame, 120); // nach Tab-Wechsel kein Sprung
      lastFrame = now;
      if (started && !paused && !finished) {
        accumulator += dt;
        const every = stepMs();
        while (accumulator >= every && !paused && !finished) {
          accumulator -= every;
          step();
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resetRound();
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);

    // ----- Aufräumen -----
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers.clear();
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  },
};
