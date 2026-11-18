/*
 * Checkpoint 2 – Murielle: Recipe Rush
 *
 * Rezept: Pancakes. Die vier Zutaten (Flour, Eggs, Milk, Butter) gehören in die Schüssel,
 * lustige Ablenkungen (Sock, Rubber duck, Alarm clock) nicht.
 * Erfolg (Excel): alle benötigten Zutaten korrekt platzieren; Hinweis nach zwei Fehlern.
 *
 * Bedienung – Drag-and-drop hat immer eine Tipp-Alternative:
 *   - Ziehen: Zutat mit Finger/Maus in die Schüssel ziehen
 *   - Tippen/Klicken: Zutat antippen, sie springt in die Schüssel
 *   - Tastatur: Zutaten sind echte Buttons (Tab + Enter/Leertaste)
 *
 * Fehler = eine Ablenkung in die Schüssel legen (ziehen oder tippen). Kein Zeitdruck,
 * kein Game Over. Der Hinweis lässt die richtigen Zutaten kurz aufleuchten.
 */
import './recipe-rush.css';
import { h } from '../../core/dom.js';
import { INGREDIENTS } from './icons.js';

const DRAG_THRESHOLD_PX = 8; // darunter gilt eine Berührung als Tippen
const DROP_PADDING_PX = 18; // großzügige Zielfläche um die Schüssel
const HINT_DURATION_MS = 6000;

const NEEDED = INGREDIENTS.filter((item) => item.needed).sort((a, b) => a.order - b.order);

const TEXT = {
  recipeEyebrow: "Today's recipe",
  recipeTitle: 'Pancakes',
  recipeNote: 'Add every ingredient on the list to the bowl.',
  start: 'Drag an ingredient into the bowl – or just tap it.',
  added: (item) => `${item.label} ${item.plural ? 'are' : 'is'} in!`,
  ready: 'Pancake batter is ready!',
  shelfLabel: 'Ingredient shelf',
  bowlLabel: 'Mixing bowl',
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
      'Time for pancakes! Drag the right ingredients into the bowl – or simply tap them. Watch out for sneaky extras on the shelf!',
    hint: 'Pancakes need flour, eggs, milk and butter. The sock, the duck and the alarm clock can stay on the shelf.',
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
    const temporary = new Set(); // Zieh-Geister und Flug-Kopien, die beim Beenden entfernt werden

    let placed = 0;
    let finished = false;
    let hintTimer = 0;

    // ----- Rezeptkarte -----
    const slots = new Map(
      NEEDED.map((item) => [
        item.key,
        h(
          'li',
          { class: 'rr-slot' },
          h('span', { class: 'rr-slot__icon', 'aria-hidden': 'true' }),
          h('span', { class: 'rr-slot__name' }, item.label),
          h('span', { class: 'rr-slot__done sr-only' }, ' – added'),
        ),
      ]),
    );

    const recipe = h(
      'section',
      { class: 'rr-recipe' },
      h(
        'header',
        { class: 'rr-recipe__head' },
        h('p', { class: 'eyebrow' }, TEXT.recipeEyebrow),
        h('h2', null, TEXT.recipeTitle),
      ),
      h('ol', { class: 'rr-slots' }, [...slots.values()]),
      h('p', { class: 'rr-recipe__note' }, TEXT.recipeNote),
    );

    // ----- Schüssel -----
    const batter = h('div', { class: 'rr-bowl__batter' });
    const bowl = h(
      'div',
      { class: 'rr-bowl', role: 'img', 'aria-label': TEXT.bowlLabel },
      h('div', { class: 'rr-bowl__inside' }, batter),
    );
    const caption = h('p', { class: 'rr-caption', role: 'status', 'aria-live': 'polite' }, TEXT.start);

    // ----- Regal -----
    const tiles = shuffle(INGREDIENTS).map((def) => ({
      def,
      used: false,
      el: h(
        'button',
        {
          type: 'button',
          class: 'rr-tile',
          'aria-label': def.label,
          dataset: { needed: String(def.needed), key: def.key },
        },
        h('span', { class: 'rr-tile__art' }, def.icon()),
        h('span', { class: 'rr-tile__label' }, def.label),
      ),
    }));
    const shelf = h('div', { class: 'rr-shelf', role: 'group', 'aria-label': TEXT.shelfLabel }, tiles.map((t) => t.el));

    container.append(recipe, h('div', { class: 'rr-stage' }, bowl, caption), shelf);

    // ----- Hilfsfunktionen -----
    const say = (text, tone = '') => {
      caption.textContent = text;
      caption.className = `rr-caption${tone ? ` rr-caption--${tone}` : ''}`;
    };

    const centerOf = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

    function overBowl(x, y) {
      const r = bowl.getBoundingClientRect();
      return (
        x >= r.left - DROP_PADDING_PX &&
        x <= r.right + DROP_PADDING_PX &&
        y >= r.top - DROP_PADDING_PX &&
        y <= r.bottom + DROP_PADDING_PX
      );
    }

    function makeGhost(tile) {
      const rect = tile.el.getBoundingClientRect();
      const ghost = tile.el.cloneNode(true);
      ghost.classList.add('rr-ghost');
      ghost.removeAttribute('aria-label');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.width = `${rect.width}px`;
      document.body.append(ghost);
      temporary.add(ghost);
      return ghost;
    }

    function moveGhost(ghost, x, y) {
      const w = ghost.offsetWidth;
      const hgt = ghost.offsetHeight;
      ghost.style.transform = `translate3d(${x - w / 2}px, ${y - hgt / 2}px, 0) scale(1.08)`;
    }

    function dropGhost(ghost) {
      ghost.remove();
      temporary.delete(ghost);
    }

    /** Die Zutat fliegt in die Schüssel (übersprungen bei "reduzierte Bewegung"). */
    function flyIntoBowl(tile, from) {
      if (ctx.reducedMotion || !tile.el.animate) return;
      const target = centerOf(bowl.getBoundingClientRect());
      const start = centerOf(from);
      const copy = tile.el.cloneNode(true);
      copy.classList.add('rr-ghost', 'rr-ghost--fly');
      copy.setAttribute('aria-hidden', 'true');
      copy.style.width = `${from.width}px`;
      document.body.append(copy);
      temporary.add(copy);
      const place = (x, y, scale) =>
        `translate3d(${x - from.width / 2}px, ${y - from.height / 2}px, 0) scale(${scale})`;
      const animation = copy.animate(
        [
          { transform: place(start.x, start.y, 1), opacity: 1 },
          { transform: place(target.x, target.y - 30, 0.35), opacity: 0.2 },
        ],
        { duration: 380, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)', fill: 'forwards' },
      );
      animation.onfinish = () => {
        copy.remove();
        temporary.delete(copy);
      };
    }

    // ----- Zutat hinzufügen -----
    function tryAdd(tile, from = tile.el.getBoundingClientRect()) {
      if (finished || tile.used) return;

      if (!tile.def.needed) {
        ctx.mistake();
        tile.el.classList.remove('rr-tile--oops');
        void tile.el.offsetWidth; // Animation neu starten
        tile.el.classList.add('rr-tile--oops');
        say(tile.def.oops, 'oops');
        return;
      }

      tile.used = true;
      tile.el.classList.add('rr-tile--used');
      tile.el.disabled = true;
      flyIntoBowl(tile, from);

      placed += 1;
      batter.style.setProperty('--level', `${(placed / NEEDED.length) * 100}%`);
      bowl.classList.add('rr-bowl--filled');
      bowl.classList.remove('rr-bowl--plop');
      void bowl.offsetWidth;
      bowl.classList.add('rr-bowl--plop');

      const slot = slots.get(tile.def.key);
      slot.classList.add('is-done');
      slot.querySelector('.rr-slot__icon').replaceChildren(tile.def.icon());

      if (placed === NEEDED.length) {
        finished = true;
        bowl.classList.add('rr-bowl--done');
        say(TEXT.ready, 'good');
        later(() => ctx.complete(), 1000);
      } else {
        say(TEXT.added(tile.def), 'good');
      }
    }

    // ----- Ziehen, Tippen, Tastatur -----
    function bindTile(tile) {
      const el = tile.el;
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let ghost = null;

      const endDrag = () => {
        if (ghost) dropGhost(ghost);
        ghost = null;
        el.classList.remove('rr-tile--dragging');
        bowl.classList.remove('rr-bowl--over');
      };

      el.addEventListener('pointerdown', (event) => {
        if (finished || tile.used || pointerId !== null) return;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        el.setPointerCapture(event.pointerId);
      });

      el.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId) return;
        if (!ghost && Math.hypot(event.clientX - startX, event.clientY - startY) > DRAG_THRESHOLD_PX) {
          ghost = makeGhost(tile);
          el.classList.add('rr-tile--dragging');
        }
        if (ghost) {
          moveGhost(ghost, event.clientX, event.clientY);
          bowl.classList.toggle('rr-bowl--over', overBowl(event.clientX, event.clientY));
        }
      });

      el.addEventListener('pointerup', (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        const wasDragging = Boolean(ghost);
        const ghostRect = ghost?.getBoundingClientRect();
        const dropped = wasDragging && overBowl(event.clientX, event.clientY);
        endDrag();
        if (!wasDragging) tryAdd(tile); // kurzes Antippen = Tipp-Alternative
        else if (dropped) tryAdd(tile, ghostRect);
        // Außerhalb losgelassen: Zutat bleibt im Regal, kein Fehler.
      });

      el.addEventListener('pointercancel', (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        endDrag();
      });

      // Tastatur / Screenreader: click ohne Zeigerbewegung (detail 0). Berührungen und Mausklicks
      // wurden schon über die Pointer-Ereignisse behandelt.
      el.addEventListener('click', (event) => {
        if (event.detail === 0) tryAdd(tile);
      });
    }

    tiles.forEach(bindTile);

    // ----- Hinweis: richtige Zutaten leuchten -----
    ctx.onHint(() => {
      shelf.classList.add('rr-shelf--hint');
      clearTimeout(hintTimer);
      timers.delete(hintTimer);
      hintTimer = later(() => shelf.classList.remove('rr-shelf--hint'), HINT_DURATION_MS);
    });

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
      temporary.forEach((node) => node.remove());
      temporary.clear();
    };
  },
};
