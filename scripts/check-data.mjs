/*
 * Datenprüfung: stellt sicher, dass Person ↔ Spiel ↔ Nachricht vollständig und
 * eindeutig verbunden sind. Aufruf: npm run check
 *
 * Prüft NICHT den Wortlaut der Nachrichten gegen die Excel-Datei (die ist privat
 * und liegt nicht im Repository) – nur Struktur und Vollständigkeit.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { CHECKPOINTS } = await import(pathToFileURL(join(root, 'src/data/checkpoints.js')).href);
const messages = JSON.parse(readFileSync(join(root, 'src/data/messages.json'), 'utf8'));
const registry = readFileSync(join(root, 'src/games/registry.js'), 'utf8');

const errors = [];
const fail = (text) => errors.push(text);

if (CHECKPOINTS.length !== 8) fail(`Erwartet 8 Checkpoints, gefunden: ${CHECKPOINTS.length}`);

const ids = new Set();
const games = new Set();
const orders = new Set();

for (const cp of CHECKPOINTS) {
  if (ids.has(cp.id)) fail(`Doppelte id: ${cp.id}`);
  if (games.has(cp.gameId)) fail(`Doppelte gameId: ${cp.gameId}`);
  if (orders.has(cp.order)) fail(`Doppelte order: ${cp.order}`);
  ids.add(cp.id);
  games.add(cp.gameId);
  orders.add(cp.order);

  const message = messages[cp.id];
  if (!message) {
    fail(`${cp.id}: keine Nachricht in messages.json`);
  } else {
    if (message.name !== cp.person) fail(`${cp.id}: Name "${message.name}" ≠ Person "${cp.person}"`);
    for (const key of ['appreciation', 'memory', 'wishes']) {
      if (typeof message[key] !== 'string' || message[key].length === 0) fail(`${cp.id}: Abschnitt "${key}" fehlt`);
    }
  }

  if (!existsSync(join(root, 'src/games', cp.gameId, 'index.js'))) fail(`${cp.id}: src/games/${cp.gameId}/index.js fehlt`);
  if (!registry.includes(`'${cp.gameId}'`)) fail(`${cp.id}: gameId "${cp.gameId}" nicht in games/registry.js`);
}

for (const id of Object.keys(messages)) {
  if (!ids.has(id)) fail(`messages.json enthält "${id}" ohne zugehörigen Checkpoint`);
}

if (errors.length) {
  console.error('❌ Datenprüfung fehlgeschlagen:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`✅ Datenprüfung bestanden: ${CHECKPOINTS.length} Checkpoints, je 1 Spiel + 1 Nachricht (3 Abschnitte).`);
