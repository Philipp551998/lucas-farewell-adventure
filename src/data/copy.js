/*
 * Alle Oberflächentexte der App (Englisch) an einer Stelle.
 * Die persönlichen Nachrichten stehen NICHT hier, sondern in messages.json.
 *
 * Hinweis: Die Texte sind vorläufige Platzhalter und werden im Design-Schritt
 * gemeinsam mit Philipp verfeinert.
 */
export const COPY = {
  appName: 'Lucas Farewell Adventure',

  welcome: {
    eyebrow: 'A surprise for Lucas',
    lead: 'Eight stops, eight little games, eight messages – all just for you.',
    start: 'Start the adventure',
    continue: 'Continue the adventure',
  },

  map: {
    title: 'Your adventure map',
    progress: (done, total) => `${done} / ${total}`,
    locked: 'Finish the previous stop first!',
    finaleLocked: 'Complete all eight stops to open the finale!',
    finaleLabel: 'Finale',
    stopLabel: (order) => `Stop ${order}`,
    open: 'Open',
    done: 'Done',
    skippedHint: 'Skipped – tap to read the message',
  },

  game: {
    backToMap: 'Back to the map',
    stopLabel: (order, total) => `Stop ${order} of ${total}`,
    loading: 'Loading the game…',
    introHeading: (person) => `${person}'s checkpoint`,
    start: "Let's play!",
    mistakes: (count) => `Oops: ${count}`,
    hintButton: 'Need a hint?',
    skip: 'Skip',
    skipConfirmTitle: 'Skip this game?',
    skipConfirmText: 'No problem – you will still get the message.',
    skipConfirmYes: 'Skip & read message',
    skipConfirmNo: 'Keep playing',
    skipBannerText: 'Stuck? No worries – skip this game and read the message anyway.',
    skipBannerButton: 'Skip & read the message',
    loadError: "This game didn't load.",
    loadErrorText: 'Your message is still waiting for you.',
    retry: 'Try again',
  },

  success: {
    title: 'Nice one!',
    text: (person) => `You unlocked ${person}'s message.`,
    button: 'Open message',
  },

  message: {
    from: 'A message from',
    backToMap: 'Back to the map',
    toFinale: 'On to the finale',
    skippedNote: 'You skipped the game – the message is yours anyway.',
  },

  // ENTWURF – Finale-Text, wird mit Philipp abgestimmt
  finale: {
    eyebrow: 'All eight stops complete',
    title: 'Thank you, Lucas!',
    text: 'Eight games, eight friends, eight messages – and one big thank you from all of us. Go and shine in your new role!',
    toWall: 'Open the Memory Wall',
  },

  wall: {
    title: 'Memory Wall',
    lead: 'All eight messages in one place – read them whenever you like.',
    backToMap: 'Back to the map',
  },

  reset: {
    button: 'Reset adventure',
    confirmTitle: 'Reset the adventure?',
    confirmText: 'All progress will be deleted and you start again from the first stop.',
    confirmYes: 'Yes, reset',
    confirmNo: 'Cancel',
  },
};
