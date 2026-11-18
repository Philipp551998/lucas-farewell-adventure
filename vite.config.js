import { defineConfig } from 'vite';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Trägt nach dem Build Build-ID und Dateiliste in dist/sw.js ein,
 * damit der Service Worker die komplette App offline vorhalten kann.
 * Bewusst als kleines Inline-Plugin umgesetzt – keine zusätzliche Abhängigkeit.
 */
function serviceWorkerPrecache() {
  let outDir = 'dist';
  return {
    name: 'service-worker-precache',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const files = [];
      const walk = (dir) => {
        for (const name of readdirSync(dir)) {
          const full = join(dir, name);
          if (statSync(full).isDirectory()) walk(full);
          else files.push(relative(outDir, full).split('\\').join('/'));
        }
      };
      walk(outDir);

      const urls = ['./']
        .concat(files.filter((f) => f !== 'sw.js' && !f.endsWith('.map')).map((f) => './' + f));

      const swPath = join(outDir, 'sw.js');
      const source = readFileSync(swPath, 'utf8')
        .replace('__BUILD_ID__', Date.now().toString(36))
        .replace(/\/\*__PRECACHE_URLS__\*\/\s*\[[^\]]*\]/, JSON.stringify(urls));
      writeFileSync(swPath, source);
    },
  };
}

export default defineConfig({
  // Relative Pfade: funktioniert auf GitHub Pages unter /<repo-name>/ genauso
  // wie lokal oder bei jedem anderen Hosting – ohne den Repo-Namen festzulegen.
  base: './',
  plugins: [serviceWorkerPrecache()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
