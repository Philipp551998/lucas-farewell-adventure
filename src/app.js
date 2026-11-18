/*
 * App-Shell: verbindet Router, Fortschritt und Screens.
 *
 * Navigation:  Welcome → Map → Checkpoint (Spiel) → Message Card → Map → … → Finale → Memory Wall
 *
 * Die Zugriffsregeln (guard) sorgen dafür, dass nur erreichbar ist, was freigeschaltet
 * ist – auch wenn jemand eine Adresse direkt aufruft oder der Browser-Zurück-Button benutzt wird.
 */
import { navigate, startRouter } from './core/router.js';
import { progress } from './core/store.js';
import { getCheckpoint } from './data/checkpoints.js';
import { mountCheckpoint } from './screens/checkpointScreen.js';
import { mountFinale } from './screens/finaleScreen.js';
import { mountMap } from './screens/mapScreen.js';
import { mountWall } from './screens/memoryWall.js';
import { mountMessage } from './screens/messageScreen.js';
import { mountWelcome } from './screens/welcomeScreen.js';

const SCREENS = {
  welcome: mountWelcome,
  map: mountMap,
  checkpoint: mountCheckpoint,
  message: mountMessage,
  finale: mountFinale,
  wall: mountWall,
};

/** Gibt einen Umleitungs-Pfad zurück, wenn die Route (noch) nicht erlaubt ist – sonst null. */
function guard({ name, param }) {
  if (!(name in SCREENS)) return '/';

  switch (name) {
    case 'checkpoint':
      if (!getCheckpoint(param) || !progress.isUnlocked(param)) return '/map';
      // Bereits abgeschlossen → direkt zur Nachricht
      return progress.isCompleted(param) ? `/message/${param}` : null;
    case 'message':
      return getCheckpoint(param) && progress.isCompleted(param) ? null : '/map';
    case 'finale':
    case 'wall':
      return progress.allCompleted() ? null : '/map';
    default:
      return null;
  }
}

export function startApp(root) {
  let cleanup = null;

  startRouter((route) => {
    const redirect = guard(route);
    if (redirect) {
      navigate(redirect, { replace: true });
      return;
    }

    cleanup?.();
    root.replaceChildren();
    cleanup = SCREENS[route.name](root, route.param) ?? null;
    window.scrollTo(0, 0);
  });
}
