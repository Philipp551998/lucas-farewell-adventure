/*
 * GameShell – gemeinsamer Rahmen um alle acht Spiele.
 *
 * Die Shell übernimmt alles, was für jedes Spiel gleich ist:
 *   - Kopfzeile mit Zurück-Link und Skip
 *   - Intro-Karte mit kurzer Anleitung
 *   - Fehlerzähler (ctx.mistake) → Hinweis ab 2 Fehlern, hervorgehobenes Skip ab mehr als 3
 *   - Erfolgs-Modal (ctx.complete) → Weiterleitung zur Nachricht
 *   - Fehlerbehandlung: Lässt sich ein Spiel nicht laden oder startet es nicht,
 *     bleibt "Skip" möglich – die Nachricht ist immer erreichbar.
 *
 * Ein Spiel selbst baut nur sein Spielfeld (Vertrag: siehe games/registry.js).
 */
import { HINT_AFTER_MISTAKES, SKIP_HIGHLIGHT_AFTER_MISTAKES } from '../config.js';
import { h } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { progress } from '../core/store.js';
import { CHECKPOINTS } from '../data/checkpoints.js';
import { COPY } from '../data/copy.js';
import { loadGame } from '../games/registry.js';
import { confirmDialog } from './dialog.js';
import { createStationArt } from './stationArt.js';
import { showSuccess } from './successModal.js';

const HINT_BUBBLE_MS = 9000;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** @returns {() => void} Aufräumfunktion */
export function mountGameShell(root, checkpoint) {
  const total = CHECKPOINTS.length;
  const run = { mistakes: 0, finished: false, destroyed: false, gameCleanup: null, success: null };
  const hintHandlers = [];
  let game = null;

  // ----- DOM -----
  const mistakeLabel = h('span', { class: 'game-shell__mistakes', 'aria-live': 'polite' }, COPY.game.mistakes(0));
  const hintButton = h('button', { class: 'btn btn--soft', type: 'button', hidden: true, onclick: showHint }, COPY.game.hintButton);
  const hintBubble = h('p', {
    class: 'hint-bubble',
    role: 'status',
    hidden: true,
    onclick: () => (hintBubble.hidden = true), // Antippen schließt den Hinweis
  });
  const skipButton = h('button', { class: 'btn btn--ghost game-shell__skip', type: 'button', onclick: onSkipClick }, COPY.game.skip);
  const skipBanner = h(
    'div',
    { class: 'skip-banner', hidden: true },
    h('p', null, COPY.game.skipBannerText),
    h('button', { class: 'btn btn--primary btn--pulse', type: 'button', onclick: skip }, COPY.game.skipBannerButton),
  );
  const stage = h('div', { class: 'game-shell__stage' }, h('p', { class: 'game-shell__loading' }, COPY.game.loading));

  root.append(
    h(
      'header',
      { class: 'game-shell__header' },
      h('a', { class: 'icon-btn', href: '#/map', 'aria-label': COPY.game.backToMap }, '←'),
      h(
        'div',
        { class: 'game-shell__title' },
        h('p', { class: 'eyebrow' }, COPY.game.stopLabel(checkpoint.order, total)),
        h('h1', null, checkpoint.gameTitle),
      ),
      skipButton,
    ),
    hintBubble,
    stage,
    // Klebt am unteren Rand, damit Hinweis und Skip auch bei hohen Spielfeldern sichtbar bleiben.
    h(
      'footer',
      { class: 'game-shell__footer' },
      h('div', { class: 'game-shell__tools' }, mistakeLabel, hintButton),
      skipBanner,
    ),
  );

  // ----- Kontext für das Spiel -----
  const ctx = {
    checkpoint,
    reducedMotion: prefersReducedMotion(),
    mistake() {
      if (run.finished || run.destroyed) return;
      run.mistakes += 1;
      mistakeLabel.textContent = COPY.game.mistakes(run.mistakes);
      hintButton.hidden = run.mistakes < HINT_AFTER_MISTAKES;
      skipBanner.hidden = run.mistakes <= SKIP_HIGHLIGHT_AFTER_MISTAKES;
    },
    complete() {
      if (run.finished || run.destroyed) return;
      run.finished = true;
      hintBubble.hidden = true;
      progress.complete(checkpoint.id);
      run.success = showSuccess(checkpoint);
      run.success.done.then(() => {
        if (!run.destroyed) navigate(`/message/${checkpoint.id}`);
      });
    },
    onHint(handler) {
      hintHandlers.push(handler);
    },
  };

  // ----- Aktionen -----
  function showHint() {
    hintBubble.textContent = game?.meta?.hint ?? '';
    hintBubble.hidden = !hintBubble.textContent;
    // Die Blase liegt über dem Inhalt (verschiebt das Spielfeld nicht) und schließt sich selbst.
    clearTimeout(run.hintTimer);
    run.hintTimer = setTimeout(() => (hintBubble.hidden = true), HINT_BUBBLE_MS);
    hintHandlers.forEach((handler) => handler());
  }

  function skip() {
    if (run.finished || run.destroyed) return;
    run.finished = true;
    progress.complete(checkpoint.id, { skipped: true });
    navigate(`/message/${checkpoint.id}`);
  }

  async function onSkipClick() {
    // Ab "Skip hervorgehoben" ist Überspringen empfohlen → ohne Rückfrage.
    if (run.mistakes > SKIP_HIGHLIGHT_AFTER_MISTAKES) return skip();
    const confirmed = await confirmDialog({
      title: COPY.game.skipConfirmTitle,
      text: COPY.game.skipConfirmText,
      confirmLabel: COPY.game.skipConfirmYes,
      cancelLabel: COPY.game.skipConfirmNo,
    });
    if (confirmed) skip();
  }

  // ----- Phasen: laden → Intro → Spiel -----
  function showLoadError() {
    stage.replaceChildren(
      h(
        'div',
        { class: 'card card--center' },
        h('h2', null, COPY.game.loadError),
        h('p', null, COPY.game.loadErrorText),
        h(
          'div',
          { class: 'stack' },
          h('button', { class: 'btn btn--primary', type: 'button', onclick: skip }, COPY.game.skipBannerButton),
          h('button', { class: 'btn btn--soft', type: 'button', onclick: () => navigate('/map') }, COPY.game.backToMap),
          h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => location.reload() }, COPY.game.retry),
        ),
      ),
    );
  }

  function startGame() {
    const area = h('div', { class: 'game-shell__area' });
    stage.replaceChildren(area);
    try {
      run.gameCleanup = game.mount(area, ctx) ?? null;
    } catch (error) {
      console.error(`Game "${checkpoint.gameId}" failed to start`, error);
      showLoadError();
    }
  }

  function showIntro() {
    stage.replaceChildren(
      h(
        'div',
        { class: 'card card--center intro-card' },
        h('div', { class: 'intro-card__icon', 'aria-hidden': 'true' }, createStationArt(checkpoint.id)),
        h('h2', null, COPY.game.introHeading(checkpoint.person)),
        h('p', null, game.meta.instructions),
        h('button', { class: 'btn btn--primary', type: 'button', onclick: startGame }, COPY.game.start),
      ),
    );
  }

  loadGame(checkpoint.gameId)
    .then((loaded) => {
      if (run.destroyed) return;
      game = loaded;
      showIntro();
    })
    .catch((error) => {
      console.error(`Game "${checkpoint.gameId}" failed to load`, error);
      if (!run.destroyed) showLoadError();
    });

  return () => {
    run.destroyed = true;
    clearTimeout(run.hintTimer);
    try {
      run.gameCleanup?.();
    } catch (error) {
      console.error('Game cleanup failed', error);
    }
    run.success?.close();
  };
}
