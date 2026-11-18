/*
 * Checkpoint 5 – Natalia: Erlangen Quiz
 *
 * Drei leichte Multiple-Choice-Fragen mit je drei Antworten.
 * Erfolg (Excel): 2 von 3 Fragen richtig; sofortiger Neustart mit Hinweisen erlaubt.
 *
 * Inhalte (mit Philipp abgestimmt):
 *   1. "Which of my favourite colleagues also lives in Erlangen?" – Natalia (Frage aus der Excel;
 *      falsche Antworten: Joana, Murielle)
 *   2. Bundesland von Erlangen – Bavaria
 *   3. Großes Fest auf dem Berg – Bergkirchweih
 * Keine Pudding-Bonusfrage (bewusst weggelassen).
 *
 * Ablauf: Antwort antippen → Rückmeldung (richtig/falsch, die richtige Antwort wird gezeigt) →
 * "Next". Nach Frage 3 gibt es das Ergebnis. Bei weniger als 2 richtigen Antworten startet
 * "Try again" sofort eine neue Runde (Antworten neu gemischt). Kein Game Over.
 *
 * Bedienung: nur Tippen/Klicken bzw. Tastatur – es gibt kein Ziehen oder Wischen.
 * Fehler = falsche Antwort. Der Hinweis nimmt bei der aktuellen Frage eine falsche Antwort weg.
 */
import './erlangen-quiz.css';
import { h } from '../../core/dom.js';

const QUESTIONS = [
  {
    text: 'Which of my favourite colleagues also lives in Erlangen?',
    answers: ['Natalia', 'Joana', 'Murielle'],
    correct: 'Natalia',
  },
  {
    text: 'In which German state is Erlangen?',
    answers: ['Bavaria', 'Saxony', 'Hesse'],
    correct: 'Bavaria',
  },
  {
    text: 'Which big festival takes place on the “Berg” in Erlangen every year?',
    answers: ['Bergkirchweih', 'Oktoberfest', 'Christmas market'],
    correct: 'Bergkirchweih',
  },
];

const CORRECT_NEEDED = 2;
const LETTERS = ['A', 'B', 'C'];

const TEXT = {
  progress: (n, total) => `Question ${n} of ${total}`,
  right: 'Correct!',
  wrong: (answer) => `Not quite – it's ${answer}.`,
  next: 'Next question',
  seeResult: 'See the result',
  passed: (n) =>
    n === QUESTIONS.length
      ? `${n} of ${QUESTIONS.length} correct – perfect!`
      : `${n} of ${QUESTIONS.length} correct – that's enough!`,
  failed: (n) => `${n} of ${QUESTIONS.length} correct. Let's try once more – you only need ${CORRECT_NEEDED}!`,
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
      'A little quiz about Erlangen! Answer three easy questions – two correct answers are enough. If it does not work out, you can try again right away.',
    hint: 'Trust your gut – the questions are friendly, and you only need two right. The hint removes one wrong answer.',
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
    let results = []; // true/false je beantworteter Frage dieser Runde
    let answered = false;
    let pendingHint = false; // Hinweis kam, als die Frage schon beantwortet war → gilt für die nächste
    let finished = false;
    let destroyed = false;
    let currentButtons = []; // [{ answer, el }] der aktuellen Frage

    const root = h('div', { class: 'eq' });
    container.append(root);

    function progressDots() {
      return h(
        'div',
        { class: 'eq-progress', 'aria-hidden': 'true' },
        QUESTIONS.map((_, i) => {
          const state = i < results.length ? (results[i] ? 'right' : 'wrong') : i === index ? 'current' : 'todo';
          return h('span', { class: `eq-dot eq-dot--${state}` });
        }),
      );
    }

    function eliminateOne() {
      if (answered || finished) return false;
      const question = QUESTIONS[index];
      const candidates = currentButtons.filter(
        (button) => button.answer !== question.correct && !button.el.disabled,
      );
      if (candidates.length === 0) return false;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      pick.el.disabled = true;
      pick.el.classList.add('is-eliminated');
      pick.el.append(h('span', { class: 'eq-answer__note' }, TEXT.eliminated));
      return true;
    }

    function renderQuestion() {
      const question = QUESTIONS[index];
      answered = false;

      const feedback = h('p', { class: 'eq-feedback', role: 'status', 'aria-live': 'polite' });
      const nextButton = h(
        'button',
        { type: 'button', class: 'btn btn--primary eq-next', hidden: true, onclick: advance },
        index === QUESTIONS.length - 1 ? TEXT.seeResult : TEXT.next,
      );

      currentButtons = shuffle(question.answers).map((answer, i) => ({
        answer,
        el: h(
          'button',
          { type: 'button', class: 'eq-answer', onclick: () => choose(answer) },
          h('span', { class: 'eq-answer__letter', 'aria-hidden': 'true' }, LETTERS[i]),
          h('span', { class: 'eq-answer__text' }, answer),
        ),
      }));

      const heading = h('h2', { class: 'eq-question', tabindex: '-1' }, question.text);

      root.replaceChildren(
        progressDots(),
        h(
          'section',
          { class: 'card eq-card' },
          h('p', { class: 'eyebrow' }, TEXT.progress(index + 1, QUESTIONS.length)),
          heading,
          h('div', { class: 'eq-answers' }, currentButtons.map((button) => button.el)),
          feedback,
          nextButton,
        ),
      );

      root.feedback = feedback;
      root.nextButton = nextButton;

      if (pendingHint) {
        pendingHint = false;
        eliminateOne();
      }
    }

    function choose(answer) {
      if (answered || finished || destroyed) return;
      answered = true;
      const question = QUESTIONS[index];
      const isRight = answer === question.correct;
      results.push(isRight);
      if (isRight) correctCount += 1;
      else ctx.mistake();

      currentButtons.forEach(({ answer: label, el }) => {
        el.disabled = true;
        if (label === question.correct) el.classList.add('is-right');
        else if (label === answer) el.classList.add('is-wrong');
        else el.classList.add('is-dim');
      });

      root.feedback.textContent = isRight ? TEXT.right : TEXT.wrong(question.correct);
      root.feedback.className = `eq-feedback eq-feedback--${isRight ? 'right' : 'wrong'}`;
      root.nextButton.hidden = false;
      root.nextButton.focus();
    }

    function advance() {
      if (finished || destroyed) return;
      index += 1;
      if (index < QUESTIONS.length) renderQuestion();
      else showResult();
    }

    function showResult() {
      const passed = correctCount >= CORRECT_NEEDED;
      const summary = h(
        'section',
        { class: `card card--center eq-result eq-result--${passed ? 'passed' : 'failed'}` },
        h('div', { class: 'eq-result__icon', 'aria-hidden': 'true' }, passed ? '🎉' : '💪'),
        h('p', { class: 'eq-result__text', role: 'status' }, passed ? TEXT.passed(correctCount) : TEXT.failed(correctCount)),
        !passed && h('button', { type: 'button', class: 'btn btn--primary', onclick: restart }, TEXT.retry),
      );
      root.replaceChildren(progressDots(), summary);

      if (passed) {
        finished = true;
        later(() => ctx.complete(), 1100);
      } else {
        root.querySelector('.eq-result .btn')?.focus();
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
