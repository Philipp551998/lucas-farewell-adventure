/*
 * SuccessModal – Erfolgs-Moment nach einem gelösten Spiel: Konfetti-Explosion und die
 * Illustration der Station, die aufspringt. Respektiert "reduzierte Bewegung".
 */
import { h } from '../core/dom.js';
import { COPY } from '../data/copy.js';
import { createConfetti } from './confetti.js';
import { openModal } from './dialog.js';
import { createStationArt } from './stationArt.js';

/**
 * Zeigt das Erfolgs-Modal.
 * @returns {{ done: Promise<void>, close: () => void }} `done` löst auf, wenn der Nutzer weitergeht.
 */
export function showSuccess(checkpoint) {
  const modal = openModal(
    h(
      'div',
      { class: 'modal__body success' },
      createConfetti({ count: 56, originY: '34%' }),
      h('div', { class: 'success__icon', 'aria-hidden': 'true' }, createStationArt(checkpoint.id)),
      h('h2', { class: 'modal__title' }, COPY.success.title),
      h('p', null, COPY.success.text(checkpoint.person)),
      h(
        'button',
        { class: 'btn btn--primary', type: 'button', onclick: () => modal.close() },
        COPY.success.button,
      ),
    ),
    { dismissible: false },
  );
  return { done: modal.closed, close: modal.close };
}
