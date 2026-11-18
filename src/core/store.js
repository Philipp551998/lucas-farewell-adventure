/*
 * Spielfortschritt im LocalStorage.
 *
 * Gespeichert wird nur das Nötige:
 *   { version, started, finaleSeen, completed: { <checkpointId>: { at, skipped } } }
 *
 * Freischaltung: Checkpoint 1 ist immer offen, jeder weitere öffnet sich, sobald
 * ALLE vorherigen abgeschlossen sind. Ein übersprungenes Spiel zählt als
 * abgeschlossen – die Nachricht ist dadurch immer erreichbar.
 *
 * Ist LocalStorage nicht verfügbar (z. B. privater Modus), läuft die App
 * weiter und hält den Fortschritt nur im Arbeitsspeicher.
 */
import { STORAGE_KEY, STORAGE_VERSION } from '../config.js';
import { CHECKPOINTS, getCheckpointIndex } from '../data/checkpoints.js';

const validIds = new Set(CHECKPOINTS.map((checkpoint) => checkpoint.id));
const listeners = new Set();

function emptyState() {
  return { version: STORAGE_VERSION, started: false, finaleSeen: false, completed: {} };
}

function sanitize(raw) {
  const state = emptyState();
  if (!raw || typeof raw !== 'object') return state;
  state.started = raw.started === true;
  state.finaleSeen = raw.finaleSeen === true;
  if (raw.completed && typeof raw.completed === 'object') {
    for (const [id, entry] of Object.entries(raw.completed)) {
      if (!validIds.has(id)) continue;
      state.completed[id] = {
        at: typeof entry?.at === 'string' ? entry.at : null,
        skipped: entry?.skipped === true,
      };
    }
  }
  return state;
}

function load() {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    return text ? sanitize(JSON.parse(text)) : emptyState();
  } catch {
    return emptyState();
  }
}

function save(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Speichern nicht möglich – die App läuft mit dem Zustand im Speicher weiter.
  }
}

let state = load();

function commit(next) {
  state = next;
  save(state);
  listeners.forEach((listener) => listener(state));
}

export const progress = {
  get state() {
    return state;
  },

  isCompleted(id) {
    return Boolean(state.completed[id]);
  },

  isSkipped(id) {
    return state.completed[id]?.skipped === true;
  },

  isUnlocked(id) {
    const index = getCheckpointIndex(id);
    if (index < 0) return false;
    return CHECKPOINTS.slice(0, index).every((checkpoint) => state.completed[checkpoint.id]);
  },

  completedCount() {
    return CHECKPOINTS.filter((checkpoint) => state.completed[checkpoint.id]).length;
  },

  allCompleted() {
    return this.completedCount() === CHECKPOINTS.length;
  },

  /** Erster noch nicht abgeschlossene Checkpoint, oder null wenn alle fertig sind. */
  currentCheckpoint() {
    return CHECKPOINTS.find((checkpoint) => !state.completed[checkpoint.id]) ?? null;
  },

  start() {
    if (!state.started) commit({ ...state, started: true });
  },

  /** Schließt einen Checkpoint ab. Ein erfolgreich gespielter Checkpoint bleibt "gespielt". */
  complete(id, { skipped = false } = {}) {
    if (!this.isUnlocked(id)) return false;
    const existing = state.completed[id];
    if (existing && !existing.skipped) return true;
    commit({
      ...state,
      started: true,
      completed: { ...state.completed, [id]: { at: new Date().toISOString(), skipped } },
    });
    return true;
  },

  markFinaleSeen() {
    if (!state.finaleSeen) commit({ ...state, finaleSeen: true });
  },

  reset() {
    commit(emptyState());
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
