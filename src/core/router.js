/*
 * Minimaler Hash-Router (#/map, #/checkpoint/joana, …).
 *
 * Hash-Routing ist die einfachste Lösung für GitHub Pages: Es braucht keine
 * Server-Umleitungen, und die App funktioniert unter jedem Unterpfad.
 */

/** @returns {{ name: string, param: string | null }} */
export function parseHash(hash = window.location.hash) {
  const parts = hash.replace(/^#/, '').split('/').filter(Boolean);
  return { name: parts[0] ?? 'welcome', param: parts[1] ?? null };
}

export function navigate(path, { replace = false } = {}) {
  if (replace) window.location.replace(`#${path}`);
  else window.location.hash = path;
}

export function startRouter(onRoute) {
  window.addEventListener('hashchange', () => onRoute(parseHash()));
  onRoute(parseHash());
}
