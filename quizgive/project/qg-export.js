/* global */
// Lightweight download helpers — produce plain JSON / HTML for results & quizzes.

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

window.QGExport = {
  downloadJSON(quiz) {
    triggerDownload(`${safeName(quiz.title)}.json`, JSON.stringify(quiz, null, 2), 'application/json');
  },

  downloadHTML(quiz) {
    const body = quiz.questions.map((q, i) => `
      <article class="q">
        <h3>${i + 1}. ${escapeHtml(q.prompt)}</h3>
        <ol type="A">
          ${q.choices.map((c, j) => `<li${j === q.correctIdx ? ' class="ok"' : ''}>${escapeHtml(c)}${j === q.correctIdx ? ' <em>(correct)</em>' : ''}</li>`).join('\n')}
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

  downloadResults(quiz, session, result) {
    const rows = quiz.questions.map((q, i) => {
      const ans = session.answers[i];
      const right = ans === q.correctIdx;
      return `
        <article class="q ${ans == null ? 'skipped' : right ? 'right' : 'wrong'}">
          <h3>${i + 1}. ${escapeHtml(q.prompt)}</h3>
          <ol type="A">
            ${q.choices.map((c, j) => {
              let cls = '';
              if (j === q.correctIdx) cls = 'correct';
              if (j === ans && j !== q.correctIdx) cls = 'picked';
              return `<li class="${cls}">${escapeHtml(c)}${j === q.correctIdx ? ' <em>(correct)</em>' : ''}${j === ans && j !== q.correctIdx ? ' <em>(your answer)</em>' : ''}</li>`;
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
