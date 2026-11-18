/*
 * Zugriff auf die persönlichen Nachrichten.
 *
 * Die Texte liegen unverändert in messages.json (erzeugt 1:1 aus dem Excel-Blatt
 * "Messages for Lucas"). Sie dürfen nicht umformuliert, gekürzt oder korrigiert
 * werden – auch Tippfehler, Emojis und Sonderzeichen bleiben erhalten.
 *
 * Die Abschnittstitel entsprechen den Spaltenüberschriften der Excel-Datei.
 */
import messages from './messages.json';

export const MESSAGE_SECTIONS = [
  { key: 'appreciation', title: 'What I appreciate about Lucas' },
  { key: 'memory', title: 'A memory / personal note' },
  { key: 'wishes', title: 'Wishes for the new role' },
];

/** @returns {{name: string, appreciation: string, memory: string, wishes: string} | null} */
export function getMessage(id) {
  return messages[id] ?? null;
}
