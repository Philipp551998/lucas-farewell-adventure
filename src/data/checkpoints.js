/*
 * Die acht Checkpoints – Quelle: Excel-Blatt "App Game Plan".
 *
 * Person ↔ Spiel ↔ Nachricht sind über die `id` fest verbunden:
 *   - checkpoint.id  →  Eintrag in messages.json (gleicher Schlüssel)
 *   - checkpoint.gameId  →  Ordner src/games/<gameId>/ (siehe games/registry.js)
 *
 * Die Reihenfolge (`order`) darf gestalterisch angepasst werden, die Zuordnung nicht.
 * `icon` und `mapPosition` sind vorläufig (Emoji / grobe Position) und werden mit
 * den illustrierten Stationen ersetzt.
 *
 * mapPosition: x in % der Kartenbreite, y in % der Kartenhöhe.
 */
export const CHECKPOINTS = [
  {
    id: 'joana',
    order: 1,
    person: 'Joana',
    theme: "Portugal vs. Germany / Joana's Portuguese connection",
    gameId: 'portugal-swipe',
    gameTitle: 'Portugal Swipe Challenge',
    gameIdea:
      'Portuguese icons (pastel de nata, beach, sun, sardine, azulejo) and German decoys (pretzel, lederhosen, snowflake) fall down; swipe or tap only the Portuguese items.',
    successRule: 'Collect 8 Portuguese items while making no more than 3 mistakes',
    icon: '☀️',
    mapPosition: { x: 24, y: 7 },
  },
  {
    id: 'murielle',
    order: 2,
    person: 'Murielle',
    theme: "Cooking / Murielle's cooking-related gift idea",
    gameId: 'recipe-rush',
    gameTitle: 'Recipe Rush',
    gameIdea: 'drag the correct ingredients into a bowl to complete a simple recipe.',
    successRule: 'Place all required ingredients correctly; hints appear after two mistakes',
    icon: '🍳',
    mapPosition: { x: 74, y: 18 },
  },
  {
    id: 'ilonka',
    order: 3,
    person: 'Ilonka',
    theme: "Wedding celebration / Ilonka's recent wedding announcement",
    gameId: 'wedding-catch',
    gameTitle: 'Wedding Catch',
    gameIdea:
      'move a small basket to catch wedding rings and a bouquet while avoiding funny decoy items.',
    successRule:
      'Catch the bouquet and two rings before time runs out; generous retry or hint option',
    icon: '💍',
    mapPosition: { x: 28, y: 29 },
  },
  {
    id: 'borke',
    order: 4,
    person: 'Borke',
    theme: 'Dogs / Lotta, who is mentioned repeatedly in the team messages',
    gameId: 'lottas-treat-trail',
    gameTitle: "Lotta's Treat Trail",
    gameIdea:
      "guide Lotta through a short park route and collect treats on the way to Borke's checkpoint.",
    successRule: 'Reach the finish and collect at least 4 treats; no hard fail state',
    icon: '🐕',
    mapPosition: { x: 74, y: 40 },
  },
  {
    id: 'natalia',
    order: 5,
    person: 'Natalia',
    theme: "Erlangen / shared location and Natalia's canteen memory",
    gameId: 'erlangen-quiz',
    gameTitle: 'Erlangen Quiz',
    gameIdea:
      '3 easy multiple-choice questions, including “Which of my favourite colleagues also lives in Erlangen?” with Natalia as the correct answer.',
    successRule: 'Answer 2 of 3 questions correctly; allow immediate retry with hints',
    icon: '🍮',
    mapPosition: { x: 26, y: 51 },
  },
  {
    id: 'dominic',
    order: 6,
    person: 'Dominic',
    theme: "Italian language / Lucas's request for a future language-learning app",
    gameId: 'italian-quiz',
    gameTitle: 'Italian Starter Quiz',
    gameIdea:
      'match or select very basic words such as Ciao, Grazie, Arrivederci and Buongiorno, presented like a mini language-learning app.',
    successRule: 'Answer 4 of 5 beginner questions correctly; show the correct answer after a mistake',
    icon: '🍕',
    mapPosition: { x: 74, y: 62 },
  },
  {
    id: 'philipp',
    order: 7,
    person: 'Philipp',
    theme: "App development / Lucas's LearningHUB app and Philipp's Claude Code app",
    gameId: 'app-builder',
    gameTitle: 'App-in-an-App Builder',
    gameIdea:
      'arrange four cards in the right order - Idea, Design, Build, Launch - then press a playful “Run App” button to unlock the message.',
    successRule: 'Put all four app-building steps in the correct order and successfully run the mini app',
    icon: '📱',
    mapPosition: { x: 28, y: 73 },
  },
  {
    id: 'acelya',
    order: 8,
    person: 'Açelya',
    theme: "Python / coding, plus Açelya's curiosity and travel wish",
    gameId: 'python-path',
    gameTitle: 'Python Path Decoder',
    // Konzept von Philipp geändert (ersetzt die Excel-Idee "fehlende Code-Zeile wählen"):
    // Snake frisst bekannte Python-Begriffe und wächst; sich selbst zu berühren = Runde verloren.
    gameIdea:
      'A snake eats well-known pop-up Python words (print, run, JSON, environment, terminal, import, function, variable) and grows with each one; touching its own body before all words are eaten loses the round.',
    successRule: 'Eat all eight Python words without touching its own body; a lost round restarts right away, hints available',
    icon: '🐍',
    mapPosition: { x: 72, y: 84 },
  },
];

// Position des Finales (Schatztruhe) am Ende des Weges.
export const FINALE_MAP_POSITION = { x: 50, y: 94 };

export function getCheckpoint(id) {
  return CHECKPOINTS.find((checkpoint) => checkpoint.id === id) ?? null;
}

export function getCheckpointIndex(id) {
  return CHECKPOINTS.findIndex((checkpoint) => checkpoint.id === id);
}
