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

  downloadInteractiveQuiz(quiz) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    const questionsHtml = quiz.questions.map((q, i) => `
    <article class="q-card" data-q="${i}" data-correct="${q.correctIdx}">
      <div class="q-prompt"><span class="q-num">${i + 1}.</span> ${nodesToHtml(q.prompt)}</div>
      <div class="choices">
        ${q.choices.map((c, j) => `
        <label class="choice" data-val="${j}">
          <input type="radio" name="q${i}" value="${j}" data-q="${i}">
          <span class="letter">${letters[j] !== undefined ? letters[j] : j + 1}</span>
          <span>${nodesToHtml(c)}</span>
        </label>`).join('\n')}
      </div>
      <div class="q-feedback" hidden></div>
    </article>`).join('\n');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(quiz.title)}</title>
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
  .submit-bar { text-align: center; padding: 24px 0 40px; }
  #submit-btn { background: #c96442; color: #fff; border: none; border-radius: 10px; padding: 12px 32px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: inherit; }
  #submit-btn:hover:not(:disabled) { background: #b85636; }
  #submit-btn:disabled { background: #d4cfbc; cursor: not-allowed; }
  #score-banner { background: #fff; border: 1px solid #e5e2d6; border-radius: 14px; padding: 28px 20px; text-align: center; margin-bottom: 24px; }
  .score-big { font-family: 'Source Serif 4', Georgia, serif; font-size: 44px; font-weight: 600; color: #c96442; line-height: 1; margin-bottom: 6px; }
  .score-sub { font-size: 15px; color: #7b7660; }
  @media (max-width: 600px) { body { padding: 20px 14px; } h1 { font-size: 22px; } .q-prompt { font-size: 16px; } }
</style>
</head>
<body>
<div style="max-width:720px;margin:0 auto">
  <h1>${escapeHtml(quiz.title)}</h1>
  <div class="meta">${quiz.course ? escapeHtml(quiz.course) + ' · ' : ''}${quiz.questions.length} questions · from QuizGive</div>
  <div id="score-banner" hidden>
    <div class="score-big"><span class="score-num"></span></div>
    <div class="score-sub"><span class="score-pct"></span> correct</div>
  </div>
  <form id="quiz-form" onsubmit="return false;">
${questionsHtml}
  </form>
  <div class="submit-bar"><button id="submit-btn" disabled>Submit quiz</button></div>
</div>
<script>
  var total = ${quiz.questions.length};
  var answered = {};
  document.querySelectorAll('.choice').forEach(function(label) {
    label.addEventListener('click', function() {
      if (label.classList.contains('disabled')) return;
      var card = label.closest('.q-card');
      var q = card.dataset.q;
      card.querySelectorAll('.choice').forEach(function(l) { l.classList.remove('selected'); });
      label.classList.add('selected');
      answered[q] = parseInt(label.dataset.val);
      if (Object.keys(answered).length === total) {
        document.getElementById('submit-btn').disabled = false;
      }
    });
  });
  document.getElementById('submit-btn').addEventListener('click', function() {
    var right = 0;
    document.querySelectorAll('.q-card').forEach(function(card) {
      var q = card.dataset.q;
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
      if (picked === correct) {
        right++;
        fb.className = 'q-feedback ok';
        fb.textContent = '✓ Correct';
      } else {
        fb.className = 'q-feedback bad';
        fb.textContent = '✗ Wrong · correct: ' + ['A','B','C','D','E','F'][correct];
      }
    });
    var pct = Math.round(right / total * 100);
    document.querySelector('.score-num').textContent = right + ' / ' + total;
    document.querySelector('.score-pct').textContent = pct + '%';
    document.getElementById('score-banner').hidden = false;
    document.getElementById('submit-btn').hidden = true;
    document.getElementById('score-banner').scrollIntoView({ behavior: 'smooth' });
  });
</script>
</body>
</html>`;
    triggerDownload(`${safeName(quiz.title)}-quiz.html`, html, 'text/html');
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
