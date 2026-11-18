/*
 * Checkpoint 3 – Ilonka: Wedding Catch
 *
 * Ein kleiner Korb fängt den Blumenstrauß und zwei Ringe; lustige Ablenkungen
 * (Sock, Rubber duck, Alarm clock) fallen mit.
 * Erfolg (Excel): Strauß und zwei Ringe fangen, bevor die Zeit abläuft; großzügiger
 * Neustart oder Hinweis. Entscheidung von Philipp: 45 Sekunden, bei Zeitablauf sanfter Neustart.
 *
 * Steuerung – Wischen/Ziehen hat immer eine Tipp-Alternative:
 *   - Ziehen: Finger über das Feld ziehen, der Korb folgt (Maus: einfach bewegen)
 *   - Tippen: auf eine Stelle im Feld tippen, der Korb gleitet dorthin
 *   - Pfeil-Buttons unter dem Feld (antippen = ein Schritt, halten = weiter)
 *   - Tastatur: Pfeiltasten links/rechts
 *
 * Fehler = eine Ablenkung fangen. Verpasste Ringe/Sträuße kosten nichts, sie fallen neu.
 * Bei Zeitablauf startet die Runde neu (etwas langsamer, mehr gute Items) – kein Game Over.
 * Hinweis und Skip kommen von der GameShell. Nur das fröhliche Motiv, keine privaten Details.
 */
import './wedding-catch.css';
import { h } from '../../core/dom.js';
import { basket as basketIcon, BOUQUET, DECOYS, RING } from './icons.js';

const TIME_LIMIT = 45; // Sekunden
const RINGS_NEEDED = 2;
const ITEM_SIZE = 56;
const BASKET_WIDTH = 92;
const BASKET_HEIGHT = 62;
const BASKET_RIM = 24; // Höhe des Korbrands, gemessen von der Oberkante des Korbs
const BASKET_BOTTOM_GAP = 6;
const STEPS_PER_FIELD = 6; // Pfeil-Buttons: ein Schritt = Feldbreite / 6
const HINT_DURATION_MS = 6000;

const TEXT = {
  bouquet: 'Bouquet',
  rings: 'Rings',
  seconds: (s) => `${s} s`,
  timeLeft: 'Time left',
  fieldLabel: 'Play area. Drag or tap to move the basket, or use the arrow buttons.',
  left: 'Move basket left',
  right: 'Move basket right',
  timeUp: "Time's up – fresh start, a little slower this time!",
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function marks(count) {
  return Array.from({ length: count }, () => h('span', { class: 'wc-mark', 'aria-hidden': 'true' }));
}

function goalChip(def, label, count) {
  const dots = marks(count);
  const chip = h(
    'div',
    { class: 'wc-goal' },
    h('span', { class: 'wc-goal__icon' }, def.icon()),
    h('span', { class: 'wc-goal__name' }, label),
    h('span', { class: 'wc-goal__marks' }, dots),
  );
  return { chip, dots };
}

export default {
  meta: {
    instructions:
      'Steer the little basket to catch the bouquet and two rings – and let the funny decoys fall past! Drag, tap or use the arrow buttons. You have 45 seconds; if time runs out, you simply get a fresh start.',
    hint: 'You only need the bouquet and two rings. The sock, the duck and the alarm clock are decoys – steer clear of them.',
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

    const items = new Set();
    let gotBouquet = false;
    let rings = 0;
    let restarts = 0;
    let timeLeft = TIME_LIMIT;
    let shownSeconds = TIME_LIMIT;
    let finished = false;
    let destroyed = false;
    let raf = 0;
    let lastFrame = 0;
    let spawnIn = 0.5;
    let decoyStreak = 0;
    let lastDecoyKey = null;
    let pressed = false;
    let basketX = null; // wird beim ersten Frame in die Mitte gesetzt
    let targetX = null;
    let hintTimer = 0;
    let messageTimer = 0;

    // ----- Oberfläche -----
    const bouquetGoal = goalChip(BOUQUET, TEXT.bouquet, 1);
    const ringGoal = goalChip(RING, TEXT.rings, RINGS_NEEDED);
    const timerBar = h('div', { class: 'wc-timer__bar' });
    const timerText = h('span', { class: 'wc-timer__text' }, TEXT.seconds(TIME_LIMIT));
    const message = h('p', { class: 'wc-message', role: 'status', hidden: true });
    const basket = h('div', { class: 'wc-basket', 'aria-hidden': 'true' }, basketIcon());
    const field = h('div', { class: 'wc-field', role: 'group', 'aria-label': TEXT.fieldLabel }, message, basket);

    const leftButton = h('button', { type: 'button', class: 'btn btn--soft wc-step', 'aria-label': TEXT.left }, '◀');
    const rightButton = h('button', { type: 'button', class: 'btn btn--soft wc-step', 'aria-label': TEXT.right }, '▶');

    container.append(
      h('div', { class: 'wc-goals' }, bouquetGoal.chip, ringGoal.chip),
      h(
        'div',
        { class: 'wc-timer', role: 'timer', 'aria-label': TEXT.timeLeft },
        h('div', { class: 'wc-timer__track', 'aria-hidden': 'true' }, timerBar),
        timerText,
      ),
      field,
      h('div', { class: 'wc-controls' }, leftButton, rightButton),
    );

    function updateGoals() {
      bouquetGoal.dots.forEach((dot, i) => dot.classList.toggle('is-full', i < (gotBouquet ? 1 : 0)));
      ringGoal.dots.forEach((dot, i) => dot.classList.toggle('is-full', i < rings));
    }

    function updateTimer() {
      timerBar.style.transform = `scaleX(${Math.max(0, timeLeft / TIME_LIMIT)})`;
      timerBar.classList.toggle('is-low', timeLeft <= 10);
      const seconds = Math.max(0, Math.ceil(timeLeft));
      if (seconds !== shownSeconds) {
        shownSeconds = seconds;
        timerText.textContent = TEXT.seconds(seconds);
      }
    }

    function showMessage(text, ms) {
      message.textContent = text;
      message.hidden = false;
      clearTimeout(messageTimer);
      timers.delete(messageTimer);
      messageTimer = later(() => (message.hidden = true), ms);
    }

    function flash(className, ms = 380) {
      field.classList.remove(className);
      void field.offsetWidth; // Animation neu starten
      field.classList.add(className);
      later(() => field.classList.remove(className), ms);
    }

    // ----- Korb -----
    const maxBasketX = () => Math.max(0, field.clientWidth - BASKET_WIDTH);

    function placeBasket() {
      basket.style.transform = `translate3d(${basketX}px, 0, 0)`;
    }

    function step(direction) {
      if (finished || destroyed || targetX === null) return;
      targetX = clamp(targetX + (direction * field.clientWidth) / STEPS_PER_FIELD, 0, maxBasketX());
    }

    const followPointer = (event) => {
      const rect = field.getBoundingClientRect();
      targetX = clamp(event.clientX - rect.left - BASKET_WIDTH / 2, 0, maxBasketX());
    };

    const onPointerDown = (event) => {
      pressed = true;
      followPointer(event);
    };
    const onPointerMove = (event) => {
      if (pressed || event.pointerType === 'mouse') followPointer(event);
    };
    const stopPressing = () => {
      pressed = false;
    };
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'ArrowRight') step(1);
      else return;
      event.preventDefault();
    };

    field.addEventListener('pointerdown', onPointerDown);
    field.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopPressing);
    window.addEventListener('pointercancel', stopPressing);
    window.addEventListener('keydown', onKeyDown);

    // Pfeil-Buttons: antippen = ein Schritt, gedrückt halten = weiterlaufen.
    function bindStepButton(button, direction) {
      let repeat = 0;
      const stop = () => {
        clearInterval(repeat);
        intervals.delete(repeat);
        repeat = 0;
      };
      button.addEventListener('pointerdown', () => {
        step(direction);
        stop();
        repeat = setInterval(() => step(direction), 110);
        intervals.add(repeat);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((name) => button.addEventListener(name, stop));
      // Tastatur / Screenreader: click ohne Zeigerbewegung (detail 0)
      button.addEventListener('click', (event) => {
        if (event.detail === 0) step(direction);
      });
    }
    bindStepButton(leftButton, -1);
    bindStepButton(rightButton, 1);

    // ----- Fallende Items -----
    function place(item) {
      item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    }

    function remove(item) {
      items.delete(item);
      item.el.remove();
    }

    const inFlight = (def) => [...items].some((item) => !item.done && item.def === def);

    function spawn() {
      const candidates = [];
      if (!gotBouquet && !inFlight(BOUQUET)) candidates.push(BOUQUET);
      if (rings < RINGS_NEEDED) candidates.push(RING);

      const neededOnScreen = [...items].some((item) => !item.done && item.def.needed);
      const goodWeight = Math.min(0.75, 0.55 + 0.1 * restarts);
      const wantGood = candidates.length > 0 && (!neededOnScreen || decoyStreak >= 2 || Math.random() < goodWeight);

      let def;
      if (wantGood) {
        def = pick(candidates);
        decoyStreak = 0;
      } else {
        do {
          def = pick(DECOYS);
        } while (def.key === lastDecoyKey);
        lastDecoyKey = def.key;
        decoyStreak += 1;
      }

      const speedFactor = Math.max(0.6, 1 - 0.14 * restarts) * (ctx.reducedMotion ? 0.7 : 1);
      const item = {
        def,
        done: false,
        x: 2 + Math.random() * Math.max(0, field.clientWidth - ITEM_SIZE - 4),
        y: -ITEM_SIZE - 6,
        speed: 130 * speedFactor * (0.9 + Math.random() * 0.25),
        el: h(
          'div',
          { class: 'wc-item', 'aria-hidden': 'true', dataset: { needed: String(def.needed), key: def.key } },
          h('span', { class: 'wc-item__body' }, h('span', { class: 'wc-item__art' }, def.icon())),
        ),
      };
      place(item);
      field.insertBefore(item.el, basket); // Korb liegt immer oben
      items.add(item);
    }

    // ----- Fangen -----
    function catchItem(item) {
      item.done = true;
      basket.classList.remove('wc-basket--bounce');
      void basket.offsetWidth;
      basket.classList.add('wc-basket--bounce');

      if (item.def.needed) {
        if (item.def === BOUQUET) gotBouquet = true;
        else rings += 1;
        updateGoals();
        item.el.classList.add('wc-item--got');
        later(() => remove(item), 300);
        if (gotBouquet && rings >= RINGS_NEEDED) win();
      } else {
        ctx.mistake();
        item.el.classList.add('wc-item--oops');
        showMessage(item.def.oops, 1700);
        flash('wc-field--oops');
        later(() => remove(item), 420);
      }
    }

    function win() {
      finished = true;
      pressed = false;
      basket.classList.add('wc-basket--cheer');
      later(() => {
        items.forEach(remove);
        ctx.complete();
      }, 700);
    }

    function timeUp() {
      restarts += 1;
      timeLeft = TIME_LIMIT;
      gotBouquet = false;
      rings = 0;
      decoyStreak = 0;
      spawnIn = 1.2;
      items.forEach(remove);
      updateGoals();
      updateTimer();
      showMessage(TEXT.timeUp, 3400);
    }

    // ----- Hinweis: Strauß und Ringe leuchten -----
    ctx.onHint(() => {
      field.classList.add('wc-field--hint');
      clearTimeout(hintTimer);
      timers.delete(hintTimer);
      hintTimer = later(() => field.classList.remove('wc-field--hint'), HINT_DURATION_MS);
    });

    // ----- Spielschleife -----
    function frame(now) {
      if (destroyed) return;
      const dt = Math.min((now - lastFrame) / 1000, 0.05); // nach Tab-Wechsel kein Sprung
      lastFrame = now;

      if (basketX === null) {
        basketX = targetX = maxBasketX() / 2;
      }
      // Korb gleitet weich zum Ziel (Tippen = Gleiten an die Stelle, Ziehen = Folgen)
      basketX += (targetX - basketX) * Math.min(1, dt * 14);
      placeBasket();

      if (!finished) {
        timeLeft -= dt;
        updateTimer();
        if (timeLeft <= 0) timeUp();

        spawnIn -= dt;
        if (spawnIn <= 0) {
          spawn();
          spawnIn = 0.85 * (0.85 + Math.random() * 0.3);
        }
      }

      const fieldHeight = field.clientHeight;
      const rimY = fieldHeight - BASKET_HEIGHT - BASKET_BOTTOM_GAP + BASKET_RIM;
      for (const item of [...items]) {
        if (item.done) continue;
        item.y += item.speed * dt;
        place(item);

        const centerX = item.x + ITEM_SIZE / 2;
        const inRimWindow = item.y + ITEM_SIZE >= rimY && item.y < rimY + 18;
        const aboveBasket = centerX > basketX + 6 && centerX < basketX + BASKET_WIDTH - 6;
        if (!finished && inRimWindow && aboveBasket) catchItem(item);
        else if (item.y > fieldHeight) remove(item); // verpasst: kostet nichts
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
      intervals.forEach(clearInterval);
      intervals.clear();
      window.removeEventListener('pointerup', stopPressing);
      window.removeEventListener('pointercancel', stopPressing);
      window.removeEventListener('keydown', onKeyDown);
    };
  },
};
