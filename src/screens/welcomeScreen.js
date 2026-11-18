// WelcomeScreen – Startseite. Zeigt "Continue", sobald es gespeicherten Fortschritt gibt.
import { h } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { progress } from '../core/store.js';
import { CHECKPOINTS } from '../data/checkpoints.js';
import { COPY } from '../data/copy.js';
import { createResetButton } from '../ui/resetProgress.js';
import { createStationArt } from '../ui/stationArt.js';

export function mountWelcome(root) {
  const hasProgress = progress.state.started;

  root.append(
    h(
      'section',
      { class: 'screen welcome' },
      h(
        'div',
        { class: 'welcome__art', 'aria-hidden': 'true' },
        CHECKPOINTS.map((checkpoint, index) =>
          h('span', { class: 'welcome__icon', style: { '--i': index } }, createStationArt(checkpoint.id)),
        ),
      ),
      h('p', { class: 'eyebrow' }, COPY.welcome.eyebrow),
      h('h1', { class: 'welcome__title' }, COPY.appName),
      h('p', { class: 'welcome__lead' }, COPY.welcome.lead),
      h(
        'div',
        { class: 'stack' },
        h(
          'button',
          {
            class: 'btn btn--primary btn--large',
            type: 'button',
            onclick: () => {
              progress.start();
              navigate('/map');
            },
          },
          hasProgress ? COPY.welcome.continue : COPY.welcome.start,
        ),
        hasProgress && createResetButton(),
      ),
    ),
  );
}
