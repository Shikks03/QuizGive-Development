// Lightweight download helpers — produce plain JSON / HTML for results & quizzes.
import { nodesToHtml } from '../components/RichText.jsx';

function triggerDownload(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

function safeName(s) {
  return (s || 'quiz').replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 80);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const STYLE_THEMES = {
  sketch: `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Patrick Hand', cursive; font-size: 19px; line-height: 1.5; background: #faf9f5; color: #29261b; padding: 32px 20px; }
h1 { font-family: 'Caveat', cursive; font-size: 44px; line-height: 1.1; margin-bottom: 4px; }
.meta { font-size: 14px; color: #8a8270; margin-bottom: 28px; }
.q-card { background: #fff; border: 2px solid #29261b; border-radius: 14px; box-shadow: 3px 3px 0 0 #29261b; padding: 20px; margin-bottom: 16px; }
.q-prompt { font-size: 19px; font-weight: 600; line-height: 1.35; margin-bottom: 14px; }
.q-num { color: #8a8270; margin-right: 6px; font-size: 14px; font-weight: 400; }
.choices { display: flex; flex-direction: column; gap: 8px; }
.choice { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border: 1.5px solid #29261b; border-radius: 10px; cursor: pointer; user-select: none; }
.choice:hover:not(.disabled) { background: #f5f1e8; }
.choice input { display: none; }
.letter { font-size: 13px; font-weight: 700; color: #8a8270; flex: 0 0 18px; margin-top: 2px; }
.choice.selected { background: #faeee6; box-shadow: 3px 3px 0 0 #c96442; border-color: #c96442; }
.choice.selected .letter { color: #c96442; }
.choice.correct { background: #e2ecd6; border-color: #4f7a3a; box-shadow: 3px 3px 0 0 #4f7a3a; }
.choice.correct .letter { color: #4f7a3a; }
.choice.wrong { background: #f3dfd9; border-color: #9d3a2c; }
.choice.wrong .letter { color: #9d3a2c; }
.choice.disabled { cursor: default; }
.q-feedback { margin-top: 10px; font-size: 14px; font-weight: 600; padding: 4px 0; }
.q-feedback.ok { color: #4f7a3a; }
.q-feedback.bad { color: #9d3a2c; }
.q-explain { margin-top: 10px; font-size: 15px; color: #5c5648; padding: 10px 14px; border-left: 3px solid #c96442; background: #faeee6; border-radius: 0 8px 8px 0; }
.submit-bar { text-align: center; padding: 24px 0 40px; }
#submit-btn { font-family: 'Patrick Hand', cursive; background: #c96442; color: #fff; border: 2px solid #29261b; border-radius: 10px; box-shadow: 3px 3px 0 0 #29261b; padding: 12px 32px; font-size: 17px; font-weight: 600; cursor: pointer; }
#submit-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 0 #29261b; }
#submit-btn:disabled { background: #d4cfbc; color: #8a8270; box-shadow: 3px 3px 0 0 #d4cfbc; border-color: #d4cfbc; cursor: not-allowed; }
#score-banner { background: #fff; border: 2px solid #29261b; border-radius: 14px; box-shadow: 3px 3px 0 0 #29261b; padding: 28px 20px; text-align: center; margin-bottom: 24px; }
.score-big { font-family: 'Caveat', cursive; font-size: 56px; font-weight: 700; color: #c96442; line-height: 1; margin-bottom: 6px; }
.score-sub { font-size: 16px; color: #8a8270; }
.tally-pill { position: fixed; top: 16px; right: 16px; background: #29261b; color: #faf9f5; font-family: 'Caveat', cursive; font-size: 20px; padding: 4px 14px; border-radius: 20px; box-shadow: 2px 2px 0 0 #c96442; display: none; z-index: 100; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 0 20px; gap: 12px; }
.nav-btn { font-family: 'Patrick Hand', cursive; background: #fff; border: 2px solid #29261b; border-radius: 10px; box-shadow: 2px 2px 0 0 #29261b; padding: 8px 20px; font-size: 16px; cursor: pointer; color: #29261b; }
.nav-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 0 #29261b; }
.nav-btn:disabled { opacity: 0.4; cursor: default; transform: none; box-shadow: 2px 2px 0 0 #29261b; }
.nav-indicator { font-size: 15px; color: #8a8270; }
#reset-btn { font-family: 'Patrick Hand', cursive; background: #fff; color: #29261b; border: 2px solid #29261b; border-radius: 10px; box-shadow: 2px 2px 0 0 #29261b; padding: 8px 20px; font-size: 15px; cursor: pointer; margin-bottom: 18px; }
#reset-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 0 #29261b; }
@media (max-width: 600px) { body { padding: 20px 14px; } h1 { font-size: 34px; } .q-prompt { font-size: 17px; } }
</style>`,

  clean: `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font: 15px/1.6 system-ui, sans-serif; background: #faf9f5; color: #29261b; padding: 32px 20px; }
h1 { font-family: 'Source Serif 4', Georgia, serif; font-size: 28px; font-weight: 500; margin-bottom: 4px; }
.meta { font-size: 13px; color: #7b7660; margin-bottom: 28px; }
.q-card { background: #fff; border: 1px solid #e5e2d6; border-radius: 14px; padding: 20px; margin-bottom: 14px; }
.q-prompt { font-family: 'Source Serif 4', Georgia, serif; font-size: 18px; font-weight: 500; line-height: 1.35; margin-bottom: 14px; }
.q-num { color: #9d9880; margin-right: 6px; font-family: system-ui; font-size: 14px; font-weight: 400; }
.choices { display: flex; flex-direction: column; gap: 8px; }
.choice { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border: 1px solid #e5e2d6; border-radius: 9px; cursor: pointer; transition: background 0.1s, border-color 0.1s; user-select: none; }
.choice:hover:not(.disabled) { background: #f5f1e8; border-color: #c4bfa8; }
.choice input { display: none; }
.letter { font-size: 13px; font-weight: 600; color: #9d9880; flex: 0 0 18px; margin-top: 2px; }
.choice.selected { background: #faeee6; border-color: #c96442; }
.choice.selected .letter { color: #c96442; }
.choice.correct { background: #e2ecd6; border-color: #4f7a3a; }
.choice.correct .letter { color: #4f7a3a; }
.choice.wrong { background: #f3dfd9; border-color: #9d3a2c; }
.choice.wrong .letter { color: #9d3a2c; }
.choice.disabled { cursor: default; }
.q-feedback { margin-top: 10px; font-size: 13px; font-weight: 500; padding: 4px 0; }
.q-feedback.ok { color: #4f7a3a; }
.q-feedback.bad { color: #9d3a2c; }
.q-explain { margin-top: 10px; font-size: 14px; color: #5c5648; padding: 10px 14px; border-left: 2px solid #c96442; background: #faeee6; border-radius: 0 6px 6px 0; }
.submit-bar { text-align: center; padding: 24px 0 40px; }
#submit-btn { background: #c96442; color: #fff; border: none; border-radius: 10px; padding: 12px 32px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: inherit; }
#submit-btn:hover:not(:disabled) { background: #b85636; }
#submit-btn:disabled { background: #d4cfbc; cursor: not-allowed; }
#score-banner { background: #fff; border: 1px solid #e5e2d6; border-radius: 14px; padding: 28px 20px; text-align: center; margin-bottom: 24px; }
.score-big { font-family: 'Source Serif 4', Georgia, serif; font-size: 44px; font-weight: 600; color: #c96442; line-height: 1; margin-bottom: 6px; }
.score-sub { font-size: 15px; color: #7b7660; }
.tally-pill { position: fixed; top: 16px; right: 16px; background: #c96442; color: #fff; font-size: 14px; font-weight: 600; padding: 4px 14px; border-radius: 20px; display: none; z-index: 100; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 0 20px; gap: 12px; }
.nav-btn { background: #fff; border: 1px solid #e5e2d6; border-radius: 8px; padding: 8px 20px; font-size: 14px; cursor: pointer; color: #29261b; transition: background 0.1s; font-family: inherit; }
.nav-btn:hover:not(:disabled) { background: #f5f1e8; }
.nav-btn:disabled { opacity: 0.4; cursor: default; }
.nav-indicator { font-size: 13px; color: #7b7660; }
#reset-btn { background: #fff; color: #29261b; border: 1px solid #c4bfa8; border-radius: 8px; padding: 8px 20px; font-size: 14px; cursor: pointer; margin-bottom: 16px; font-family: inherit; transition: background 0.1s; }
#reset-btn:hover { background: #f5f1e8; }
@media (max-width: 600px) { body { padding: 20px 14px; } h1 { font-size: 22px; } .q-prompt { font-size: 16px; } }
</style>`,

  dark: `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Patrick Hand', cursive; font-size: 19px; line-height: 1.5; background: #1a1814; color: #f1eee4; padding: 32px 20px; }
h1 { font-family: 'Caveat', cursive; font-size: 44px; line-height: 1.1; margin-bottom: 4px; }
.meta { font-size: 14px; color: #8a8270; margin-bottom: 28px; }
.q-card { background: #211e18; border: 2px solid #f1eee4; border-radius: 14px; box-shadow: 3px 3px 0 0 #f1eee4; padding: 20px; margin-bottom: 16px; }
.q-prompt { font-size: 19px; font-weight: 600; line-height: 1.35; margin-bottom: 14px; }
.q-num { color: #5a5448; margin-right: 6px; font-size: 14px; font-weight: 400; }
.choices { display: flex; flex-direction: column; gap: 8px; }
.choice { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border: 1.5px solid #f1eee4; border-radius: 10px; cursor: pointer; user-select: none; }
.choice:hover:not(.disabled) { background: #2a2620; }
.choice input { display: none; }
.letter { font-size: 13px; font-weight: 700; color: #5a5448; flex: 0 0 18px; margin-top: 2px; }
.choice.selected { background: #2d2017; box-shadow: 3px 3px 0 0 #e08363; border-color: #e08363; }
.choice.selected .letter { color: #e08363; }
.choice.correct { background: #1a2b14; border-color: #4f7a3a; box-shadow: 3px 3px 0 0 #4f7a3a; }
.choice.correct .letter { color: #6fa853; }
.choice.wrong { background: #2d1510; border-color: #9d3a2c; }
.choice.wrong .letter { color: #c95a48; }
.choice.disabled { cursor: default; }
.q-feedback { margin-top: 10px; font-size: 14px; font-weight: 600; padding: 4px 0; }
.q-feedback.ok { color: #6fa853; }
.q-feedback.bad { color: #c95a48; }
.q-explain { margin-top: 10px; font-size: 15px; color: #cac4b2; padding: 10px 14px; border-left: 3px solid #e08363; background: #2d2017; border-radius: 0 8px 8px 0; }
.submit-bar { text-align: center; padding: 24px 0 40px; }
#submit-btn { font-family: 'Patrick Hand', cursive; background: #e08363; color: #1a1814; border: 2px solid #f1eee4; border-radius: 10px; box-shadow: 3px 3px 0 0 #f1eee4; padding: 12px 32px; font-size: 17px; font-weight: 600; cursor: pointer; }
#submit-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 0 #f1eee4; }
#submit-btn:disabled { background: #3a3528; color: #5a5448; box-shadow: 3px 3px 0 0 #3a3528; border-color: #3a3528; cursor: not-allowed; }
#score-banner { background: #211e18; border: 2px solid #f1eee4; border-radius: 14px; box-shadow: 3px 3px 0 0 #f1eee4; padding: 28px 20px; text-align: center; margin-bottom: 24px; }
.score-big { font-family: 'Caveat', cursive; font-size: 56px; font-weight: 700; color: #e08363; line-height: 1; margin-bottom: 6px; }
.score-sub { font-size: 16px; color: #8a8270; }
.tally-pill { position: fixed; top: 16px; right: 16px; background: #f1eee4; color: #1a1814; font-family: 'Caveat', cursive; font-size: 20px; padding: 4px 14px; border-radius: 20px; box-shadow: 2px 2px 0 0 #e08363; display: none; z-index: 100; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 0 20px; gap: 12px; }
.nav-btn { font-family: 'Patrick Hand', cursive; background: #211e18; border: 2px solid #f1eee4; border-radius: 10px; box-shadow: 2px 2px 0 0 #f1eee4; padding: 8px 20px; font-size: 16px; cursor: pointer; color: #f1eee4; }
.nav-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 0 #f1eee4; }
.nav-btn:disabled { opacity: 0.4; cursor: default; transform: none; box-shadow: 2px 2px 0 0 #f1eee4; }
.nav-indicator { font-size: 15px; color: #8a8270; }
#reset-btn { font-family: 'Patrick Hand', cursive; background: #1a1814; color: #f1eee4; border: 2px solid #f1eee4; border-radius: 10px; box-shadow: 2px 2px 0 0 #f1eee4; padding: 8px 20px; font-size: 15px; cursor: pointer; margin-bottom: 18px; }
#reset-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 0 #f1eee4; }
@media (max-width: 600px) { body { padding: 20px 14px; } h1 { font-size: 34px; } .q-prompt { font-size: 17px; } }
</style>`,

  print: `
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font: 14px/1.6 Georgia, 'Times New Roman', serif; background: #fff; color: #000; padding: 24px 32px; max-width: none; }
h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
.meta { font-size: 12px; color: #444; margin-bottom: 24px; }
.q-card { background: #fff; border: 1px solid #000; border-radius: 4px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
.q-prompt { font-size: 15px; font-weight: 700; line-height: 1.4; margin-bottom: 12px; }
.q-num { color: #555; margin-right: 6px; font-size: 13px; font-weight: 400; }
.choices { display: flex; flex-direction: column; gap: 6px; }
.choice { display: flex; align-items: flex-start; gap: 8px; padding: 7px 12px; border: 1px solid #000; border-radius: 2px; cursor: pointer; user-select: none; }
.choice:hover:not(.disabled) { background: #f5f5f5; }
.choice input { display: none; }
.letter { font-size: 12px; font-weight: 700; color: #555; flex: 0 0 16px; margin-top: 2px; }
.choice.selected { background: #f0f0f0; }
.choice.correct { background: #e8f5e9; }
.choice.correct .letter { color: #1b5e20; }
.choice.wrong { background: #fce4ec; }
.choice.wrong .letter { color: #b71c1c; }
.choice.disabled { cursor: default; }
.q-feedback { margin-top: 8px; font-size: 13px; font-weight: 700; }
.q-feedback.ok { color: #1b5e20; }
.q-feedback.bad { color: #b71c1c; }
.q-explain { margin-top: 8px; font-size: 13px; color: #333; padding: 8px 12px; border-left: 3px solid #555; background: #f9f9f9; }
.submit-bar { text-align: center; padding: 20px 0; }
#submit-btn { background: #000; color: #fff; border: none; border-radius: 4px; padding: 10px 28px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
#submit-btn:disabled { background: #aaa; cursor: not-allowed; }
#score-banner { background: #fff; border: 1px solid #000; border-radius: 4px; padding: 24px; text-align: center; margin-bottom: 20px; }
.score-big { font-size: 42px; font-weight: 700; color: #000; line-height: 1; margin-bottom: 4px; }
.score-sub { font-size: 14px; color: #555; }
.tally-pill { position: fixed; top: 12px; right: 12px; background: #000; color: #fff; font-size: 13px; font-weight: 700; padding: 3px 12px; border-radius: 12px; display: none; z-index: 100; }
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 0 18px; gap: 12px; }
.nav-btn { background: #fff; border: 1px solid #000; border-radius: 2px; padding: 7px 18px; font-size: 13px; cursor: pointer; color: #000; font-family: inherit; }
.nav-btn:hover:not(:disabled) { background: #f0f0f0; }
.nav-btn:disabled { opacity: 0.35; cursor: default; }
.nav-indicator { font-size: 13px; color: #555; }
#reset-btn { background: #fff; color: #000; border: 1px solid #000; border-radius: 2px; padding: 6px 16px; font-size: 13px; cursor: pointer; margin-bottom: 14px; font-family: inherit; }
@media print { .submit-bar, #submit-btn, .nav-bar, .tally-pill, #reset-btn { display: none !important; } body { padding: 0; } }
</style>`,
};

export const QGExport = {
  downloadJSON(quiz) {
    triggerDownload(`${safeName(quiz.title)}.json`, JSON.stringify(quiz, null, 2), 'application/json');
  },

  downloadHTML(quiz) {
    const body = quiz.questions.map((q, i) => `
      <article class="q">
        <h3>${i + 1}. ${nodesToHtml(q.prompt)}</h3>
        <ol type="A">
          ${q.choices.map((c, j) => `<li${j === q.correctIdx ? ' class="ok"' : ''}>${nodesToHtml(c)}${j === q.correctIdx ? ' <em>(correct)</em>' : ''}</li>`).join('\n')}
        </ol>
      </article>
    `).join('\n');

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(quiz.title)}</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; max-width: 720px; margin: 32px auto; padding: 0 20px; color: #29261b; background: #faf9f5; }
  h1 { font-family: 'Source Serif 4', Georgia, serif; }
  .q { background: #fff; border: 1px solid #e5e2d6; border-radius: 12px; padding: 16px 20px; margin-bottom: 14px; }
  .q h3 { font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; margin: 0 0 10px; }
  ol { margin: 0; padding-left: 20px; }
  li { margin: 4px 0; }
  li.ok { color: #166534; font-weight: 500; }
  .meta { color: #6b6553; font-size: 13px; }
</style>
</head><body>
  <h1>${escapeHtml(quiz.title)}</h1>
  <div class="meta">${escapeHtml(quiz.course || '')} · ${quiz.questions.length} questions · exported from QuizGive</div>
  ${body}
</body></html>`;
    triggerDownload(`${safeName(quiz.title)}.html`, html, 'text/html');
  },

  downloadInteractiveQuiz(quiz, prefs = {}) {
    const p = {
      style: 'sketch',
      feedback: 'submit',
      showExplanations: false,
      layout: 'all',
      randomizeQuestions: false,
      randomizeChoices: false,
      title: quiz.title,
      subtitle: quiz.course || '',
      author: '',
      ...prefs,
    };

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    // Randomize at generation time so the emitted HTML is deterministic
    let questions = quiz.questions.map((q, origIdx) => ({ ...q, _origIdx: origIdx }));
    if (p.randomizeQuestions) shuffle(questions);
    if (p.randomizeChoices) {
      questions = questions.map(q => {
        const indices = q.choices.map((_, i) => i);
        shuffle(indices);
        const newChoices = indices.map(i => q.choices[i]);
        const newCorrectIdx = indices.indexOf(q.correctIdx);
        return { ...q, choices: newChoices, correctIdx: newCorrectIdx };
      });
    }

    const n = questions.length;
    const hasInstant = p.feedback === 'instant';
    const hasOneLayout = p.layout === 'one';

    // Build question cards HTML
    const buildCard = (q, i) => {
      const explanationHtml = (p.showExplanations && q.explanation)
        ? `\n      <div class="q-explain" hidden>${nodesToHtml(q.explanation)}</div>`
        : '';
      return `    <article class="q-card" data-q="${i}" data-correct="${q.correctIdx}">
      <div class="q-prompt"><span class="q-num">${i + 1}.</span> ${nodesToHtml(q.prompt)}</div>
      <div class="choices">
        ${q.choices.map((c, j) => `<label class="choice" data-val="${j}">
          <input type="radio" name="q${i}" value="${j}" data-q="${i}">
          <span class="letter">${letters[j] !== undefined ? letters[j] : j + 1}</span>
          <span>${nodesToHtml(c)}</span>
        </label>`).join('\n        ')}
      </div>
      <div class="q-feedback" hidden></div>${explanationHtml}
    </article>`;
    };

    const questionsHtml = hasOneLayout
      ? questions.map((q, i) =>
          `  <section class="page" data-idx="${i}" style="display:${i === 0 ? 'block' : 'none'}">\n${buildCard(q, i)}\n  </section>`
        ).join('\n')
      : questions.map((q, i) => buildCard(q, i)).join('\n');

    // Meta line
    const metaParts = [p.subtitle, p.author ? `by ${escapeHtml(p.author)}` : ''].filter(Boolean);
    const metaLine = [metaParts.join(' · '), `${n} question${n !== 1 ? 's' : ''}`].filter(Boolean).join(' · ');

    // Navigation bar (one-per-page layout only)
    const navBar = hasOneLayout ? `
  <div class="nav-bar">
    <button id="prev-btn" class="nav-btn" disabled>← Prev</button>
    <span id="page-indicator" class="nav-indicator">Question 1 of ${n}</span>
    <button id="next-btn" class="nav-btn">Next →</button>
  </div>` : '';

    // Submit bar (only for submit mode)
    const submitBarStyle = hasOneLayout ? ' style="display:none"' : '';
    const submitBar = !hasInstant ? `
  <div class="submit-bar"${submitBarStyle}><button id="submit-btn" disabled>Submit quiz</button></div>` : '';

    // Tally pill (instant mode only)
    const tallyPill = hasInstant ? `\n  <div id="tally-pill" class="tally-pill"></div>` : '';

    // Inline script
    const script = `
  var MODE = ${JSON.stringify(p.feedback)};
  var LAYOUT = ${JSON.stringify(p.layout)};
  var total = ${n};
  var answered = {};
  var right = 0;
  var showPage = null;

  function gradeQuestion(card) {
    var q = parseInt(card.dataset.q);
    var correct = parseInt(card.dataset.correct);
    var picked = answered[q];
    card.querySelectorAll('.choice').forEach(function(choice) {
      var val = parseInt(choice.dataset.val);
      choice.classList.add('disabled');
      choice.classList.remove('selected');
      if (val === correct) choice.classList.add('correct');
      else if (val === picked) choice.classList.add('wrong');
    });
    var fb = card.querySelector('.q-feedback');
    fb.hidden = false;
    var isRight = (picked === correct);
    if (isRight) {
      fb.className = 'q-feedback ok';
      fb.textContent = '\\u2713 Correct';
    } else {
      fb.className = 'q-feedback bad';
      fb.textContent = '\\u2717 Wrong \\u00b7 correct: ' + ['A','B','C','D','E','F'][correct];
    }
    var explain = card.querySelector('.q-explain');
    if (explain) explain.hidden = false;
    return isRight;
  }

  function showScore() {
    document.querySelector('.score-num').textContent = right + ' / ' + total;
    document.querySelector('.score-pct').textContent = Math.round(right / total * 100) + '%';
    document.getElementById('score-banner').hidden = false;
    document.getElementById('score-banner').scrollIntoView({ behavior: 'smooth' });
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.hidden = true;
    var pill = document.getElementById('tally-pill');
    if (pill) pill.style.display = 'none';
  }

  document.querySelectorAll('.choice').forEach(function(label) {
    label.addEventListener('click', function() {
      if (label.classList.contains('disabled')) return;
      var card = label.closest('.q-card');
      var q = parseInt(card.dataset.q);
      card.querySelectorAll('.choice').forEach(function(l) { l.classList.remove('selected'); });
      label.classList.add('selected');
      answered[q] = parseInt(label.dataset.val);

      if (MODE === 'instant') {
        var wasRight = gradeQuestion(card);
        if (wasRight) right++;
        var count = Object.keys(answered).length;
        var pill = document.getElementById('tally-pill');
        if (pill) { pill.style.display = 'block'; pill.textContent = count + ' / ' + total; }
        if (count === total) showScore();
      } else {
        if (Object.keys(answered).length === total) {
          document.getElementById('submit-btn').disabled = false;
        }
      }
    });
  });

  var submitBtn = document.getElementById('submit-btn');
  if (submitBtn && MODE === 'submit') {
    submitBtn.addEventListener('click', function() {
      document.querySelectorAll('.q-card').forEach(function(card) {
        var wasRight = gradeQuestion(card);
        if (wasRight) right++;
      });
      showScore();
    });
  }

  document.getElementById('reset-btn').addEventListener('click', function() {
    answered = {};
    right = 0;
    document.querySelectorAll('.choice').forEach(function(c) {
      c.classList.remove('disabled', 'selected', 'correct', 'wrong');
    });
    document.querySelectorAll('.q-feedback').forEach(function(fb) { fb.hidden = true; });
    document.querySelectorAll('.q-explain').forEach(function(ex) { ex.hidden = true; });
    document.getElementById('score-banner').hidden = true;
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) { submitBtn.hidden = false; submitBtn.disabled = true; }
    var pill = document.getElementById('tally-pill');
    if (pill) pill.style.display = 'none';
    if (showPage) showPage(0);
  });

  if (LAYOUT === 'one') {
    var pages = document.querySelectorAll('.page');
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var indicator = document.getElementById('page-indicator');
    var submitBar = document.querySelector('.submit-bar');
    var cur = 0;

    showPage = function(idx) {
      pages.forEach(function(pg, i) { pg.style.display = i === idx ? 'block' : 'none'; });
      prevBtn.disabled = idx === 0;
      nextBtn.style.display = idx < pages.length - 1 ? 'inline-block' : 'none';
      if (submitBar) submitBar.style.display = idx === pages.length - 1 ? 'block' : 'none';
      indicator.textContent = 'Question ' + (idx + 1) + ' of ' + total;
      cur = idx;
    }

    prevBtn.addEventListener('click', function() { if (cur > 0) showPage(cur - 1); });
    nextBtn.addEventListener('click', function() { if (cur < pages.length - 1) showPage(cur + 1); });
    showPage(0);
  }`;

    const themeHead = STYLE_THEMES[p.style] || STYLE_THEMES.sketch;

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(p.title || quiz.title)}</title>
${themeHead}
</head>
<body>${tallyPill}
<div style="max-width:720px;margin:0 auto">
  <h1>${escapeHtml(p.title || quiz.title)}</h1>
  <div class="meta">${escapeHtml(metaLine)}</div>
  <div id="score-banner" hidden>
    <button id="reset-btn">Reset quiz</button>
    <div class="score-big"><span class="score-num"></span></div>
    <div class="score-sub"><span class="score-pct"></span> correct</div>
  </div>${navBar}
  <form id="quiz-form" onsubmit="return false;">
${questionsHtml}
  </form>${submitBar}
</div>
<script>${script}
</script>
</body>
</html>`;

    triggerDownload(`${safeName(p.title || quiz.title)}-quiz.html`, html, 'text/html');
  },

  downloadResults(quiz, session, result) {
    const rows = quiz.questions.map((q, i) => {
      const ans = session.answers[i];
      const right = ans === q.correctIdx;
      return `
        <article class="q ${ans == null ? 'skipped' : right ? 'right' : 'wrong'}">
          <h3>${i + 1}. ${nodesToHtml(q.prompt)}</h3>
          <ol type="A">
            ${q.choices.map((c, j) => {
              let cls = '';
              if (j === q.correctIdx) cls = 'correct';
              if (j === ans && j !== q.correctIdx) cls = 'picked';
              return `<li class="${cls}">${nodesToHtml(c)}${j === q.correctIdx ? ' <em>(correct)</em>' : ''}${j === ans && j !== q.correctIdx ? ' <em>(your answer)</em>' : ''}</li>`;
            }).join('\n')}
          </ol>
          <div class="qmeta">${ans == null ? 'Skipped' : right ? '✓ Correct' : '✗ Wrong'}</div>
        </article>`;
    }).join('\n');

    const pct = Math.round(result.pct * 100);
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(quiz.title)} — results</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; max-width: 720px; margin: 32px auto; padding: 0 20px; color: #29261b; background: #faf9f5; }
  h1, h3 { font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; }
  .score { background: #fff; border: 1px solid #e5e2d6; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 20px; }
  .score .pct { font-size: 36px; color: #c96442; font-weight: 600; }
  .q { background: #fff; border: 1px solid #e5e2d6; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
  .q.wrong { border-color: #f3dfd9; }
  .q.right { border-color: #e2ecd6; }
  ol { margin: 0; padding-left: 20px; }
  li { margin: 4px 0; }
  li.correct { color: #166534; font-weight: 500; }
  li.picked { color: #9d3a2c; }
  .qmeta { color: #6b6553; font-size: 13px; margin-top: 6px; }
  .meta { color: #6b6553; font-size: 13px; }
</style>
</head><body>
  <h1>${escapeHtml(quiz.title)} — results</h1>
  <div class="meta">${escapeHtml(quiz.course || '')} · ${new Date(result.finishedAt).toLocaleString()}</div>
  <div class="score">
    <div class="pct">${result.right}/${result.total}</div>
    <div>${pct}% correct · ${result.wrong} wrong · ${result.skipped} skipped</div>
  </div>
  ${rows}
</body></html>`;
    triggerDownload(`${safeName(quiz.title)}-results.html`, html, 'text/html');
  },
};
