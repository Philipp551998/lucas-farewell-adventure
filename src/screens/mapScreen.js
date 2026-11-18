/*
 * MapScreen – die illustrierte Abenteuerkarte mit allen acht Stationen und der Schatztruhe.
 *
 * Ebenen (von unten): Landschaft (SVG) → Weg (SVG) → Stationen (Links/Buttons) → Spielfigur.
 * Die Spielfigur steht an der aktuellen Station. Kommt man nach einem gelösten Spiel zurück,
 * läuft sie wie im Brettspiel den Weg zur nächsten Station entlang.
 */
import { h, svg } from '../core/dom.js';
import { progress } from '../core/store.js';
import { CHECKPOINTS, FINALE_MAP_POSITION } from '../data/checkpoints.js';
import { COPY } from '../data/copy.js';
import { createCheckpointMarker, createFinaleMarker } from '../ui/checkpointMarker.js';
import { createMapScene } from '../ui/mapScene.js';
import { createResetButton } from '../ui/resetProgress.js';
import { createPawn } from '../ui/stationArt.js';
import { showToast } from '../ui/toast.js';

const MAP_HEIGHT_FACTOR = 2; // Karte ist doppelt so hoch wie breit (viewBox 100 × 200)
const TRAVEL_MS = 1100; // Dauer pro Wegstück der Spielfigur
const LAST_STOP_KEY = 'lucas-farewell-adventure:last-map-stop';

/** Weicher Weg durch alle Punkte (Catmull-Rom → kubische Bézierkurven), je Teilstück ein Pfad. */
function buildSegments(points) {
  const f = (n) => Math.round(n * 100) / 100;
  return points.slice(0, -1).map((p1, i) => {
    const p0 = points[i - 1] ?? p1;
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `M ${f(p1[0])} ${f(p1[1])} C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`;
  });
}

function shake(element) {
  element.classList.remove('is-shaking');
  void element.offsetWidth; // Animation neu starten
  element.classList.add('is-shaking');
}

// Letzte angezeigte Spielfigur-Position (nur für die Dauer der Sitzung), um Wege zu animieren.
function readLastStop() {
  try {
    const value = window.sessionStorage.getItem(LAST_STOP_KEY);
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
}

function writeLastStop(index) {
  try {
    window.sessionStorage.setItem(LAST_STOP_KEY, String(index));
  } catch {
    // ohne Sitzungsspeicher läuft die Karte einfach ohne Lauf-Animation
  }
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function mountMap(root) {
  const total = CHECKPOINTS.length;
  const done = progress.completedCount();
  const current = progress.currentCheckpoint();

  // Haltepunkte: 8 Stationen + Finale. Die Spielfigur steht bei Index `done` (8 = Finale).
  const stops = [...CHECKPOINTS.map((c) => c.mapPosition), FINALE_MAP_POSITION];
  const points = stops.map((p) => [p.x, p.y * MAP_HEIGHT_FACTOR]);

  const segmentData = buildSegments(points);
  const edges = segmentData.map((d, i) =>
    svg('path', { d, class: `map__edge${i < done ? ' map__edge--walked' : ''}` }),
  );
  const roads = segmentData.map((d, i) =>
    svg('path', { d, class: `map__path${i < done ? ' map__path--walked' : ''}` }),
  );

  const markers = CHECKPOINTS.map((checkpoint) => {
    const state = progress.isCompleted(checkpoint.id)
      ? 'done'
      : progress.isUnlocked(checkpoint.id)
        ? 'current'
        : 'locked';
    return createCheckpointMarker(checkpoint, state, {
      skipped: progress.isSkipped(checkpoint.id),
      onLockedClick: (_, element) => {
        shake(element);
        showToast(COPY.map.locked);
      },
    });
  });

  const finale = createFinaleMarker(FINALE_MAP_POSITION, progress.allCompleted(), {
    onLockedClick: (element) => {
      shake(element);
      showToast(COPY.map.finaleLocked);
    },
  });

  const pawn = h('div', { class: 'map__pawn', 'aria-hidden': 'true' }, createPawn());
  const placePawn = (x, y) => {
    pawn.style.left = `${x}%`;
    pawn.style.top = `${y}%`;
  };
  const restIndex = done; // 0..8
  placePawn(stops[restIndex].x, stops[restIndex].y);

  root.append(
    h(
      'section',
      { class: 'screen map' },
      h(
        'header',
        { class: 'map__header' },
        h('h1', null, COPY.map.title),
        h('p', { class: 'pill', 'aria-label': `${done} of ${total} stops completed` }, COPY.map.progress(done, total)),
      ),
      h(
        'div',
        { class: 'map__board' },
        svg(
          'svg',
          { class: 'map__svg', viewBox: `0 0 100 ${100 * MAP_HEIGHT_FACTOR}`, 'aria-hidden': 'true', focusable: 'false' },
          createMapScene(),
          edges,
          roads,
        ),
        markers,
        finale,
        pawn,
      ),
      h('footer', { class: 'map__footer' }, createResetButton()),
    ),
  );

  // ----- Spielfigur laufen lassen -----
  let raf = 0;
  let cancelled = false;

  function walkSegment(pathEl) {
    return new Promise((resolve) => {
      const length = pathEl.getTotalLength();
      const startedAt = performance.now();
      const tick = (now) => {
        if (cancelled) return resolve();
        const t = Math.min(1, (now - startedAt) / TRAVEL_MS);
        const point = pathEl.getPointAtLength(length * easeInOut(t));
        placePawn(point.x, point.y / MAP_HEIGHT_FACTOR);
        if (t < 1) raf = requestAnimationFrame(tick);
        else resolve();
      };
      raf = requestAnimationFrame(tick);
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lastStop = readLastStop();
  const shouldWalk = lastStop !== null && lastStop < restIndex && !reducedMotion;
  writeLastStop(restIndex);

  const target = restIndex < markers.length ? markers[restIndex] : finale;
  if (shouldWalk) {
    // Start bei der zuletzt gesehenen Station, dann Stück für Stück bis zur aktuellen.
    placePawn(stops[lastStop].x, stops[lastStop].y);
    requestAnimationFrame(() => target.scrollIntoView({ block: 'center' }));
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
      for (let i = lastStop; i < restIndex && !cancelled; i += 1) await walkSegment(roads[i]);
      if (!cancelled) placePawn(stops[restIndex].x, stops[restIndex].y);
    })();
  } else if (done > 0) {
    // Aktuelle Station in die Mitte scrollen (beim ersten Besuch bleibt die Karte oben).
    requestAnimationFrame(() => target.scrollIntoView({ block: 'center' }));
  }

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}
