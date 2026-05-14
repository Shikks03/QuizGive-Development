import { useState, useRef } from 'react';
import { QGIcon } from '../icons.jsx';
import { QGHelpers } from '../store.js';
import { QGExport } from '../lib/export.js';
import { parseQuizfetch } from '../lib/parser.js';

const { Plus, Upload, Star, StarFill, Search, Sparkles, FileText, Award, Refresh, Trash, Shuffle, Eye, Play, ChevRight, ArrowRight, Clock, MoreH, Download } = QGIcon;

// ── Library (welcome) ────────────────────────────────────────────
export function QGLibraryScreen({ state, actions, navigate }) {
  const [query, setQuery] = useState('');

  const quizzes = Object.values(state.quizzes);
  const filtered = query
    ? quizzes.filter((q) => (q.title + ' ' + q.course).toLowerCase().includes(query.toLowerCase()))
    : quizzes;

  const sorted = filtered.sort((a, b) => {
    const aBm = state.bookmarks.includes(a.id) ? 1 : 0;
    const bBm = state.bookmarks.includes(b.id) ? 1 : 0;
    if (aBm !== bBm) return bBm - aBm;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  if (quizzes.length === 0) {
    return (
      <div className="qg-scroll center">
        <div className="qg-content" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div className="qg-empty">
            <div className="icon-wrap"><Sparkles size={28} /></div>
            <h1 className="qg-h2">Welcome to QuizGive</h1>
            <p className="qg-muted-2" style={{ maxWidth: 440, margin: '8px auto 24px' }}>
              Drop a <b>quizfetch</b> HTML file and we'll turn its answer key into a fresh quiz you can take.
              Everything stays in your browser.
            </p>
            <button className="qg-btn primary lg" onClick={() => navigate({ name: 'upload' })}>
              <Upload size={16} /> Upload a quizfetch file
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qg-scroll">
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
            <LibraryCard key={q.id} quiz={q} state={state} actions={actions} navigate={navigate} />
          ))}
          <div className="qg-lib-card empty" onClick={() => navigate({ name: 'upload' })}>
            <div style={{ fontSize: 22, marginBottom: 4 }}><Plus size={22} /></div>
            <div className="qg-muted">Drop another quizfetch</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryCard({ quiz, state, actions, navigate }) {
  const isFav = state.bookmarks.includes(quiz.id);
  const session = state.sessions[quiz.id];
  const result = state.results[quiz.id];
  const [menuOpen, setMenuOpen] = useState(false);

  let status = 'not started';
  let pct = 0;
  if (result) { status = `${Math.round(result.pct * 100)}% · ${QGHelpers.formatRelative(result.finishedAt)}`; pct = result.pct; }
  else if (session && !session.submitted) {
    const answered = session.answers.filter(a => a != null).length;
    pct = answered / session.answers.length;
    status = `${Math.round(pct * 100)}% answered · in progress`;
  }

  return (
    <div className="qg-lib-card" onClick={() => navigate({ name: 'quiz', quizId: quiz.id })}>
      <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
        <div className="title" style={{ flex: 1 }}>{quiz.title.replace(/^\[.+?\]\s*/, '')}</div>
        <div style={{ position: 'relative' }}>
          <button className="qg-iconbtn" onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}>
            <MoreH size={16} />
          </button>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="qg-card" style={{ position: 'absolute', right: 0, top: 28, minWidth: 180, padding: 4, zIndex: 31, boxShadow: 'var(--shadow-lg)' }}
                onClick={(e) => e.stopPropagation()}>
                <button className="qg-btn ghost" style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => { actions.toggleBookmark(quiz.id); setMenuOpen(false); }}>
                  {isFav ? <StarFill size={14} /> : <Star size={14} />}
                  {isFav ? 'Remove bookmark' : 'Bookmark'}
                </button>
                <button className="qg-btn ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--bad)' }}
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm(`Delete "${quiz.title}"? This cannot be undone.`)) actions.deleteQuiz(quiz.id);
                  }}>
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
  );
}

// ── Upload ───────────────────────────────────────────────────────
export function QGUploadScreen({ state, actions, navigate, sample }) {
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!/\.html?$/i.test(file.name) && file.type !== 'text/html') {
      setError("That doesn't look like an HTML file. Please upload your quizfetch .html.");
      return;
    }
    setParsing(true);
    setError('');
    try {
      const text = await file.text();
      const quiz = parseQuizfetch(text);
      if (!quiz.questions.length) {
        setError("Couldn't find any questions in that file. Is it really a quizfetch export?");
        setParsing(false);
        return;
      }
      quiz.sourceFilename = file.name;
      actions.saveQuiz(quiz);
      navigate({ name: 'preview', quizId: quiz.id });
    } catch (err) {
      setError('Sorry, I could not read that file. ' + (err.message || ''));
      setParsing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const trySample = async () => {
    if (!sample) return;
    setParsing(true);
    try {
      const quiz = parseQuizfetch(sample.html);
      quiz.sourceFilename = sample.name;
      actions.saveQuiz(quiz);
      navigate({ name: 'preview', quizId: quiz.id });
    } catch (err) {
      setError('Could not load sample.');
      setParsing(false);
    }
  };

  return (
    <div className="qg-scroll center">
      <div className="qg-content" style={{ maxWidth: 600, textAlign: 'center' }}>
        <h1 className="qg-h1" style={{ marginBottom: 8 }}>Upload your quizfetch</h1>
        <p className="qg-muted-2" style={{ marginBottom: 24 }}>
          Drop the answer-key HTML and we'll wipe the answers so you can take it fresh.
        </p>

        <div
          className={`qg-drop ${over ? 'over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="icon"><Upload size={20} /></div>
          <div className="qg-h2" style={{ fontSize: 19 }}>
            {parsing ? 'Parsing…' : 'Drop your quizfetch.html here'}
          </div>
          <div className="qg-muted" style={{ marginTop: 4, fontSize: 13 }}>
            or <u>click to browse</u> · .html only · nothing leaves your device
          </div>
          <input ref={inputRef} type="file" accept=".html,text/html" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>

        {error && (
          <div className="qg-pill bad" style={{ marginTop: 14 }}>{error}</div>
        )}

        {sample && (
          <div style={{ marginTop: 18, fontSize: 13 }}>
            <button className="qg-btn" onClick={trySample}>
              <Sparkles size={14} /> Try the sample quiz
            </button>
          </div>
        )}

        <div className="qg-tiny" style={{ marginTop: 32 }}>
          <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'library' })}>
            ← Back to library
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview & configure ──────────────────────────────────────────
export function QGPreviewScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const [cfg, setCfg] = useState({
    randomizeQuestions: true,
    randomizeChoices: true,
    layout: 'one',
    feedback: 'instant',
  });

  if (!quiz) {
    return <div className="qg-scroll"><div className="qg-content">Quiz not found.</div></div>;
  }

  const generate = () => {
    const session = QGHelpers.makeSession(quiz, cfg);
    actions.saveSession(quiz.id, session);
    navigate({ name: 'ready', quizId: quiz.id });
  };

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="qg-h1">{quiz.title.replace(/^\[.+?\]\s*/, '')}</h1>
            <div className="qg-muted" style={{ marginTop: 4 }}>
              {quiz.course && <>{quiz.course} · </>}
              <span className="qg-pill ok"><Sparkles size={11} /> {quiz.questions.length} questions parsed</span>
            </div>
          </div>
          <div className="qg-row" style={{ gap: 8 }}>
            <button className="qg-btn" onClick={() => navigate({ name: 'upload' })}>
              <Refresh size={14} /> Re-upload
            </button>
          </div>
        </div>

        <div className="qg-grid-2">
          {/* Options panel */}
          <div className="qg-card qg-card-pad">
            <h3 className="qg-h3" style={{ marginBottom: 12 }}>Quiz options</h3>

            <CheckRow checked={cfg.randomizeQuestions} onToggle={() => setCfg({ ...cfg, randomizeQuestions: !cfg.randomizeQuestions })}
              icon={<Shuffle size={14} />} label="Randomize question order" />
            <CheckRow checked={cfg.randomizeChoices} onToggle={() => setCfg({ ...cfg, randomizeChoices: !cfg.randomizeChoices })}
              icon={<Shuffle size={14} />} label="Randomize choice order" />

            <hr className="qg-divider" />

            <h3 className="qg-h3" style={{ marginBottom: 6 }}>Layout</h3>
            <RadioRow checked={cfg.layout === 'one'} onPick={() => setCfg({ ...cfg, layout: 'one' })}
              label="One question at a time" sub="Focused mode — see one question per screen." />
            <RadioRow checked={cfg.layout === 'all'} onPick={() => setCfg({ ...cfg, layout: 'all' })}
              label="All questions on one page" sub="Scroll through everything. Submit at the end." />

            <hr className="qg-divider" />

            <h3 className="qg-h3" style={{ marginBottom: 6 }}>Feedback</h3>
            <RadioRow checked={cfg.feedback === 'instant'} onPick={() => setCfg({ ...cfg, feedback: 'instant' })}
              label="Instant" sub="Reveal the correct answer the moment you pick." />
            <RadioRow checked={cfg.feedback === 'submit'} onPick={() => setCfg({ ...cfg, feedback: 'submit' })}
              label="After submit" sub="See all results once at the end." />
          </div>

          {/* Preview panel */}
          <div className="qg-card qg-card-pad">
            <div className="qg-row between" style={{ marginBottom: 12 }}>
              <h3 className="qg-h3">Parsed preview</h3>
              <span className="qg-pill ok">✓ {quiz.questions.length}/{quiz.questions.length}</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto', margin: '0 -4px', padding: '0 4px' }}>
              {quiz.questions.slice(0, 8).map((q, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px dashed var(--rule-soft)' }}>
                  <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>
                    <span className="qg-muted">{i + 1}.</span> {q.prompt}
                  </div>
                  <div className="qg-tiny" style={{ marginTop: 2 }}>
                    {q.choices.length} choices · answer: <span style={{ color: 'var(--ok)' }}>{q.choices[q.correctIdx]}</span>
                  </div>
                </div>
              ))}
              {quiz.questions.length > 8 && (
                <div className="qg-tiny" style={{ paddingTop: 8 }}>… and {quiz.questions.length - 8} more</div>
              )}
            </div>
          </div>
        </div>

        <div className="qg-row between" style={{ marginTop: 22 }}>
          <button className="qg-btn ghost" onClick={() => navigate({ name: 'library' })}>← Cancel</button>
          <button className="qg-btn primary lg" onClick={generate}>
            <Sparkles size={15} /> Generate quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ checked, onToggle, icon, label }) {
  return (
    <div className={`qg-check-row ${checked ? 'on' : ''}`} onClick={onToggle}>
      <span className="box">{checked && <QGIcon.Check size={12} />}</span>
      <span className="label-main qg-row" style={{ gap: 6 }}>
        {icon && <span className="qg-muted">{icon}</span>} {label}
      </span>
    </div>
  );
}

function RadioRow({ checked, onPick, label, sub }) {
  return (
    <div className={`qg-check-row radio ${checked ? 'on' : ''}`} onClick={onPick}
      style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 0 }}>
      <div className="qg-row" style={{ gap: 10 }}>
        <span className="box" />
        <span className="label-main">{label}</span>
      </div>
      {sub && <div className="label-sub">{sub}</div>}
    </div>
  );
}

// ── Ready / decision ─────────────────────────────────────────────
export function QGReadyScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const session = state.sessions[quizId];
  const isFav = state.bookmarks.includes(quizId);
  if (!quiz) return null;

  const cfgLabel = session
    ? [
        session.layout === 'one' ? 'one-by-one' : 'all on one page',
        session.feedback === 'instant' ? 'instant feedback' : 'feedback at end',
        session.randomizeQuestions ? 'randomized' : 'in order',
      ].join(' · ')
    : '';

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 18, alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="qg-h1">Your quiz is ready</h1>
            <div className="qg-muted-2" style={{ marginTop: 6 }}>
              <b>{quiz.title.replace(/^\[.+?\]\s*/, '')}</b> · {quiz.questions.length} questions
            </div>
            <div className="qg-muted" style={{ fontSize: 13, marginTop: 2 }}>{cfgLabel}</div>
          </div>
          <span className="qg-pill ok"><Sparkles size={11} /> generated · saved to library</span>
        </div>

        <div className="qg-h3" style={{ color: 'var(--ink-3)', fontWeight: 500, fontSize: 13, marginBottom: 10 }}>
          What would you like to do?
        </div>

        <div className="qg-decision-grid">
          <button className="qg-decision primary" onClick={() => navigate({ name: 'quiz', quizId })}>
            <div className="ico"><Play size={18} /></div>
            <h4>Take the quiz now</h4>
            <p>Jump in — your progress autosaves to this device.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn primary sm">Start <ArrowRight size={13} /></span>
            </div>
          </button>

          <button className="qg-decision" onClick={() => {
            actions.toggleBookmark(quizId);
          }}>
            <div className="ico" style={{ background: 'var(--warn-tint)', color: 'var(--warn)' }}>
              {isFav ? <StarFill size={18} /> : <Star size={18} />}
            </div>
            <h4>{isFav ? 'Bookmarked ✓' : 'Bookmark for later'}</h4>
            <p>Save to your library — pin to top for quick access.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn sm">{isFav ? 'Unbookmark' : 'Bookmark'}</span>
            </div>
          </button>

          <button className="qg-decision" onClick={() => navigate({ name: 'upload' })}>
            <div className="ico" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}><Refresh size={18} /></div>
            <h4>Re-upload</h4>
            <p>Replace this quiz with a different quizfetch file.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn sm">Re-upload</span>
            </div>
          </button>
        </div>

        <div className="qg-card flat" style={{ marginTop: 16, padding: '10px 14px', background: 'var(--surface-2)', borderStyle: 'dashed' }}>
          <div className="qg-row between" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div className="qg-row qg-muted-2" style={{ fontSize: 13 }}>
              <Download size={14} />
              Also: <a onClick={(e) => { e.preventDefault(); QGExport.downloadJSON(quiz); }} href="#">download JSON</a>
              · <a onClick={(e) => { e.preventDefault(); QGExport.downloadHTML(quiz); }} href="#">download HTML</a>
            </div>
            <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'preview', quizId })}>
              ← Back to configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
