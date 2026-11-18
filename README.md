# Lucas Farewell Adventure

Eine kleine Progressive Web App (PWA): Lucas wandert über eine Abenteuerkarte, löst acht Mini-Games und schaltet damit die persönlichen Abschiedsnachrichten seiner Kolleg:innen frei.

**Technik:** Vite · Vanilla JavaScript (ES Modules) · HTML · CSS · LocalStorage · Web App Manifest · Service Worker.
Kein React, kein Backend, keine Datenbank, kein Login, keine externe API.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) ab Version 20.19 (LTS empfohlen).

```bash
npm install
npm run dev
```

Danach die angezeigte Adresse (meist `http://localhost:5173`) im Browser öffnen.

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver mit Live-Reload |
| `npm run dev:phone` | Wie `dev`, aber im WLAN erreichbar – zum Testen auf dem iPhone |
| `npm run check` | Prüft, dass Person ↔ Spiel ↔ Nachricht vollständig verbunden sind |
| `npm run build` | Erzeugt den fertigen Build im Ordner `dist/` |
| `npm run check:build` | Prüft den fertigen Build: Datenschutz, Unterpfad, iPhone/PWA, Service Worker, Offline-Simulation |
| `npm run preview` | Zeigt den Build lokal an (hier ist auch der Service Worker aktiv) |

Fortschritt zurücksetzen: in der App auf **Reset adventure** tippen (oder in den Browser-Entwicklertools `localStorage` leeren).

## Projektstruktur

```
index.html                 Einstiegsseite
public/                    Dateien, die unverändert ausgeliefert werden
  manifest.webmanifest       PWA-Manifest (Name, Icons, Farben)
  sw.js                      Service Worker (Offline-Fähigkeit)
  icons/                     App-Icons (vorläufig)
src/
  main.js                    Startpunkt, Service-Worker-Registrierung
  app.js                     App-Shell: Router + Zugriffsregeln
  config.js                  Schwellenwerte (Hinweis ab 2, Skip-Hervorhebung ab >3 Fehlern)
  core/
    dom.js                     kleiner DOM-Helfer
    router.js                  Hash-Router (#/map, #/checkpoint/joana …)
    store.js                   Spielfortschritt (LocalStorage)
  data/
    checkpoints.js             die 8 Checkpoints (Person, Spiel, Erfolgsregel, Kartenposition)
    messages.json              die 8 Nachrichten – 1:1 aus der Excel übernommen
    messages.js                Zugriff + Abschnittstitel
    copy.js                    alle Oberflächentexte (Englisch)
  games/
    registry.js                verbindet gameId → Spielmodul (und dokumentiert den Spiel-Vertrag)
    shared/decoyIcons.js       gemeinsame Ablenkungs-Icons (Recipe Rush, Wedding Catch)
    portugal-swipe/ … python-path/   je Spiel ein eigener Ordner
  screens/                   Welcome, Map, Checkpoint, Message, Finale, Memory Wall
  ui/                        GameShell, SuccessModal, MessageCard, CheckpointMarker, Dialog, Toast, Reset,
                             stationArt (Illustrationen der 8 Stationen, Truhe, Spielfigur),
                             mapScene (Landschaft der Karte), confetti
  styles/                    tokens.css, base.css, components.css, screens.css
scripts/check-data.mjs     Datenprüfung (Person ↔ Spiel ↔ Nachricht)
scripts/check-build.mjs    Build-Prüfung (Datenschutz, Unterpfad, iPhone/PWA, Service Worker, Offline-Simulation)
.github/workflows/deploy.yml  Veröffentlichung auf GitHub Pages
```

### Ablauf in der App

`Welcome → Map → Checkpoint (Spiel) → Success → Message Card → Map → … → Finale → Memory Wall`

- Checkpoints werden der Reihe nach freigeschaltet.
- Nach 2 Fehlern erscheint „Need a hint?“, bei mehr als 3 Fehlern wird „Skip“ deutlich hervorgehoben.
- Ein Skip zählt als abgeschlossen – die Nachricht ist immer erreichbar.
- Abgeschlossene Nachrichten lassen sich jederzeit über die Karte erneut öffnen.

### Design (Phase 5)

- **Karte:** illustrierte Landschaft (Berge, See, Meer, Wäldchen) mit acht eigenen Station-Illustrationen. Eine Spielfigur wie im Brettspiel steht an der aktuellen Station und läuft nach einem gelösten Spiel den Weg zur nächsten.
- **Erfolg:** Konfetti-Explosion, die Station springt als Illustration auf. Die Nachrichtenkarte baut Name und die drei Abschnitte nacheinander auf.
- **Finale:** geöffnete Truhe mit Lichtstrahlen, Konfetti und Feuerwerk, dazu ein kurzer Text (**Entwurf**, steht in `src/data/copy.js` unter `finale`). Danach die **Memory Wall** als Pinnwand mit allen acht Nachrichten.
- Alle Illustrationen sind eigene SVGs; alle Animationen sind CSS/JS ohne Bibliothek und bei „reduzierte Bewegung“ abgeschwächt oder aus.

### Stand der Spiele

| Checkpoint | Spiel | Stand |
| --- | --- | --- |
| 1 Joana | Portugal Swipe Challenge | **spielbar** (Wischen, Tippen, Tastatur; einfache SVG-Motive) |
| 2 Murielle | Recipe Rush | **spielbar** (Pancakes: Flour, Eggs, Milk, Butter; Ziehen, Tippen, Tastatur) |
| 3 Ilonka | Wedding Catch | **spielbar** (Korb fängt Strauß + 2 Ringe in 45 s; Ziehen, Tippen, Pfeil-Buttons, Pfeiltasten) |
| 4 Borke | Lotta's Treat Trail | **spielbar** (Park-Weg 7 × 8, 6 Knochen, mind. 4 nötig; Tippen, Pfeil-Buttons, Pfeiltasten) |
| 5 Natalia | Erlangen Quiz | **spielbar** (3 Fragen, 2 richtige reichen; Neustart mit Hinweis) |
| 7 Philipp | App-in-an-App Builder | **spielbar** (Idea → Design → Build → Launch, dann „Run App“; Ziehen, Tippen, Tastatur) |
| 6 Dominic | Italian Starter Quiz | **spielbar** (5 Wörter, 4 richtige nötig; Lern-App-Stil „Lucas' Italian App“) |
| 8 Açelya | Python Path Decoder (Snake) | **spielbar** (Snake frisst 8 Python-Begriffe und wächst; sich selbst berühren = Neustart; Wischen, Pfeil-Buttons, Pfeiltasten) |

Portugal Swipe: Ablenkungen zu erwischen zählt als Fehler, verpasste portugiesische Motive kosten nichts. Beim 4. Fehler startet die Runde sanft neu (etwas langsamer). Der Hinweis lässt die portugiesischen Motive kurz aufleuchten.

Recipe Rush: Eine Ablenkung (Sock, Rubber duck, Alarm clock) in die Schüssel zu legen zählt als Fehler und löst einen lustigen Kommentar aus. Kein Zeitdruck. Der Hinweis lässt die richtigen Zutaten aufleuchten. Die Kommentare stehen in `src/games/recipe-rush/icons.js`.

Wedding Catch: Eine gefangene Ablenkung zählt als Fehler. Läuft die Zeit ab, startet die Runde sanft neu (etwas langsamer, mehr gute Items) – das zählt nicht als Fehler. Das Zeitlimit steht als `TIME_LIMIT` oben in `src/games/wedding-catch/index.js`. Die Ablenkungs-Icons liegen gemeinsam mit Recipe Rush in `src/games/shared/decoyIcons.js`.

Lotta's Treat Trail: Gegen Baum, Busch oder Teich zu laufen zählt als Fehler (mit freundlichem Spruch). Das Ziel ohne genug Knochen zu erreichen ist kein Fehler. Der Hinweis zeigt den Weg zum nächsten Knochen. Der Park-Plan steht als `MAP` oben in `src/games/lottas-treat-trail/index.js`. Lotta ist ein neutraler Cartoon-Hund – ihr Aussehen steht in `icons.js` (`lotta()`) und wird angepasst, sobald Fellfarbe und Rasse feststehen.

Erlangen Quiz: Eine falsche Antwort zählt als Fehler und zeigt die richtige Antwort. Bei weniger als 2 richtigen Antworten startet „Try again“ sofort eine neue Runde. Der Hinweis nimmt bei der aktuellen Frage eine falsche Antwort weg. Die Fragen stehen als `QUESTIONS` oben in `src/games/erlangen-quiz/index.js` (Frage 1 aus der Excel, falsche Antworten Joana und Murielle).

App-in-an-App Builder: „Run App“ mit falscher Reihenfolge zählt als Fehler; die falsch platzierten Karten werden markiert und gehen zurück in den Werkzeugkasten, richtige bleiben liegen. Der Hinweis lässt den nächsten richtigen Schritt aufleuchten. Die Reihenfolge steht als `STEPS` in `src/games/app-builder/icons.js`.

Italian Starter Quiz: Ein italienisches Wort, drei englische Antworten. Eine falsche Antwort zählt als Fehler und zeigt die richtige Antwort. Bei weniger als 4 richtigen Antworten startet „Try again“ sofort eine neue Runde. Der Hinweis nimmt bei der aktuellen Frage eine falsche Antwort weg. Die Wörter stehen als `WORDS` oben in `src/games/italian-quiz/index.js` (Ciao, Grazie, Arrivederci, Buongiorno aus der Excel, Prego als fünftes Wort).

Python-Snake (Açelya): Konzept von Philipp (ersetzt die Excel-Idee „fehlende Code-Zeile wählen“). Die Schlange frisst nacheinander aufpoppende Python-Begriffe und wird je Begriff um 2 Felder länger; die Ränder sind durchlässig, nur der eigene Körper ist gefährlich. Ihn zu berühren zählt als Fehler und startet sofort eine neue Runde (etwas langsamer) – kein hartes Game Over. Der Hinweis zeigt einen gepunkteten Weg zum nächsten Begriff. Die Begriffe stehen als `TERMS` oben in `src/games/python-path/index.js`.

### Ein Spiel hinzufügen oder ersetzen

Jedes Spiel exportiert `meta` (Anleitung, Hinweis) und `mount(container, ctx)`. Die genaue Beschreibung steht oben in [`src/games/registry.js`](src/games/registry.js). Fehlerzähler, Hinweis, Skip und Erfolgs-Animation übernimmt die GameShell – ein Spiel baut nur sein Spielfeld.

## Nachrichten

Die Texte in `src/data/messages.json` sind unverändert aus der Excel-Datei erzeugt (inklusive Tippfehlern, Emojis und Sonderzeichen). **Nicht umformulieren oder korrigieren**, ohne vorher Rücksprache zu halten.

## Veröffentlichung (GitHub Pages)

### Was vorbereitet ist

| Anforderung | Umsetzung |
| --- | --- |
| Öffentlich über HTTPS | GitHub Pages liefert jede Seite automatisch über **HTTPS** aus (`https://<name>.github.io/<repo>/`). Das brauchen auch App-Installation und Service Worker. |
| Automatischer Bau | `.github/workflows/deploy.yml`: Bei jedem Push auf `main` wird gebaut, geprüft und veröffentlicht. Schlägt ein Schritt fehl, wird **nichts** veröffentlicht. |
| Richtiger Unterpfad | `base: './'`, Hash-Routing, relative Pfade im Manifest und im Service Worker. Läuft unter `/<repo-name>/` ohne Anpassung, **egal wie das Repository heißt**. |
| iPhone / Home-Bildschirm | Apple-Touch-Icon 180×180 (lückenlos deckend, ohne Transparenz), Manifest mit `display: standalone`, Meta-Tags für den app-ähnlichen Start, Safe-Areas für Notch und Home-Indikator. |
| Offline-Betrieb | Der Service Worker legt beim ersten Laden **alle** Dateien (Skripte, Styles, alle Spiele, Icons, Manifest) im Cache ab. Per Simulation geprüft (`npm run check:build`). |
| Keine privaten Dateien | `.gitignore`, ein Wächter-Schritt im Workflow und eine Prüfung des fertigen Builds (keine Excel-/Office-/Schlüsseldateien, keine lokalen Pfade). `noindex` hält Suchmaschinen fern. |
| Unabhängig von anderen Projekten | Eigener Ordner, eigenes Repository, einzige Abhängigkeit ist Vite. Eigene Speicher-Namen (`lucas-farewell-adventure:…`, Cache-Präfix `lucas-adventure-`). Der Service Worker löscht nur eigene Caches. |

Die Prüfungen laufen lokal mit `npm run check` (Daten) und `npm run check:build` (Build, nach `npm run build`) und automatisch im Workflow.

### Schritt für Schritt (einmalig)

**1. Lokal committen** (im Projektordner im Terminal):

```bash
git status
```

Es dürfen weder `Lucas_Farewell_App_Handoff.xlsx` noch `node_modules/` noch `dist/` aufgeführt sein. Dann:

```bash
git add .
git commit -m "Veröffentlichung vorbereiten"
```

**2. Neues Repository auf GitHub anlegen** (im Browser, eingeloggt):
`github.com` → **+** (oben rechts) → **New repository**.
- *Repository name:* z. B. `lucas-farewell-adventure` (der Name wird Teil der Adresse)
- **Public** auswählen
- **Keine** Häkchen bei „Add a README file“, „.gitignore“ oder „license“ setzen
- **Create repository**

Es muss ein **eigenes, neues** Repository sein – nicht das Repository der Portugiesisch-Lernapp.

**3. GitHub Pages aktivieren** (noch vor dem ersten Push):
Im neuen Repository → **Settings** → links **Pages** → bei *Build and deployment* → *Source* → **GitHub Actions** wählen.

**4. Verbinden und hochladen** (Terminal im Projektordner; `<DEIN-NAME>` ist dein GitHub-Benutzername):

```bash
git remote add origin https://github.com/<DEIN-NAME>/lucas-farewell-adventure.git
```
```bash
git push -u origin main
```

Beim ersten Push fragt Git ggf. nach der Anmeldung bei GitHub (Browser-Fenster oder Zugangstoken).

**5. Fortschritt ansehen:** Repository → Reiter **Actions** → Lauf „Deploy to GitHub Pages“. Zwei Schritte (*build*, *deploy*) werden grün. Bei Rot: den roten Schritt anklicken, die Fehlermeldung steht im Protokoll.

**6. Adresse finden:** Nach dem grünen Lauf unter **Settings → Pages** („Your site is live at …“) oder im Schritt *deploy* des Actions-Laufs. Sie lautet `https://<DEIN-NAME>.github.io/lucas-farewell-adventure/`.

Falls der erste Lauf fehlschlug, weil Pages noch nicht aktiviert war: Schritt 3 nachholen, dann **Actions → Deploy to GitHub Pages → Run workflow**.

### Auf dem iPhone installieren

1. In **Safari** (nicht Chrome) die Adresse öffnen und die Seite **vollständig laden lassen** (einmal mit Internet; danach ist alles offline verfügbar).
2. **Teilen**-Symbol (Quadrat mit Pfeil) → **Zum Home-Bildschirm** → Namen bestätigen („Lucas Adventure“) → **Hinzufügen**.
3. Symbol auf dem Home-Bildschirm antippen: Die App startet ohne Safari-Leisten.

Gut zu wissen: Die installierte App hat einen **eigenen Speicher**. Fortschritt aus einem Safari-Tab wird dort nicht übernommen. Vor dem Überreichen deshalb in der installierten App **Reset adventure** drücken. Empfohlen: iOS 16.4 oder neuer (mindestens iOS 15.4).

### Offline testen

1. App einmal mit Internet öffnen.
2. Flugmodus einschalten.
3. App vom Home-Bildschirm starten: Karte, Spiele und Nachrichten müssen funktionieren.

Am Rechner: `npm run build`, `npm run preview`, im Browser öffnen, neu laden, in den Entwicklertools unter *Application → Service Workers* „Offline“ anhaken und neu laden.

### Änderungen später veröffentlichen

Änderungen committen und mit `git push` hochladen – die App wird automatisch neu gebaut und veröffentlicht. Online lädt die Seite immer die neueste Version. Der neue Offline-Speicher wird aktiv, sobald die App einmal komplett geschlossen war (auf dem iPhone: im App-Umschalter wegwischen und neu öffnen).

### Datenschutz und Überraschung

- Die **Excel-Datei** ist in der `.gitignore`, ein Wächter-Schritt im Workflow bricht ab, falls sie je versioniert würde, und die Build-Prüfung kontrolliert den fertigen Build.
- Die **Nachrichten** stecken im öffentlichen Code und sind für jede Person mit dem Link lesbar, auch ohne die Spiele zu spielen. Du hast der Veröffentlichung mit den Beteiligten zugestimmt. Den Link erst kurz vor dem Überreichen weitergeben.
- `noindex` bittet Suchmaschinen, die Seite nicht aufzunehmen. Das Repository selbst ist auf GitHub öffentlich sichtbar.
- Die Git-Identität in diesem Projekt ist `Philipp <philipp@users.noreply.github.com>` (nur lokal gesetzt), die echte E-Mail erscheint nirgends.

### Unabhängigkeit von anderen Projekten

Dieses Projekt teilt keinen Code, keine Dateien und keine Abhängigkeiten mit anderen Apps. Liegen mehrere Apps unter derselben `<name>.github.io`-Adresse, teilen sich Browser den Speicher pro Domain – die Namen hier sind eindeutig (`lucas-farewell-adventure:…`), und der Service Worker löscht ausschließlich Caches mit dem Präfix `lucas-adventure-`. Das ist in der Offline-Simulation mit dem Cache einer fremden App belegt.
