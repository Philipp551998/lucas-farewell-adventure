// Zentrale Einstellungen. Hier lassen sich Schwellenwerte ändern, ohne Spiel-Code anzufassen.

export const APP_NAME = 'Lucas Farewell Adventure';

// LocalStorage
export const STORAGE_KEY = 'lucas-farewell-adventure:progress';
export const STORAGE_VERSION = 1;

// Fehler-Logik (gilt für alle Spiele, gesteuert von der GameShell)
export const HINT_AFTER_MISTAKES = 2; // ab 2 Fehlern wird ein Hinweis angeboten
export const SKIP_HIGHLIGHT_AFTER_MISTAKES = 3; // bei MEHR als 3 Fehlern wird "Skip" hervorgehoben
