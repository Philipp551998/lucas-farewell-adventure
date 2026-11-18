// CheckpointScreen – hostet das Spiel eines Checkpoints in der GameShell.
import { h } from '../core/dom.js';
import { getCheckpoint } from '../data/checkpoints.js';
import { mountGameShell } from '../ui/gameShell.js';

/** @returns {() => void} Aufräumfunktion */
export function mountCheckpoint(root, id) {
  const checkpoint = getCheckpoint(id);
  const screen = h('section', { class: 'screen game-shell' });
  root.append(screen);
  return mountGameShell(screen, checkpoint);
}
