// MessageScreen – die freigeschaltete Nachrichtenkarte einer Person.
import { h } from '../core/dom.js';
import { progress } from '../core/store.js';
import { getCheckpoint } from '../data/checkpoints.js';
import { COPY } from '../data/copy.js';
import { getMessage } from '../data/messages.js';
import { createMessageCard } from '../ui/messageCard.js';

export function mountMessage(root, id) {
  const checkpoint = getCheckpoint(id);
  const message = getMessage(id);
  const goToFinale = progress.allCompleted() && !progress.state.finaleSeen;

  root.append(
    h(
      'section',
      { class: 'screen message-screen' },
      progress.isSkipped(id) && h('p', { class: 'note' }, COPY.message.skippedNote),
      createMessageCard(checkpoint, message),
      h(
        'div',
        { class: 'stack' },
        h(
          'a',
          { class: 'btn btn--primary btn--large', href: goToFinale ? '#/finale' : '#/map' },
          goToFinale ? COPY.message.toFinale : COPY.message.backToMap,
        ),
      ),
    ),
  );
}
