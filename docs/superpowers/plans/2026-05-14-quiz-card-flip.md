# Quiz Card Flip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user clicks a quiz card in the Library, the card flips in-place to reveal a back face with "Start quiz" and "Download" (interactive HTML) actions.

**Architecture:** `QGLibraryScreen` tracks a single `activeCardId` (string | null); clicking a card sets it as active and triggers a CSS 3D flip animation. The back face has two buttons: Start quiz (navigates to quiz screen) and Download (generates a self-contained interactive HTML quiz file). Clicking outside any card or the "← back" link clears the active card.

**Tech Stack:** React 18 (hooks), CSS custom properties, Vite, no external test framework (browser verification used throughout).

---

## File Map

| File | Change |
|------|--------|
| `src/qg.css` | Add `.qg-flip-card`, `.qg-flip-card-inner`, `.qg-flip-card-front`, `.qg-flip-card-back`, `.is-flipped` CSS classes |
| `src/lib/export.js` | Add `downloadInteractiveQuiz(quiz)` to the `QGExport` object |
| `src/screens/Screens.jsx` | Add `activeCardId` state + clear handler to `QGLibraryScreen`; restructure `LibraryCard` into a flip shell |

---

## Task 1: Add flip CSS classes to `src/qg.css`

**Files:**
- Modify: `src/qg.css` (append after the `/* ── library cards ── */` block, around line 492)

- [x] **Step 1: Append the flip card CSS block**

Open `src/qg.css`. Find the line `/* ── library cards ──` and locate the end of that block (after `.qg-lib-card.empty { ... }`). Append the following block immediately after it:

```css
/* ── flip card (library) ────────────────────────────────────────── */
.qg-flip-card {
  perspective: 900px;
  min-height: 170px;
}
.qg-flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: inherit;
  transform-style: preserve-3d;
  transition: transform 0.42s cubic-bezier(.4,0,.2,1);
}
.qg-flip-card.is-flipped .qg-flip-card-inner {
  transform: rotateY(180deg);
}
.qg-flip-card-front,
.qg-flip-card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--radius-lg);
}
.qg-flip-card-back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.qg-flip-back-title {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--ink);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

- [x] **Step 2: Verify CSS is picked up**

Run the dev server if it isn't running:
```
npm run dev
```
Open the browser. No visual change expected yet — just confirm there are no CSS parse errors in the browser console.

---

## Task 2: Add `downloadInteractiveQuiz` to `src/lib/export.js`

**Files:**
- Modify: `src/lib/export.js`

- [x] **Step 1: Add `downloadInteractiveQuiz` to the `QGExport` object**

Open `src/lib/export.js`. Find `export const QGExport = {` and add `downloadInteractiveQuiz` as the last method (before the closing `};`):

```js
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
```

- [x] **Step 2: Verify the export builds without errors**

Check the Vite dev server console for any import or syntax errors. No browser test yet.

---

## Task 3: Update `QGLibraryScreen` and `LibraryCard` in `src/screens/Screens.jsx`

**Files:**
- Modify: `src/screens/Screens.jsx`

### 3a — Add `activeCardId` state and clear handler to `QGLibraryScreen`

- [x] **Step 1: Import `Download` and `Play` icons (already imported — verify)**

At the top of `src/screens/Screens.jsx`, confirm `Download` and `Play` are already in the destructured import from `QGIcon`:
```js
const { Plus, Upload, Star, StarFill, Search, Sparkles, FileText, Award, Refresh, Trash, Shuffle, Eye, Play, ChevRight, ArrowRight, Clock, MoreH, Download } = QGIcon;
```
Both are already there — no change needed.

- [x] **Step 2: Add `activeCardId` state and grid click handler to `QGLibraryScreen`**

Two edits in `QGLibraryScreen`:

**Edit A** — add state declaration immediately after `const [query, setQuery] = useState('');`:
```jsx
const [activeCardId, setActiveCardId] = useState(null);
```

**Edit B** — replace the second `return (` block (the non-empty branch, after `if (quizzes.length === 0) { ... }`) with:

```jsx
  return (
    <div className="qg-scroll" onClick={() => setActiveCardId(null)}>
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="qg-h1">Library</h1>
            <div className="qg-muted" style={{ marginTop: 4 }}>{quizzes.length} quiz{quizzes.length === 1 ? '' : 'zes'} saved on this device</div>
          </div>
          <div className="qg-row" style={{ gap: 8 }}>
            <div className="qg-search" style={{ width: 220 }}>
              <Search size={15} />
              <input className="qg-input" placeholder="Search quizzes" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button className="qg-btn primary" onClick={() => navigate({ name: 'upload' })}>
              <Plus size={15} /> New quiz
            </button>
          </div>
        </div>

        <div className="qg-lib-grid">
          {sorted.map((q) => (
            <LibraryCard
              key={q.id}
              quiz={q}
              state={state}
              actions={actions}
              navigate={navigate}
              activeCardId={activeCardId}
              setActiveCardId={setActiveCardId}
            />
          ))}
          <div className="qg-lib-card empty" onClick={(e) => { e.stopPropagation(); navigate({ name: 'upload' }); }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}><Plus size={22} /></div>
            <div className="qg-muted">Upload or paste another</div>
          </div>
        </div>
      </div>
    </div>
  );
```


### 3b — Restructure `LibraryCard` into a flip shell

- [x] **Step 3: Replace the entire `LibraryCard` function**

Replace the full `function LibraryCard({ quiz, state, actions, navigate }) { ... }` definition with:

```jsx
function LibraryCard({ quiz, state, actions, navigate, activeCardId, setActiveCardId }) {
  const isFav = state.bookmarks.includes(quiz.id);
  const session = state.sessions[quiz.id];
  const result = state.results[quiz.id];
  const [menuOpen, setMenuOpen] = useState(false);
  const isFlipped = activeCardId === quiz.id;

  let status = 'not started';
  let pct = 0;
  if (result) {
    status = `${Math.round(result.pct * 100)}% · ${QGHelpers.formatRelative(result.finishedAt)}`;
    pct = result.pct;
  } else if (session && !session.submitted) {
    const answered = session.answers.filter(a => a != null).length;
    pct = answered / session.answers.length;
    status = `${Math.round(pct * 100)}% answered · in progress`;
  }

  return (
    <div
      className={`qg-flip-card${isFlipped ? ' is-flipped' : ''}`}
      onClick={(e) => { e.stopPropagation(); setActiveCardId(quiz.id); }}
    >
      <div className="qg-flip-card-inner">

        {/* ── Front face ── */}
        <div className="qg-lib-card qg-flip-card-front">
          <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
            <div className="title" style={{ flex: 1 }}>{quiz.title.replace(/^\[.+?\]\s*/, '')}</div>
            <div style={{ position: 'relative' }}>
              <button
                className="qg-iconbtn"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
              >
                <MoreH size={16} />
              </button>
              {menuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 30 }}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                  />
                  <div
                    className="qg-card"
                    style={{ position: 'absolute', right: 0, top: 28, minWidth: 180, padding: 4, zIndex: 31, boxShadow: 'var(--shadow-lg)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="qg-btn ghost"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => { actions.toggleBookmark(quiz.id); setMenuOpen(false); }}
                    >
                      {isFav ? <StarFill size={14} /> : <Star size={14} />}
                      {isFav ? 'Remove bookmark' : 'Bookmark'}
                    </button>
                    <button
                      className="qg-btn ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--bad)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        if (confirm(`Delete "${quiz.title}"? This cannot be undone.`)) actions.deleteQuiz(quiz.id);
                      }}
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="meta">
            {quiz.course && <span>{quiz.course} · </span>}
            {quiz.questions.length} questions
          </div>
          <div className="meta">{status}</div>
          {pct > 0 && (
            <div className="qg-progress" style={{ marginTop: 6 }}>
              <i style={{ width: `${Math.round(pct * 100)}%` }} />
            </div>
          )}
          <div className="qg-row" style={{ gap: 6, marginTop: 8 }}>
            {isFav && <span className="qg-pill accent"><StarFill size={11} /> bookmarked</span>}
            {result && <span className="qg-pill ok">finished</span>}
            {session && !session.submitted && <span className="qg-pill warn">in progress</span>}
            {!result && !session && <span className="qg-pill">new</span>}
          </div>
        </div>

        {/* ── Back face ── */}
        <div className="qg-flip-card-back" onClick={(e) => e.stopPropagation()}>
          <div className="qg-flip-back-title">
            {quiz.title.replace(/^\[.+?\]\s*/, '')}
            <span className="qg-muted" style={{ fontSize: 12, fontWeight: 400, fontFamily: 'var(--font-sans)' }}>
              {' '}· {quiz.questions.length} questions
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <button
              className="qg-btn primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={(e) => { e.stopPropagation(); navigate({ name: 'quiz', quizId: quiz.id }); }}
            >
              <Play size={14} /> Start quiz
            </button>
            <button
              className="qg-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={(e) => { e.stopPropagation(); QGExport.downloadInteractiveQuiz(quiz); }}
            >
              <Download size={14} /> Download
            </button>
          </div>
          <button
            className="qg-btn ghost sm"
            style={{ alignSelf: 'flex-end' }}
            onClick={(e) => { e.stopPropagation(); setActiveCardId(null); }}
          >
            ← back
          </button>
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser — flip animation**

With the dev server running, open the Library screen. Click a quiz card — it should flip to reveal "Start quiz" and "Download" buttons. Verify:
- Card flips smoothly with the 3D animation
- The "⋯" menu still opens without flipping the card
- Clicking "← back" flips the card back
- Clicking anywhere on the page background closes the flipped card
- Clicking a second card while one is open flips the first one back

- [ ] **Step 5: Verify in browser — Start quiz**

Click a card to flip it, then click "Start quiz". Confirm the quiz screen opens correctly using the quiz's previously configured layout (one-at-a-time or all-on-one-page).

- [ ] **Step 6: Verify in browser — Download**

Click a card to flip it, then click "Download". Confirm a `.html` file is downloaded. Open the downloaded file in a browser and verify:
- All questions appear with A/B/C/D choices
- Selecting an answer highlights the choice in orange
- Submit button is disabled until all questions are answered
- After submitting, correct answers go green, wrong answers go red, and a score banner appears

- [x] **Step 7: Commit**

```bash
git add src/qg.css src/lib/export.js src/screens/Screens.jsx
git commit -m "feat: flip library cards to reveal start/download actions"
```
