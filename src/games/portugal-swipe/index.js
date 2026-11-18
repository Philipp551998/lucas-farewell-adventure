/*
 * Checkpoint 1 – Joana: Portugal Swipe Challenge
 *
 * Portugiesische Motive und deutsche Ablenkungen fallen herunter.
 * Erfolg (Excel): 8 portugiesische Motive sammeln, höchstens 3 Fehler.
 *
 * Bedienung – alles funktioniert auch ohne Wischen:
 *   - Wischen: mit dem Finger/der Maus über die Motive fahren
 *   - Tippen/Klicken: ein Motiv direkt antippen
 *   - Tastatur: Motive sind echte Buttons (Tab + Enter/Leertaste)
 *
 * Fehler = ein deutsches Motiv erwischen. Verpasste portugiesische Motive kosten nichts.
 * Beim 4. Fehler startet die Runde sanft neu (etwas langsamer) – es gibt kein Game Over;
 * Hinweis und Skip kommen von der GameShell.
 *
 * Eigenes Konzept, keine Kopie eines bestehenden Spiels.
 */
import './portugal-swipe.css';
import { h } from '../../core/dom.js';
import { ITEMS } from './icons.js';

const GOAL = 8; // zu sammelnde portugiesische Motive
const MAX_SLIPS = 3; // erlaubte Fehler pro Runde
const ITEM_WIDTH = 76;
const HINT_DURATION_MS = 6000;
const SWIPE_STEP_PX = 14; // Abstand der Prüfpunkte entlang einer Wischlinie
const HIT_PADDING_PX = 6; // großzügige Trefferfläche

const TEXT = {
  catchLabel: '✓ Catch',
  avoidLabel: '✕ Avoid',
  collected: (n) => `Collected ${n} / ${GOAL}`,
  oops: 'Oops',
  freshStart: 'Fresh start – a bit slower this time. You can do it!',
  fieldLabel: 'Play area. Swipe through or tap the Portuguese items.',
};

const PORTUGUESE = ITEMS.filter((item) => item.portuguese);
const DECOYS = ITEMS.filter((item) => !item.portuguese);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function legendRow(kind, label, items) {
  return h(
    'div',
    { class: `pt-legend__row pt-legend__row--${kind}` },
    h('span', { class: 'pt-legend__title' }, label),
    items.map((item) =>
      h('span', { class: 'pt-chip' }, h('span', { class: 'pt-chip__icon' }, item.icon()), item.label),
    ),
  );
}

export default {
  meta: {
    instructions:
      'Portuguese treasures and German decoys fall from the sky. Swipe through – or simply tap – only the Portuguese ones. Catch 8 and the message is yours!',
    hint: 'Pastel de nata, beach, sun, sardine and azulejo are Portuguese. Pretzel, lederhosen and snowflake are the German decoys – let those fall.',
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

    const items = new Set();
    let collected = 0;
    let slips = 0;
    let restarts = 0;
    let finished = false;
    let destroyed = false;
    let raf = 0;
    let lastFrame = 0;
    let spawnIn = 0.4;
    let decoyStreak = 0;
    let lastKey = null;
    let hintTimer = 0;
    let swiping = false;
    let lastPoint = null;

    // ----- Oberfläche -----
    const dots = Array.from({ length: GOAL }, () => h('span', { class: 'pt-dot' }));
    const pips = Array.from({ length: MAX_SLIPS }, () => h('span', { class: 'pt-pip', 'aria-hidden': 'true' }));
    const countLabel = h('span', { class: 'pt-count', role: 'status' }, TEXT.collected(0));
    const message = h('p', { class: 'pt-message', role: 'status', hidden: true });
    const field = h('div', { class: 'pt-field', role: 'group', 'aria-label': TEXT.fieldLabel }, message);

    container.append(
      h(
        'div',
        { class: 'pt-legend' },
        legendRow('good', TEXT.catchLabel, PORTUGUESE),
        legendRow('bad', TEXT.avoidLabel, DECOYS),
      ),
      h(
        'div',
        { class: 'pt-status' },
        h('div', { class: 'pt-progress', 'aria-hidden': 'true' }, dots),
        countLabel,
        h('div', { class: 'pt-slips' }, h('span', { class: 'pt-slips__label' }, TEXT.oops), pips),
      ),
      field,
    );

    function updateStatus() {
      dots.forEach((dot, i) => dot.classList.toggle('is-full', i < collected));
      pips.forEach((pip, i) => pip.classList.toggle('is-used', i < slips));
      countLabel.textContent = TEXT.collected(collected);
    }

    function flash(className, ms = 380) {
      field.classList.remove(className);
      void field.offsetWidth; // Animation neu starten
      field.classList.add(className);
      later(() => field.classList.remove(className), ms);
    }

    // ----- Motive -----
    function place(item) {
      item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    }

    function remove(item) {
      items.delete(item);
      item.el.remove();
    }

    function spawn() {
      // Nie mehr als 2 Ablenkungen hintereinander, aber ruhig öfter Portugiesisch.
      const wantPortuguese = decoyStreak >= 2 || Math.random() < 0.62;
      let def;
      do {
        def = wantPortuguese ? pick(PORTUGUESE) : pick(DECOYS);
      } while (def.key === lastKey && (wantPortuguese ? PORTUGUESE : DECOYS).length > 1);
      lastKey = def.key;
      decoyStreak = def.portuguese ? 0 : decoyStreak + 1;

      const width = field.clientWidth;
      const speedFactor = Math.max(0.6, 1 - 0.14 * restarts) * (ctx.reducedMotion ? 0.65 : 1);
      const item = {
        def,
        done: false,
        x: 4 + Math.random() * Math.max(0, width - ITEM_WIDTH - 8),
        y: -96,
        speed: 118 * speedFactor * (0.88 + Math.random() * 0.26),
        el: null,
      };

      item.el = h(
        'button',
        {
          type: 'button',
          class: 'pt-item',
          'aria-label': def.label,
          dataset: { portuguese: String(def.portuguese), key: def.key },
          onclick: () => hit(item), // Tastatur / Screenreader / Fallback
        },
        h(
          'span',
          { class: 'pt-item__body' },
          h('span', { class: 'pt-item__art' }, def.icon()),
          h('span', { class: 'pt-item__label' }, def.label),
        ),
      );
      place(item);
      field.append(item.el);
      items.add(item);
    }

    // ----- Treffer -----
    function hit(item) {
      if (item.done || finished || destroyed) return;
      item.done = true;
      item.def.portuguese ? caught(item) : slipped(item);
    }

    function caught(item) {
      collected += 1;
      updateStatus();
      item.el.classList.add('pt-item--got');
      later(() => remove(item), 280);
      if (collected >= GOAL) win();
    }

    function slipped(item) {
      slips += 1;
      updateStatus();
      ctx.mistake();
      item.el.classList.add('pt-item--oops');
      flash('pt-field--oops');
      later(() => remove(item), 420);
      if (slips > MAX_SLIPS) freshStart();
    }

    function freshStart() {
      restarts += 1;
      later(() => {
        if (finished || destroyed) return;
        collected = 0;
        slips = 0;
        decoyStreak = 0;
        spawnIn = 1.2;
        items.forEach(remove);
        updateStatus();
        message.textContent = TEXT.freshStart;
        message.hidden = false;
        later(() => (message.hidden = true), 3200);
      }, 450);
    }

    function win() {
      finished = true;
      swiping = false;
      later(() => {
        items.forEach(remove);
        ctx.complete();
      }, 520);
    }

    // ----- Wischen & Tippen (Pointer Events: Maus, Touch, Stift) -----
    function hitAt(x, y) {
      for (const item of [...items]) {
        if (item.done) continue;
        const r = item.el.getBoundingClientRect();
        if (
          x >= r.left - HIT_PADDING_PX &&
          x <= r.right + HIT_PADDING_PX &&
          y >= r.top - HIT_PADDING_PX &&
          y <= r.bottom + HIT_PADDING_PX
        ) {
          hit(item);
        }
      }
    }

    function sweep(from, to) {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(distance / SWIPE_STEP_PX));
      for (let i = 1; i <= steps; i += 1) {
        hitAt(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
      }
    }

    const onPointerDown = (event) => {
      swiping = true;
      lastPoint = { x: event.clientX, y: event.clientY };
      hitAt(lastPoint.x, lastPoint.y);
    };
    const onPointerMove = (event) => {
      if (!swiping) return;
      const point = { x: event.clientX, y: event.clientY };
      sweep(lastPoint, point);
      lastPoint = point;
    };
    const stopSwiping = () => {
      swiping = false;
    };

    field.addEventListener('pointerdown', onPointerDown);
    field.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopSwiping);
    window.addEventListener('pointercancel', stopSwiping);

    // ----- Hinweis: portugiesische Motive leuchten kurz auf -----
    ctx.onHint(() => {
      field.classList.add('pt-field--hint');
      clearTimeout(hintTimer);
      timers.delete(hintTimer);
      hintTimer = later(() => field.classList.remove('pt-field--hint'), HINT_DURATION_MS);
    });

    // ----- Spielschleife -----
    function frame(now) {
      if (destroyed) return;
      const dt = Math.min((now - lastFrame) / 1000, 0.05); // nach Tab-Wechsel kein Sprung
      lastFrame = now;

      if (!finished) {
        spawnIn -= dt;
        if (spawnIn <= 0) {
          spawn();
          spawnIn = (ctx.reducedMotion ? 1.5 : 0.95) * (0.85 + Math.random() * 0.3);
        }
      }

      const fieldHeight = field.clientHeight;
      for (const item of [...items]) {
        if (item.done) continue;
        item.y += item.speed * dt;
        place(item);
        if (item.y > fieldHeight) remove(item); // verpasst: kostet nichts
      }
      raf = requestAnimationFrame(frame);
    }

    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);

    // ----- Aufräumen -----
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers.clear();
      window.removeEventListener('pointerup', stopSwiping);
      window.removeEventListener('pointercancel', stopSwiping);
    };
  },
};
