/*
 * MemoryWall – alle acht Nachrichten wie eine Pinnwand: jede Nachricht ist eine leicht
 * schiefe Karte mit Reißzwecke und der Illustration der Station. Antippen klappt die
 * drei Abschnitte auf (Texte unverändert, siehe ui/messageCard.js).
 * Erst nach dem Finale erreichbar.
 */
import { h } from '../core/dom.js';
import { CHECKPOINTS } from '../data/checkpoints.js';
import { COPY } from '../data/copy.js';
import { getMessage } from '../data/messages.js';
import { createMessageCard } from '../ui/messageCard.js';
import { createResetButton } from '../ui/resetProgress.js';
import { createStationArt } from '../ui/stationArt.js';

const PIN_COLORS = ['#c2512a', '#2f8f83', '#f0b429', '#6a8fe6'];

export function mountWall(root) {
  root.append(
    h(
      'section',
      { class: 'screen wall' },
      h('h1', null, COPY.wall.title),
      h('p', { class: 'welcome__lead' }, COPY.wall.lead),
      h(
        'div',
        { class: 'wall__list' },
        CHECKPOINTS.map((checkpoint, index) =>
          h(
            'details',
            {
              class: 'wall__item',
              style: {
                '--tilt': `${(index % 2 ? 1 : -1) * (0.5 + (index % 3) * 0.35)}deg`,
                '--pin': PIN_COLORS[index % PIN_COLORS.length],
              },
            },
            h(
              'summary',
              null,
              h('span', { class: 'wall__icon', 'aria-hidden': 'true' }, createStationArt(checkpoint.id)),
              h('span', { class: 'wall__name' }, checkpoint.person),
            ),
            createMessageCard(checkpoint, getMessage(checkpoint.id), { compact: true }),
          ),
        ),
      ),
      h(
        'div',
        { class: 'stack' },
        h('a', { class: 'btn btn--soft', href: '#/map' }, COPY.wall.backToMap),
        createResetButton(),
      ),
    ),
  );
}
