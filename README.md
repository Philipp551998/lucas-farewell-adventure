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
scripts/check-data.mjs     Datenprüfung
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

Schritt für Schritt (einmalig):

1. Lokales Repository anlegen und prüfen, dass die Excel **nicht** aufgeführt wird:

   ```bash
   git init -b main
   git add .
   git status
   ```

   In der Liste dürfen `Lucas_Farewell_App_Handoff.xlsx`, `node_modules/` und `dist/` **nicht** stehen. `package-lock.json` dagegen muss dabei sein (die Veröffentlichung nutzt `npm ci`).

2. Ersten Commit erstellen: `git commit -m "Lucas Farewell Adventure"`
3. Auf GitHub ein **öffentliches** Repository anlegen (ohne README/.gitignore), das angezeigte Remote hinzufügen (`git remote add origin <URL>`) und pushen (`git push -u origin main`).
4. Im Repository: **Settings → Pages → Source: GitHub Actions**.
5. Der Push startet `.github/workflows/deploy.yml`: Datenprüfung, Build, Veröffentlichung. Danach ist die App unter `https://<name>.github.io/<repo>/` erreichbar (Reiter **Actions** zeigt den Fortschritt).

Spätere Änderungen: committen und pushen – die App wird automatisch neu veröffentlicht.

Die App nutzt relative Pfade (`base: './'`) und Hash-Routing – sie läuft daher unter jedem Unterpfad ohne weitere Anpassung (mit einem Unterpfad-Test geprüft).

> **Wichtig:** Die Excel-Datei `Lucas_Farewell_App_Handoff.xlsx` ist in der `.gitignore` eingetragen und darf nicht ins Repository gelangen (mit einem Test-Repository geprüft).
>
> **Hinweis zur Überraschung:** Die Nachrichten stecken im öffentlichen Code und sind damit für jede Person mit dem Link lesbar, auch ohne die Spiele zu spielen. Den Link also erst kurz vor dem Überreichen weitergeben. Du hast der Veröffentlichung der Nachrichten mit den Beteiligten zugestimmt.

## Vor dem Überreichen testen

- Auf einem echten iPhone in Safari öffnen, **Teilen → Zum Home-Bildschirm** (PWA) und alle acht Spiele einmal spielen.
- Offline-Betrieb: `npm run build` und `npm run preview`, im Browser öffnen, einmal neu laden, dann das Netz trennen und neu laden.
- Fortschritt zurücksetzen: in der App **Reset adventure**.
