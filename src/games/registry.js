/*
 * Spiel-Registry: verbindet die `gameId` eines Checkpoints mit seinem Modul.
 *
 * Jedes Spiel liegt in einem eigenen Ordner und wird erst beim Öffnen geladen
 * (dynamic import). Ein kaputtes Spiel kann dadurch weder die App noch die
 * anderen Spiele beeinträchtigen – die GameShell fängt Ladefehler ab und bietet
 * "Skip" an, sodass die Nachricht immer erreichbar bleibt.
 *
 * VERTRAG – jedes Spiel exportiert per `export default`:
 *
 *   {
 *     meta: {
 *       instructions: string,   // kurze Anleitung (Intro-Karte)
 *       hint: string,           // Hinweistext (ab 2 Fehlern abrufbar)
 *     },
 *     mount(container, ctx) {   // baut das Spiel in `container` auf
 *       // ctx.mistake()         – bei jeder falschen Aktion aufrufen
 *       // ctx.complete()        – aufrufen, sobald die Erfolgsbedingung erfüllt ist
 *       // ctx.onHint(fn)        – fn wird aufgerufen, wenn der Hinweis angefordert wird
 *       // ctx.checkpoint        – Daten des Checkpoints
 *       // ctx.reducedMotion     – true, wenn der Nutzer weniger Bewegung wünscht
 *       return () => { ... };   // optional: Aufräumfunktion (Timer, Listener …)
 *     },
 *   }
 *
 * Fehlerzähler, Hinweis-Button, Skip und Erfolgs-Animation übernimmt die GameShell –
 * ein Spiel kümmert sich nur um sein eigenes Spielfeld.
 */
const loaders = {
  'portugal-swipe': () => import('./portugal-swipe/index.js'),
  'recipe-rush': () => import('./recipe-rush/index.js'),
  'wedding-catch': () => import('./wedding-catch/index.js'),
  'lottas-treat-trail': () => import('./lottas-treat-trail/index.js'),
  'erlangen-quiz': () => import('./erlangen-quiz/index.js'),
  'italian-quiz': () => import('./italian-quiz/index.js'),
  'app-builder': () => import('./app-builder/index.js'),
  'python-path': () => import('./python-path/index.js'),
};

export const GAME_IDS = Object.keys(loaders);

export async function loadGame(gameId) {
  const loader = loaders[gameId];
  if (!loader) throw new Error(`Unknown game: ${gameId}`);
  const module = await loader();
  return module.default;
}
