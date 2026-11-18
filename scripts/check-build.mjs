/*
 * Prüft den fertigen Build (dist/). Aufruf: npm run check:build (nach npm run build).
 * Läuft auch automatisch im GitHub-Actions-Workflow – schlägt ein Punkt fehl, wird NICHT veröffentlicht.
 *
 *  1. Datenschutz:   keine Excel-/Office-/Schlüsseldateien und keine lokalen Pfade im Build
 *  2. Unterpfad:     alle Verweise in index.html sind relativ und zeigen auf vorhandene Dateien
 *  3. iPhone/PWA:    Manifest (Pflichtfelder, Icons mit den angegebenen Größen), Apple-Touch-Icon 180×180,
 *                    Meta-Tags für "Zum Home-Bildschirm"
 *  4. Service Worker: Platzhalter ersetzt, Vorab-Cache enthält JEDE Datei des Builds
 *  5. Offline:       der Service Worker wird in einer Simulation ausgeführt (Installieren, Aufräumen alter
 *                    Caches, Seitenaufruf und alle Dateien ohne Netz, fremde Caches bleiben unangetastet)
 *
 * Keine zusätzlichen Abhängigkeiten – nur Node.js.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const passed = [];
const failed = [];
const check = (condition, text) => (condition ? passed : failed).push(text);

if (!existsSync(dist)) {
  console.error('❌ Ordner dist/ fehlt – zuerst "npm run build" ausführen.');
  process.exit(1);
}

// ---------- Dateien einsammeln ----------
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else files.push(relative(dist, full).split('\\').join('/'));
  }
})(dist);
const has = (path) => files.includes(path);
const read = (path) => readFileSync(join(dist, path), 'utf8');

// ---------- 1. Datenschutz ----------
const FORBIDDEN_EXTENSIONS = new Set([
  '.xlsx', '.xls', '.xlsm', '.xlsb', '.csv', '.doc', '.docx', '.ppt', '.pptx', '.pdf', '.zip',
  '.env', '.pem', '.key', '.p12', '.sqlite', '.db', '.log', '.map',
]);
const forbidden = files.filter(
  (file) => FORBIDDEN_EXTENSIONS.has(extname(file).toLowerCase()) || /handoff|farewell_app/i.test(file) || /(^|\/)\.env/.test(file),
);
check(forbidden.length === 0, `Datenschutz: keine Excel-/Office-/Schlüssel-/Log-Dateien im Build${forbidden.length ? ` (gefunden: ${forbidden.join(', ')})` : ''}`);

const TEXT_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg']);
const leakingPaths = files
  .filter((file) => TEXT_EXTENSIONS.has(extname(file)))
  .filter((file) => /[A-Za-z]:\\\\?Users|\/Users\/|\/home\/runner|Desktop\\/.test(read(file)));
check(leakingPaths.length === 0, `Datenschutz: keine lokalen Rechner-Pfade im Build${leakingPaths.length ? ` (${leakingPaths.join(', ')})` : ''}`);

// ---------- 2. index.html und Unterpfad ----------
check(has('index.html'), 'index.html vorhanden');
const html = has('index.html') ? read('index.html') : '';
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((url) => !/^(#|https?:|data:|mailto:|tel:)/.test(url));
const absolute = references.filter((url) => url.startsWith('/'));
check(absolute.length === 0, `Unterpfad: keine absoluten Pfade in index.html${absolute.length ? ` (${absolute.join(', ')})` : ' – alles relativ'}`);
const missingRefs = references.filter((url) => !has(url.replace(/^\.\//, '').split('?')[0]));
check(missingRefs.length === 0, `Unterpfad: alle ${references.length} Verweise in index.html zeigen auf vorhandene Dateien${missingRefs.length ? ` (fehlt: ${missingRefs.join(', ')})` : ''}`);

const cssFiles = files.filter((file) => file.endsWith('.css'));
const absoluteCssUrls = cssFiles.filter((file) => /url\(\s*['"]?\//.test(read(file)));
check(absoluteCssUrls.length === 0, 'Unterpfad: keine absoluten url(/…)-Pfade in den Stylesheets');

// ---------- 3. iPhone / PWA ----------
check(/name="viewport"[^>]*viewport-fit=cover/.test(html), 'iPhone: viewport-fit=cover (Notch und Home-Indikator)');
check(/rel="manifest"/.test(html), 'PWA: Manifest ist verlinkt');
check(/rel="apple-touch-icon"/.test(html), 'iPhone: apple-touch-icon ist verlinkt');
check(/name="apple-mobile-web-app-capable"\s+content="yes"/.test(html), 'iPhone: apple-mobile-web-app-capable (app-ähnlicher Start)');
check(/name="apple-mobile-web-app-title"/.test(html), 'iPhone: Titel für das Home-Bildschirm-Symbol');
check(/name="apple-mobile-web-app-status-bar-style"/.test(html), 'iPhone: Statusleisten-Stil');
check(/name="theme-color"/.test(html), 'PWA: theme-color');
check(/name="robots"[^>]*noindex/.test(html), 'Datenschutz: noindex (Suchmaschinen sollen die Seite nicht listen)');

function pngSize(path) {
  const buffer = readFileSync(join(dist, path));
  const isPng = buffer.length > 24 && buffer.toString('ascii', 1, 4) === 'PNG';
  return isPng ? { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) } : null;
}

const manifestPath = 'manifest.webmanifest';
let manifest = null;
try {
  manifest = JSON.parse(read(manifestPath));
} catch {
  check(false, 'PWA: manifest.webmanifest ist gültiges JSON');
}
if (manifest) {
  check(true, 'PWA: manifest.webmanifest ist gültiges JSON');
  for (const field of ['name', 'short_name', 'start_url', 'scope', 'display', 'background_color', 'theme_color', 'icons']) {
    check(Boolean(manifest[field]), `PWA: Manifest-Feld "${field}" gesetzt`);
  }
  check(manifest.display === 'standalone', 'PWA: display = standalone (ohne Safari-Leisten)');
  check(manifest.start_url === './' && manifest.scope === './', 'Unterpfad: start_url und scope sind relativ ("./")');

  let hasAny192 = false;
  let hasAny512 = false;
  let hasMaskable512 = false;
  for (const icon of manifest.icons ?? []) {
    const path = icon.src.replace(/^\.\//, '');
    check(has(path), `PWA: Icon ${icon.src} vorhanden`);
    if (icon.type === 'image/png' && has(path)) {
      const size = pngSize(path);
      const declared = icon.sizes?.split('x').map(Number) ?? [];
      const matches = size && size.width === declared[0] && size.height === declared[1];
      check(matches, `PWA: Icon ${icon.src} hat tatsächlich die angegebene Größe ${icon.sizes}`);
      if (matches && icon.purpose === 'any' && size.width === 192) hasAny192 = true;
      if (matches && icon.purpose === 'any' && size.width === 512) hasAny512 = true;
      if (matches && icon.purpose === 'maskable' && size.width === 512) hasMaskable512 = true;
    }
  }
  check(hasAny192 && hasAny512, 'PWA: Icons 192×192 und 512×512 (purpose any) vorhanden');
  check(hasMaskable512, 'PWA: maskable-Icon 512×512 vorhanden');
}

const appleHref = html.match(/rel="apple-touch-icon"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*rel="apple-touch-icon"/);
const applePath = (appleHref?.[1] ?? appleHref?.[2] ?? '').replace(/^\.\//, '');
const appleSize = applePath && has(applePath) ? pngSize(applePath) : null;
check(appleSize?.width === 180 && appleSize?.height === 180, 'iPhone: apple-touch-icon ist ein 180×180-PNG');

// ---------- 4. Service Worker ----------
check(has('sw.js'), 'Service Worker: sw.js vorhanden');
const swSource = has('sw.js') ? read('sw.js') : '';
check(!swSource.includes('__BUILD_ID__') && !swSource.includes('__PRECACHE_URLS__'), 'Service Worker: Platzhalter durch Build-ID und Dateiliste ersetzt');

const precacheMatch = swSource.match(/const PRECACHE_URLS = (\[.*?\]);/s);
let precache = [];
try {
  precache = JSON.parse(precacheMatch?.[1] ?? '[]');
} catch {
  precache = [];
}
check(precache.length > 3, `Service Worker: Vorab-Cache enthält ${precache.length} Einträge`);
check(precache.includes('./') && precache.includes('./index.html'), 'Service Worker: Startseite ("./" und index.html) liegt im Vorab-Cache');
const precacheFiles = new Set(precache.map((url) => url.replace(/^\.\//, '')).filter(Boolean));
const notCached = files.filter((file) => file !== 'sw.js' && !precacheFiles.has(file));
check(notCached.length === 0, `Offline: JEDE Datei des Builds liegt im Vorab-Cache (inkl. aller Spiel-Module)${notCached.length ? ` – fehlt: ${notCached.join(', ')}` : ''}`);
const cachedButMissing = [...precacheFiles].filter((file) => !has(file));
check(cachedButMissing.length === 0, 'Offline: der Vorab-Cache verweist auf keine nicht vorhandene Datei (sonst scheitert die Installation)');

const mainBundle = files.find((file) => /^assets\/index-.*\.js$/.test(file));
check(Boolean(mainBundle) && read(mainBundle).includes('serviceWorker') && read(mainBundle).includes('sw.js'), 'Service Worker: wird von der App registriert');

// ---------- 5. Offline-Simulation ----------
async function simulateOffline() {
  const SCOPE = 'https://example.github.io/lucas-farewell-adventure/'; // typischer GitHub-Pages-Unterpfad
  const store = new Map(); // Cache-Name → Map(url → Response)
  let online = true;

  const urlOf = (request) => (typeof request === 'string' ? new URL(request, `${SCOPE}sw.js`).href : request.url);
  const bare = (url) => url.split('#')[0].split('?')[0];

  const network = async (request) => {
    if (!online) throw new TypeError('Failed to fetch');
    const { pathname } = new URL(urlOf(request));
    const rel = decodeURIComponent(pathname.slice(new URL(SCOPE).pathname.length));
    const target = rel === '' ? 'index.html' : rel;
    if (!has(target)) return new Response('nicht gefunden', { status: 404 });
    return new Response(readFileSync(join(dist, target)), { status: 200 });
  };

  const openCache = (name) => {
    if (!store.has(name)) store.set(name, new Map());
    const entries = store.get(name);
    return {
      async addAll(urls) {
        for (const url of urls) {
          const response = await network(url);
          if (!response.ok) throw new Error(`addAll: ${url} → ${response.status}`);
          entries.set(urlOf(url), response);
        }
      },
      async put(request, response) {
        entries.set(urlOf(request), response);
      },
    };
  };

  const caches = {
    open: async (name) => openCache(name),
    keys: async () => [...store.keys()],
    delete: async (name) => store.delete(name),
    async match(request, options = {}) {
      const wanted = options.ignoreSearch ? bare(urlOf(request)) : urlOf(request);
      for (const entries of store.values()) {
        for (const [url, response] of entries) {
          if ((options.ignoreSearch ? bare(url) : url) === wanted) return response.clone();
        }
      }
      return undefined;
    },
  };

  const listeners = {};
  const self = {
    location: new URL(`${SCOPE}sw.js`),
    registration: { scope: SCOPE },
    clients: { claim: async () => {} },
    addEventListener: (type, listener) => {
      listeners[type] = listener;
    },
  };
  vm.runInNewContext(swSource, { self, caches, fetch: network, URL, Response, Request, Promise, console }, { filename: 'sw.js' });

  const dispatchLifecycle = async (type) => {
    let pending;
    listeners[type]({ waitUntil: (promise) => (pending = promise) });
    await pending;
  };
  const request = async (url, { mode = 'no-cors', method = 'GET' } = {}) => {
    let responded = false;
    let result;
    listeners.fetch({
      request: { url, method, mode },
      respondWith: (promise) => {
        responded = true;
        result = promise;
      },
    });
    return responded ? result : null;
  };

  // Ausgangslage: ein alter eigener Cache und der Cache einer FREMDEN App am selben Ursprung
  store.set('lucas-adventure-alt', new Map());
  store.set('fremde-app-cache-v1', new Map([['https://example.github.io/andere-app/x', new Response('x')]]));

  await dispatchLifecycle('install');
  await dispatchLifecycle('activate');

  const names = [...store.keys()];
  const current = names.filter((name) => name.startsWith('lucas-adventure-') && name !== 'lucas-adventure-alt');
  check(current.length === 1 && store.get(current[0]).size === precache.length, 'Offline-Simulation: Installation legt alle Dateien im neuen Cache ab');
  check(!names.includes('lucas-adventure-alt'), 'Offline-Simulation: alter eigener Cache wird beim Aktivieren gelöscht');
  check(names.includes('fremde-app-cache-v1'), 'Unabhängigkeit: Cache einer fremden App am selben Ursprung bleibt unangetastet');

  const online200 = await request(SCOPE, { mode: 'navigate' });
  check(online200.status === 200 && (await online200.text()).includes('id="app"'), 'Online-Simulation: Seitenaufruf liefert die App');

  online = false; // ab jetzt kein Netz mehr
  const startOffline = await request(SCOPE, { mode: 'navigate' });
  check(startOffline.status === 200 && (await startOffline.text()).includes('id="app"'), 'Offline-Simulation: Start der App (Home-Bildschirm-Symbol) ohne Netz');
  const withQuery = await request(`${SCOPE}?utm=1`, { mode: 'navigate' });
  check(withQuery.status === 200, 'Offline-Simulation: Seitenaufruf mit Anhang (?…) ohne Netz');
  const indexOffline = await request(`${SCOPE}index.html`, { mode: 'navigate' });
  check(indexOffline.status === 200, 'Offline-Simulation: index.html ohne Netz');

  const unreachable = [];
  for (const file of precacheFiles) {
    const response = await request(`${SCOPE}${file}`);
    if (!response || response.status !== 200) unreachable.push(file);
  }
  check(unreachable.length === 0, `Offline-Simulation: alle ${precacheFiles.size} Dateien (Skripte, Styles, Spiele, Icons, Manifest) ohne Netz abrufbar${unreachable.length ? ` – nicht: ${unreachable.join(', ')}` : ''}`);

  check((await request('https://anderer-host.example/x.js')) === null, 'Offline-Simulation: fremde Hosts werden nicht abgefangen');
  check((await request(`${SCOPE}irgendwas`, { method: 'POST' })) === null, 'Offline-Simulation: Nicht-GET-Anfragen werden nicht abgefangen');

  let rejected = false;
  try {
    await request(`${SCOPE}assets/gibt-es-nicht.js`);
  } catch {
    rejected = true;
  }
  check(rejected, 'Offline-Simulation: unbekannte Datei ohne Netz scheitert ehrlich (kein Schein-Treffer)');
}

try {
  if (swSource && precache.length) await simulateOffline();
} catch (error) {
  check(false, `Offline-Simulation ist abgestürzt: ${error.message}`);
}

// ---------- Ergebnis ----------
console.log(passed.map((text) => `✅ ${text}`).join('\n'));
if (failed.length) {
  console.error(`\n❌ ${failed.length} Prüfung(en) fehlgeschlagen:\n${failed.map((text) => `- ${text}`).join('\n')}`);
  process.exit(1);
}
console.log(`\n✅ Build-Prüfung bestanden (${passed.length} Punkte) – bereit für die Veröffentlichung.`);
