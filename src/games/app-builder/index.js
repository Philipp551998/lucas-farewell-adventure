/*
 * Checkpoint 7 – Philipp: App-in-an-App Builder
 *
 * Ein kleiner "App-Baukasten": Vier Karten – Idea, Design, Build, Launch – kommen in die
 * richtige Reihenfolge, dann startet "Run App" die Mini-App und schaltet die Nachricht frei.
 * Erfolg (Excel): alle vier Schritte in der richtigen Reihenfolge und die Mini-App erfolgreich ausführen.
 * Bewusst ein augenzwinkernder App-Builder, keine echte Programmierkomplexität.
 *
 * Bedienung – Ziehen hat immer eine Tipp-Alternative:
 *   - Ziehen: Karte in einen Slot ziehen (auf einen belegten Slot = Tausch)
 *   - Tippen: Karte aus dem Werkzeugkasten antippen → sie landet im ersten freien Slot;
 *             eine platzierte Karte antippen → sie geht zurück in den Kasten
 *   - Tastatur: Karten und Slots sind echte Buttons (Tab + Enter/Leertaste)
 *
 * Fehler = "Run App" mit falscher Reihenfolge. Die falsch platzierten Karten werden markiert und
 * wandern zurück in den Kasten, richtig platzierte bleiben liegen. Kein Game Over.
 * Der Hinweis lässt den nächsten richtigen Schritt (Karte und Slot) aufleuchten.
 */
import './app-builder.css';
import { h } from '../../core/dom.js';
import { STEPS } from './icons.js';

const DRAG_THRESHOLD_PX = 8;
const HINT_DURATION_MS = 6000;
const WRONG_SHOW_MS = 900;
const RUN_STEP_MS = 420;

const TEXT = {
  windowTitle: 'My First App',
  toolbox: 'Toolbox',
  toolboxEmpty: 'All steps are in your app!',
  slotEmpty: (n) => `Step ${n}`,
  hintTap: 'Drag a step into the builder – or just tap it.',
  almostFull: 'All four steps are in. Ready to run?',
  runLabel: '▶ Run App',
  runNeedsSteps: 'Fill all four steps first',
  running: 'Running…',
  wrong: 'Not quite! The marked steps go back to the toolbox.',
  live: 'Your app is live!',
  slotLabel: (n, label) => `Step ${n}: ${label ?? 'empty'}`,
  toolboxLabel: 'Toolbox with the four app steps',
};

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default {
  meta: {
    instructions:
      'Time to build an app inside an app! Put the four steps – Idea, Design, Build, Launch – in the right order, then press “Run App”. Drag the steps or simply tap them.',
    hint: 'Every app starts with an idea and ends with a launch.',
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
    const temporary = new Set(); // Zieh-Geister, die beim Beenden entfernt werden

    let finished = false;
    let destroyed = false;
    let hintTimer = 0;

    // ----- Karten -----
    const cards = STEPS.map((step) => ({
      step,
      el: h(
        'button',
        { type: 'button', class: 'ab-card', dataset: { key: step.key } },
        h('span', { class: 'ab-card__icon', 'aria-hidden': 'true' }, step.icon()),
        h('span', { class: 'ab-card__label' }, step.label),
      ),
    }));

    // Reihenfolge im Kasten: gemischt, aber nie schon die richtige Lösung
    let pool = shuffle(cards);
    while (pool.every((card, i) => card.step === STEPS[i])) pool = shuffle(cards);
    const slots = [null, null, null, null];

    // ----- Oberfläche -----
    const slotEls = STEPS.map((_, i) => h('li', { class: 'ab-slot', dataset: { index: String(i) } }));
    const poolEl = h('div', { class: 'ab-pool', role: 'group', 'aria-label': TEXT.toolboxLabel });
    const caption = h('p', { class: 'ab-caption', role: 'status', 'aria-live': 'polite' }, TEXT.hintTap);
    const runButton = h(
      'button',
      { type: 'button', class: 'btn btn--primary btn--large ab-run', onclick: run },
      TEXT.runLabel,
    );
    const live = h('p', { class: 'ab-live', hidden: true }, h('span', { 'aria-hidden': 'true' }, '🚀 '), TEXT.live);

    container.append(
      h(
        'section',
        { class: 'ab-window' },
        h(
          'header',
          { class: 'ab-window__bar' },
          h('span', { class: 'ab-window__dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
          h('span', { class: 'ab-window__title' }, TEXT.windowTitle),
        ),
        h('ol', { class: 'ab-slots' }, slotEls),
        live,
      ),
      caption,
      h('div', { class: 'ab-toolbox' }, h('p', { class: 'eyebrow' }, TEXT.toolbox), poolEl),
      runButton,
    );

    const filledCount = () => slots.filter(Boolean).length;
    const isCorrect = (index) => slots[index]?.step === STEPS[index];

    function render() {
      slotEls.forEach((slotEl, i) => {
        const card = slots[i];
        slotEl.className = 'ab-slot';
        slotEl.dataset.filled = String(Boolean(card));
        slotEl.setAttribute('aria-label', TEXT.slotLabel(i + 1, card?.step.label));
        slotEl.replaceChildren(
          h('span', { class: 'ab-slot__number', 'aria-hidden': 'true' }, String(i + 1)),
          card ? card.el : h('span', { class: 'ab-slot__empty' }, TEXT.slotEmpty(i + 1)),
        );
      });
      poolEl.replaceChildren(...(pool.length ? pool.map((card) => card.el) : [h('p', { class: 'ab-pool__empty' }, TEXT.toolboxEmpty)]));

      const ready = filledCount() === STEPS.length && !finished;
      runButton.disabled = !ready;
      runButton.textContent = finished ? TEXT.running : ready ? TEXT.runLabel : TEXT.runNeedsSteps;
      if (!finished) caption.textContent = ready ? TEXT.almostFull : TEXT.hintTap;
    }

    // ----- Karten bewegen -----
    const locationOf = (card) => {
      const index = slots.indexOf(card);
      return index >= 0 ? { slot: index } : { pool: true };
    };

    function removeFromWherever(card) {
      const index = slots.indexOf(card);
      if (index >= 0) slots[index] = null;
      pool = pool.filter((entry) => entry !== card);
    }

    function putBackInPool(card) {
      removeFromWherever(card);
      pool.push(card);
    }

    function placeInSlot(card, targetIndex) {
      const origin = locationOf(card);
      const occupant = slots[targetIndex];
      removeFromWherever(card);
      if (occupant && occupant !== card) {
        // Tausch: der bisherige Bewohner nimmt den Platz der gezogenen Karte ein
        if (origin.slot !== undefined) slots[origin.slot] = occupant;
        else {
          pool = pool.filter((entry) => entry !== occupant);
          pool.push(occupant);
        }
      }
      slots[targetIndex] = card;
    }

    /** Tippen: aus dem Kasten → erster freier Slot; aus einem Slot → zurück in den Kasten. */
    function toggle(card) {
      if (finished || destroyed) return;
      const origin = locationOf(card);
      if (origin.slot !== undefined) {
        putBackInPool(card);
      } else {
        const free = slots.indexOf(null);
        if (free < 0) return;
        placeInSlot(card, free);
      }
      render();
    }

    // ----- Ziehen & Tippen -----
    function slotIndexAt(x, y) {
      const hit = slotEls.findIndex((slotEl) => {
        const r = slotEl.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top - 4 && y <= r.bottom + 4;
      });
      return hit;
    }

    function makeGhost(card) {
      const rect = card.el.getBoundingClientRect();
      const ghost = card.el.cloneNode(true);
      ghost.classList.add('ab-ghost');
      ghost.removeAttribute('data-key');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.width = `${rect.width}px`;
      document.body.append(ghost);
      temporary.add(ghost);
      return ghost;
    }

    function moveGhost(ghost, x, y) {
      ghost.style.transform = `translate3d(${x - ghost.offsetWidth / 2}px, ${y - ghost.offsetHeight / 2}px, 0) scale(1.06)`;
    }

    function bindCard(card) {
      const el = card.el;
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let ghost = null;

      const endDrag = () => {
        if (ghost) {
          ghost.remove();
          temporary.delete(ghost);
        }
        ghost = null;
        el.classList.remove('ab-card--dragging');
        slotEls.forEach((slotEl) => slotEl.classList.remove('ab-slot--over'));
      };

      el.addEventListener('pointerdown', (event) => {
        if (finished || pointerId !== null) return;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        el.setPointerCapture(event.pointerId);
      });

      el.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId) return;
        if (!ghost && Math.hypot(event.clientX - startX, event.clientY - startY) > DRAG_THRESHOLD_PX) {
          ghost = makeGhost(card);
          el.classList.add('ab-card--dragging');
        }
        if (ghost) {
          moveGhost(ghost, event.clientX, event.clientY);
          const over = slotIndexAt(event.clientX, event.clientY);
          slotEls.forEach((slotEl, i) => slotEl.classList.toggle('ab-slot--over', i === over));
        }
      });

      el.addEventListener('pointerup', (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        const wasDragging = Boolean(ghost);
        const target = wasDragging ? slotIndexAt(event.clientX, event.clientY) : -1;
        endDrag();
        if (!wasDragging) toggle(card); // kurzes Antippen = Tipp-Alternative
        else if (target >= 0 && !finished) {
          placeInSlot(card, target);
          render();
        }
        // Daneben losgelassen: nichts ändert sich.
      });

      el.addEventListener('pointercancel', (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        endDrag();
      });

      // Tastatur / Screenreader: click ohne Zeigerbewegung (detail 0)
      el.addEventListener('click', (event) => {
        if (event.detail === 0) toggle(card);
      });
    }
    cards.forEach(bindCard);

    // ----- Run App -----
    function run() {
      if (finished || destroyed || filledCount() < STEPS.length) return;

      const wrongIndexes = slots.map((_, i) => i).filter((i) => !isCorrect(i));
      if (wrongIndexes.length === 0) {
        runSuccess();
        return;
      }

      ctx.mistake();
      caption.textContent = TEXT.wrong;
      wrongIndexes.forEach((i) => slotEls[i].classList.add('ab-slot--wrong'));
      runButton.disabled = true;
      later(() => {
        wrongIndexes.forEach((i) => slots[i] && putBackInPool(slots[i]));
        render();
        caption.textContent = TEXT.wrong;
      }, WRONG_SHOW_MS);
    }

    function runSuccess() {
      finished = true;
      clearHint();
      runButton.disabled = true;
      runButton.textContent = TEXT.running;
      caption.textContent = '';
      STEPS.forEach((_, i) => {
        later(() => slotEls[i].classList.add('ab-slot--done'), RUN_STEP_MS * (i + 1));
      });
      later(() => {
        live.hidden = false; // Banner im Fenster ist ein role=status-Bereich für Screenreader
        live.setAttribute('role', 'status');
        runButton.textContent = '✓';
      }, RUN_STEP_MS * (STEPS.length + 1));
      later(() => ctx.complete(), RUN_STEP_MS * (STEPS.length + 1) + 1000);
    }

    // ----- Hinweis: nächster richtiger Schritt leuchtet (Slot und Karte) -----
    function clearHint() {
      container.querySelectorAll('.ab-hint').forEach((el) => el.classList.remove('ab-hint'));
    }

    ctx.onHint(() => {
      if (finished) return;
      clearHint();
      const index = STEPS.findIndex((_, i) => !isCorrect(i));
      if (index < 0) return;
      slotEls[index].classList.add('ab-hint');
      const card = cards.find((entry) => entry.step === STEPS[index]);
      card.el.classList.add('ab-hint');
      clearTimeout(hintTimer);
      timers.delete(hintTimer);
      hintTimer = later(clearHint, HINT_DURATION_MS);
    });

    render();

    return () => {
      destroyed = true;
      timers.forEach(clearTimeout);
      timers.clear();
      temporary.forEach((node) => node.remove());
      temporary.clear();
    };
  },
};
