/*
 * Checkpoint 6 – Dominic: Italian Starter Quiz
 *
 * Eine Mini-"Lern-App" ("Lucas' Italian App" – der Scherz, dass Lucas sich eine
 * Italienisch-App gewünscht hat). Fünf Anfängerfragen: ein italienisches Wort, drei englische
 * Antworten.
 * Erfolg (Excel): 4 von 5 Fragen richtig; nach einem Fehler wird die richtige Antwort gezeigt.
 *
 * Wörter: Ciao, Grazie, Arrivederci, Buongiorno (aus der Excel) + Prego (mit Philipp abgestimmt).
 * Die falschen Antworten sind gängige, eindeutig falsche Bedeutungen.
 *
 * Ablauf: Antwort antippen → Rückmeldung mit der richtigen Antwort → "Continue". Nach Frage 5
 * gibt es das Ergebnis. Bei weniger als 4 richtigen Antworten startet "Try again" sofort eine
 * neue Runde (Antworten neu gemischt). Kein Game Over, kein Audio.
 *
 * Bedienung: nur Tippen/Klicken bzw. Tastatur – kein Ziehen oder Wischen.
 * Fehler = falsche Antwort. Der Hinweis nimmt bei der aktuellen Frage eine falsche Antwort weg.
 */
import './italian-quiz.css';
import { h } from '../../core/dom.js';

const WORDS = [
  { word: 'Ciao', meaning: 'Hello / Bye', wrong: ['Thank you', 'Please'] },
  { word: 'Grazie', meaning: 'Thank you', wrong: ['Sorry', 'Good evening'] },
  { word: 'Arrivederci', meaning: 'Goodbye', wrong: ['Welcome', 'Good luck'] },
  { word: 'Buongiorno', meaning: 'Good morning', wrong: ['Good night', 'Good evening'] },
  { word: 'Prego', meaning: "You're welcome", wrong: ['Cheers', 'Excuse me'] },
];

const CORRECT_NEEDED = 4;
const LETTERS = ['A', 'B', 'C'];

const TEXT = {
  appName: "Lucas' Italian App",
  lesson: 'Lesson 1 · Basics',
  prompt: 'What does this mean?',
  progress: (n, total) => `Question ${n} of ${total}`,
  right: 'Bravo!',
  wrong: 'Not quite',
  wrongDetail: (item) => `“${item.word}” means “${item.meaning}”.`,
  rightDetail: (item) => `“${item.word}” means “${item.meaning}”.`,
  next: 'Continue',
  seeResult: 'See my result',
  passed: (n) => (n === WORDS.length ? `${n} of ${WORDS.length} – Perfetto!` : `${n} of ${WORDS.length} – Bravissimo!`),
  failed: (n) => `${n} of ${WORDS.length}. Let's do the lesson once more – you only need ${CORRECT_NEEDED}!`,
  retry: 'Try again',
  eliminated: 'not this one',
};

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default {
  meta: {
    instructions:
      'Your very own Italian learning app! Answer five beginner questions – four correct answers do it. Wrong answers show you the right one.',
    hint: 'Think of everyday words: hello, thank you, goodbye, good morning – and the polite answer to “thank you”. The hint removes one wrong answer.',
  },

  mount(container, ctx) {
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    let index = 0;
    let correctCount = 0;
    let results = [];
    let answered = false;
    let pendingHint = false; // Hinweis kam bei beantworteter Frage → gilt für die nächste
    let finished = false;
    let destroyed = false;
    let currentButtons = [];

    const root = h('div', { class: 'it' });
    container.append(root);

    function appBar() {
      return h(
        'header',
        { class: 'it-bar' },
        h(
          'div',
          { class: 'it-bar__title' },
          h('span', { class: 'it-bar__logo', 'aria-hidden': 'true' }), // grün-weiß-rotes Abzeichen (CSS)
          h('div', null, h('p', { class: 'it-bar__name' }, TEXT.appName), h('p', { class: 'it-bar__lesson' }, TEXT.lesson)),
        ),
        h(
          'div',
          { class: 'it-progress', 'aria-hidden': 'true' },
          WORDS.map((_, i) => {
            const state = i < results.length ? (results[i] ? 'right' : 'wrong') : i === index ? 'current' : 'todo';
            return h('span', { class: `it-segment it-segment--${state}` });
          }),
        ),
      );
    }

    function eliminateOne() {
      if (answered || finished) return false;
      const item = WORDS[index];
      const candidates = currentButtons.filter((button) => button.answer !== item.meaning && !button.el.disabled);
      if (candidates.length === 0) return false;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      pick.el.disabled = true;
      pick.el.classList.add('is-eliminated');
      pick.el.append(h('span', { class: 'it-answer__note' }, TEXT.eliminated));
      return true;
    }

    function renderQuestion() {
      const item = WORDS[index];
      answered = false;

      const sheet = h('div', { class: 'it-sheet', role: 'status', 'aria-live': 'polite', hidden: true });

      currentButtons = shuffle([item.meaning, ...item.wrong]).map((answer, i) => ({
        answer,
        el: h(
          'button',
          { type: 'button', class: 'it-answer', onclick: () => choose(answer) },
          h('span', { class: 'it-answer__letter', 'aria-hidden': 'true' }, LETTERS[i]),
          h('span', { class: 'it-answer__text' }, answer),
        ),
      }));

      root.replaceChildren(
        appBar(),
        h(
          'section',
          { class: 'card it-card' },
          h('p', { class: 'eyebrow' }, `${TEXT.progress(index + 1, WORDS.length)} · ${TEXT.prompt}`),
          h('h2', { class: 'it-word', lang: 'it' }, item.word),
          h('div', { class: 'it-answers' }, currentButtons.map((button) => button.el)),
          sheet,
        ),
      );
      root.sheet = sheet;

      if (pendingHint) {
        pendingHint = false;
        eliminateOne();
      }
    }

    function choose(answer) {
      if (answered || finished || destroyed) return;
      answered = true;
      const item = WORDS[index];
      const isRight = answer === item.meaning;
      results.push(isRight);
      if (isRight) correctCount += 1;
      else ctx.mistake();

      currentButtons.forEach(({ answer: label, el }) => {
        el.disabled = true;
        if (label === item.meaning) el.classList.add('is-right');
        else if (label === answer) el.classList.add('is-wrong');
        else el.classList.add('is-dim');
      });

      const nextButton = h(
        'button',
        { type: 'button', class: 'btn btn--primary it-next', onclick: advance },
        index === WORDS.length - 1 ? TEXT.seeResult : TEXT.next,
      );
      root.sheet.className = `it-sheet it-sheet--${isRight ? 'right' : 'wrong'}`;
      root.sheet.hidden = false;
      root.sheet.replaceChildren(
        h('p', { class: 'it-sheet__title' }, isRight ? TEXT.right : TEXT.wrong),
        h('p', { class: 'it-sheet__detail' }, isRight ? TEXT.rightDetail(item) : TEXT.wrongDetail(item)),
        nextButton,
      );
      nextButton.focus();

      // Fortschrittsleiste sofort aktualisieren
      const segments = root.querySelectorAll('.it-segment');
      segments[index].className = `it-segment it-segment--${isRight ? 'right' : 'wrong'}`;
    }

    function advance() {
      if (finished || destroyed) return;
      index += 1;
      if (index < WORDS.length) renderQuestion();
      else showResult();
    }

    function showResult() {
      const passed = correctCount >= CORRECT_NEEDED;
      root.replaceChildren(
        appBar(),
        h(
          'section',
          { class: `card card--center it-result it-result--${passed ? 'passed' : 'failed'}` },
          h('div', { class: 'it-result__icon', 'aria-hidden': 'true' }, passed ? '🎉' : '💪'),
          h('p', { class: 'it-result__text', role: 'status' }, passed ? TEXT.passed(correctCount) : TEXT.failed(correctCount)),
          !passed && h('button', { type: 'button', class: 'btn btn--primary', onclick: restart }, TEXT.retry),
        ),
      );
      if (passed) {
        finished = true;
        later(() => ctx.complete(), 1200);
      } else {
        root.querySelector('.it-result .btn')?.focus();
      }
    }

    function restart() {
      if (finished || destroyed) return;
      index = 0;
      correctCount = 0;
      results = [];
      renderQuestion();
    }

    // Hinweis: bei der aktuellen Frage fällt eine falsche Antwort weg (sonst bei der nächsten).
    ctx.onHint(() => {
      if (!eliminateOne() && answered) pendingHint = true;
    });

    renderQuestion();

    return () => {
      destroyed = true;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  },
};
