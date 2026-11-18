/*
 * CheckpointMarker – eine Station auf der Karte, mit eigener Illustration.
 * Zustände: locked (gesperrt, ausgegraut + Schloss), current (als Nächstes dran, pulsierender Ring),
 * done (abgeschlossen, goldener Rand + Häkchen).
 * Freigeschaltete Stationen sind echte Links, gesperrte sind Buttons (aria-disabled).
 */
import { h } from '../core/dom.js';
import { COPY } from '../data/copy.js';
import { createChest, createStationArt } from './stationArt.js';

function labelFor(state, checkpoint, skipped) {
  const base = `${COPY.map.stopLabel(checkpoint.order)}: ${checkpoint.person}`;
  if (state === 'locked') return `${base} (locked)`;
  if (state === 'current') return `${base} – play`;
  return skipped ? `${base} – ${COPY.map.skippedHint}` : `${base} – read message`;
}

function plate(art, state) {
  return h(
    'span',
    { class: 'marker__plate', 'aria-hidden': 'true' },
    h('span', { class: 'marker__art' }, art),
    state === 'locked' && h('span', { class: 'marker__lock' }, '🔒'),
    state === 'done' && h('span', { class: 'marker__check' }, '✓'),
  );
}

/**
 * @param {'locked'|'current'|'done'} state
 * @param {{ onLockedClick?: (checkpoint, element) => void, skipped?: boolean }} options
 */
export function createCheckpointMarker(checkpoint, state, { onLockedClick, skipped = false } = {}) {
  const style = {
    left: `${checkpoint.mapPosition.x}%`,
    top: `${checkpoint.mapPosition.y}%`,
  };

  const face = [
    plate(createStationArt(checkpoint.id), state),
    h(
      'span',
      { class: 'marker__label' },
      h('span', { class: 'marker__order' }, COPY.map.stopLabel(checkpoint.order)),
      h('span', { class: 'marker__name' }, checkpoint.person),
    ),
  ];

  const common = {
    class: `marker marker--${state}`,
    style,
    'aria-label': labelFor(state, checkpoint, skipped),
  };

  if (state === 'locked') {
    const button = h('button', {
      ...common,
      type: 'button',
      'aria-disabled': 'true',
      onclick: () => onLockedClick?.(checkpoint, button),
    }, face);
    return button;
  }

  const href = state === 'current' ? `#/checkpoint/${checkpoint.id}` : `#/message/${checkpoint.id}`;
  return h('a', { ...common, href }, face);
}

/** Das Ziel am Ende des Weges: Schatztruhe (zu → offen, sobald alle acht Stationen geschafft sind). */
export function createFinaleMarker(position, unlocked, { onLockedClick } = {}) {
  const face = [
    plate(createChest(unlocked), unlocked ? 'current' : 'locked'),
    h('span', { class: 'marker__label' }, h('span', { class: 'marker__name' }, COPY.map.finaleLabel)),
  ];
  const common = {
    class: `marker marker--finale marker--${unlocked ? 'current' : 'locked'}`,
    style: { left: `${position.x}%`, top: `${position.y}%` },
    'aria-label': unlocked ? `${COPY.map.finaleLabel} – open` : `${COPY.map.finaleLabel} (locked)`,
  };

  if (!unlocked) {
    const button = h('button', {
      ...common,
      type: 'button',
      'aria-disabled': 'true',
      onclick: () => onLockedClick?.(button),
    }, face);
    return button;
  }
  return h('a', { ...common, href: '#/finale' }, face);
}
