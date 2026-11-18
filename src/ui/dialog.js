/*
 * Modale Dialoge auf Basis des nativen <dialog>-Elements
 * (Fokusfalle, Escape und Hintergrund-Sperre kommen vom Browser).
 */
import { h } from '../core/dom.js';

/**
 * Öffnet ein Modal mit beliebigem Inhalt.
 * @returns {{ dialog: HTMLDialogElement, close: () => void, closed: Promise<void> }}
 */
export function openModal(content, { dismissible = true, className = '' } = {}) {
  const dialog = h('dialog', { class: `modal ${className}`.trim() }, content);

  let finish;
  const closed = new Promise((resolve) => {
    finish = () => {
      dialog.remove();
      resolve();
    };
  });

  // Escape-Taste (nativ geschlossen) – bei programmatischem close() räumt close() selbst auf.
  dialog.addEventListener('close', finish);

  if (!dismissible) {
    dialog.addEventListener('cancel', (event) => event.preventDefault());
  }

  document.body.append(dialog);
  dialog.showModal();

  return {
    dialog,
    close() {
      if (dialog.open) dialog.close();
      finish();
    },
    closed,
  };
}

/** Bestätigungsdialog. Löst mit true (bestätigt) oder false (abgebrochen) auf. */
export function confirmDialog({ title, text, confirmLabel, cancelLabel }) {
  return new Promise((resolve) => {
    let answer = false;

    const cancelButton = h(
      'button',
      { class: 'btn btn--soft', type: 'button', onclick: () => modal.close() },
      cancelLabel,
    );
    const confirmButton = h(
      'button',
      {
        class: 'btn btn--primary',
        type: 'button',
        onclick: () => {
          answer = true;
          modal.close();
        },
      },
      confirmLabel,
    );

    const modal = openModal(
      h(
        'div',
        { class: 'modal__body' },
        h('h2', { class: 'modal__title' }, title),
        h('p', null, text),
        h('div', { class: 'stack' }, confirmButton, cancelButton),
      ),
    );

    // Sicherer Standard: Fokus auf "Abbrechen"
    cancelButton.focus();
    modal.closed.then(() => resolve(answer));
  });
}
