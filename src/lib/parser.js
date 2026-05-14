// QuizGive — quizfetch HTML parser.
// Looks for the patterns produced by quizfetch:
//   .report-header h1                 → quiz title
//   "Course: …" inside .report-header → course code
//   .question-card                    → each question
//     > h3                            → prompt ("N. <text>")
//     > .answer-choice                → option
//        data-was-correct="true"      → correct option marker
//        .choice-text                 → option label
//
// Falls back gracefully if classes are missing.

export function parseQuizfetch(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');

  // ── title + course ─────────────────────────────────────────
  const header = doc.querySelector('.report-header') || doc.body;
  let title = (header.querySelector('h1')?.textContent || doc.title || 'Untitled quiz').trim();
  title = title.replace(/\s+/g, ' ');

  let course = '';
  const courseStrong = Array.from(header.querySelectorAll('strong'))
    .find((s) => /course/i.test(s.textContent || ''));
  if (courseStrong) {
    const span = courseStrong.closest('span') || courseStrong.parentElement;
    course = (span?.textContent || '').replace(/^\s*course\s*:?\s*/i, '').trim();
  }
  if (!course) {
    const m = (header.textContent || '').match(/course\s*:?\s*([A-Z0-9_\-]+)/i);
    if (m) course = m[1];
  }

  // ── questions ──────────────────────────────────────────────
  const cards = Array.from(doc.querySelectorAll('.question-card'));
  const questions = cards.map((card, i) => {
    const h3 = card.querySelector('h3, .question-text, .prompt');
    let prompt = (h3?.textContent || '').trim();
    prompt = prompt.replace(/^\s*\d+\.\s*/, '');
    prompt = prompt.replace(/[""]/g, '"').replace(/['']/g, "'");

    const chEls = Array.from(card.querySelectorAll('.answer-choice'));
    const raw = chEls.map((ch) => {
      const text = (ch.querySelector('.choice-text')?.textContent || ch.textContent || '').trim();
      const cleaned = text.replace(/[""]/g, '"').replace(/['']/g, "'");
      const isPlaceholder = /no answer text provided/i.test(cleaned);
      return {
        text: cleaned,
        correct: ch.getAttribute('data-was-correct') === 'true',
        keep: !!cleaned && !isPlaceholder,
      };
    });

    const kept = raw.filter((r) => r.keep);
    const choices = kept.map((r) => r.text);
    const correctIdx = kept.findIndex((r) => r.correct);

    return { id: `q${i}`, prompt, choices, correctIdx };
  })
  .filter((q) => q.prompt && q.choices.length >= 2 && q.correctIdx >= 0);

  return {
    id: 'quiz_' + Math.random().toString(36).slice(2, 10),
    title,
    course,
    questions,
    createdAt: Date.now(),
    sourceFilename: '',
  };
}
