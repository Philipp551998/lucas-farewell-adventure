/*
 * MessageCard – Name und die drei getrennten Abschnitte einer persönlichen Nachricht.
 * Texte werden unverändert als Text-Knoten ausgegeben.
 */
import { h } from '../core/dom.js';
import { COPY } from '../data/copy.js';
import { MESSAGE_SECTIONS } from '../data/messages.js';
import { createStationArt } from './stationArt.js';

/**
 * @param {object} checkpoint  Checkpoint-Daten (für Icon)
 * @param {object} message     Eintrag aus messages.json
 * @param {{ compact?: boolean }} options  compact = ohne Kopfzeile (z. B. in der Memory Wall)
 */
export function createMessageCard(checkpoint, message, { compact = false } = {}) {
  return h(
    'article',
    { class: `message-card${compact ? ' message-card--compact' : ''}` },
    !compact &&
      h(
        'header',
        { class: 'message-card__header' },
        h('div', { class: 'message-card__badge', 'aria-hidden': 'true' }, createStationArt(checkpoint.id)),
        h('p', { class: 'eyebrow' }, COPY.message.from),
        h('h2', { class: 'message-card__name' }, message.name),
      ),
    MESSAGE_SECTIONS.map((section) =>
      h(
        'section',
        { class: 'message-card__section' },
        h('h3', { class: 'message-card__section-title' }, section.title),
        h('p', { class: 'message-card__text' }, message[section.key]),
      ),
    ),
  );
}
