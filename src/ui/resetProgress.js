// ResetProgress – gut sichtbarer "Reset adventure"-Button mit Sicherheitsabfrage.
import { h } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { progress } from '../core/store.js';
import { COPY } from '../data/copy.js';
import { confirmDialog } from './dialog.js';

export function createResetButton() {
  return h(
    'button',
    {
      class: 'btn btn--ghost',
      type: 'button',
      onclick: async () => {
        const confirmed = await confirmDialog({
          title: COPY.reset.confirmTitle,
          text: COPY.reset.confirmText,
          confirmLabel: COPY.reset.confirmYes,
          cancelLabel: COPY.reset.confirmNo,
        });
        if (!confirmed) return;
        progress.reset();
        navigate('/', { replace: true });
      },
    },
    COPY.reset.button,
  );
}
