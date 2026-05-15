import { useState, useEffect } from 'react';
import { QGIcon } from '../icons.jsx';
import { QGHelpers } from '../store.js';
import { QGExport } from '../lib/export.js';
import { QGTopbar } from '../components/Shell.jsx';
import { RichText } from '../components/RichText.jsx';

const { Star, StarFill, Check, X, ArrowRight, ArrowLeft, ChevLeft, ChevRight, Refresh, Award, Download, Sparkles, Plus, Eye, EyeOff, Clock } = QGIcon;

// ── Quiz Screen ────────────────────────────────────────────────────
export function QGQuizScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const existingSession = state.sessions[quizId];

  const result = state.results[quizId];
  if (result && (!existingSession || existingSession.submitted)) {
    return <QGResultsScreen state={state} actions={actions} navigate={navigate} quizId={quizId} />;
  }

  useEffect(() => {
    if (!quiz) return;
    if (!existingSession) {
      const s = QGHelpers.makeSession(quiz, {
        randomizeQuestions: true,
        randomizeChoices: true,
        layout: 'one',
        feedback: 'instant',
      });
      actions.saveSession(quizId, s);
    }
  }, [quiz, existingSession, quizId]);

  if (!quiz) return <div className="qg-scroll"><div className="qg-content">Quiz not found.</div></div>;
  if (!existingSession) return null;

  return existingSession.layout === 'one'
    ? <OneAtATime state={state} actions={actions} navigate={navigate} quiz={quiz} session={existingSession} />
    : <AllOnOnePage state={state} actions={actions} navigate={navigate} quiz={quiz} session={existingSession} />;
}

// ── One question at a time (Approach B/D) ──────────────────────────
function OneAtATime({ state, actions, navigate, quiz, session }) {
  const total = quiz.questions.length;
  const idx = Math.min(session.currentIdx, total - 1);
  const qOrig = session.questionOrder[idx];
  const q = quiz.questions[qOrig];
  const order = session.choiceOrders[qOrig];
  const answered = session.answers[qOrig];
  const isInstant = session.feedback === 'instant';
  const locked = isInstant && answered != null;
  const correctOrig = q.correctIdx;

  const bookmarks = state.questionBookmarks[quiz.id] || [];
  const isBookmarked = bookmarks.includes(qOrig);

  const pick = (origChoiceIdx) => {
    if (locked) return;
    const next = { ...session, answers: session.answers.slice() };
    next.answers[qOrig] = origChoiceIdx;
    actions.saveSession(quiz.id, next);
  };

  const goto = (newIdx) => {
    const clamped = Math.max(0, Math.min(total - 1, newIdx));
    actions.saveSession(quiz.id, { ...session, currentIdx: clamped });
  };

  const submit = () => {
    const finished = { ...session, submitted: true, finishedAt: Date.now() };
    actions.saveSession(quiz.id, finished);
    const summary = { ...QGHelpers.scoreSession(quiz, finished), finishedAt: finished.finishedAt, durationMs: finished.finishedAt - finished.startedAt };
    actions.saveResult(quiz.id, summary);
    navigate({ name: 'results', quizId: quiz.id });
  };

  const isLast = idx === total - 1;
  const allAnswered = session.answers.every(a => a != null);

  return (
    <>
      <QGTopbar
        onMenu={navigate.onMenu}
        title={quiz.title.replace(/^\[.+?\]\s*/, '')}
        subtitle={`Question ${idx + 1} of ${total} · ${session.feedback === 'instant' ? 'instant feedback' : 'feedback at end'}`}
        right={<>
          <button className="qg-iconbtn" onClick={() => actions.toggleQuestionBookmark(quiz.id, qOrig)}
            title="Bookmark this question">
            {isBookmarked ? <StarFill size={18} style={{ color: 'var(--accent)' }} /> : <Star size={18} />}
          </button>
          <button className="qg-btn ghost sm" onClick={() => {
            if (confirm('Exit this quiz? Your progress is saved.')) navigate({ name: 'library' });
          }}>Exit</button>
          <button className="qg-btn primary sm" disabled={!allAnswered} onClick={submit}>Submit quiz</button>
        </>}
      />

      <div className="qg-scroll">
        <div className="qg-focused">
          <div className="qg-progress thick" style={{ marginBottom: 4 }}>
            <i style={{ width: `${((idx + 1) / total) * 100}%` }} />
          </div>

          <div className="qg-row" style={{ gap: 8, fontSize: 13, color: 'var(--ink-3)' }}>
            <span>{session.answers.filter(a => a != null).length} of {total} answered</span>
            {bookmarks.length > 0 && (
              <span className="qg-pill accent"><StarFill size={11} /> {bookmarks.length} bookmarked</span>
            )}
          </div>

          <h1 className="prompt"><RichText nodes={q.prompt} /></h1>

          <div className="qg-col" style={{ gap: 10 }}>
            {order.map((origChoiceIdx, displayIdx) => {
              const choice = q.choices[origChoiceIdx];
              const isPicked = answered === origChoiceIdx;
              const isCorrect = origChoiceIdx === correctOrig;
              let cls = 'qg-choice';
              if (locked) {
                cls += ' locked';
                if (isCorrect) cls += ' correct';
                else if (isPicked) cls += ' wrong';
              } else if (isPicked) {
                cls += ' picked';
              }
              return (
                <button key={origChoiceIdx} className={cls} onClick={() => pick(origChoiceIdx)}>
                  <span className="bullet">
                    {locked && isCorrect && <Check size={12} />}
                    {locked && isPicked && !isCorrect && <X size={12} />}
                    {!locked && isPicked && <Check size={12} />}
                  </span>
                  <span className="label">
                    <span className="qg-muted" style={{ marginRight: 8, fontSize: 13 }}>{String.fromCharCode(65 + displayIdx)}.</span>
                    <RichText nodes={choice} />
                  </span>
                  {locked && isCorrect && <span className="badge">Correct answer</span>}
                  {locked && isPicked && !isCorrect && <span className="badge">Your answer</span>}
                </button>
              );
            })}
          </div>

          {locked && answered !== correctOrig && (
            <div className="qg-card flat" style={{
              padding: 12, background: 'var(--bad-tint)', border: '1px solid var(--bad)',
              color: 'var(--ink)', fontSize: 14, marginTop: 4,
            }}>
              <b>Not quite.</b> The correct answer is <b><RichText nodes={q.choices[correctOrig]} /></b>.
            </div>
          )}
          {locked && answered === correctOrig && (
            <div className="qg-card flat" style={{
              padding: 12, background: 'var(--ok-tint)', border: '1px solid var(--ok)',
              color: 'var(--ink)', fontSize: 14, marginTop: 4,
            }}>
              <b>Correct! ✓</b>
            </div>
          )}

          <div className="qg-row between" style={{ marginTop: 18 }}>
            <button className="qg-btn" disabled={idx === 0} onClick={() => goto(idx - 1)}>
              <ChevLeft size={15} /> Previous
            </button>

            {isLast
              ? <button className="qg-btn primary" disabled={!allAnswered} onClick={submit}>
                  Submit quiz <ArrowRight size={15} />
                </button>
              : <button className="qg-btn primary" disabled={isInstant && answered == null} onClick={() => goto(idx + 1)}>
                  Next <ArrowRight size={15} />
                </button>}
          </div>

          {/* Question dot navigator */}
          <div style={{ marginTop: 28 }}>
            <div className="qg-h3" style={{ marginBottom: 8, color: 'var(--ink-3)' }}>Jump to a question</div>
            <div className="qg-dotgrid">
              {session.questionOrder.map((qOrig2, i) => {
                const ans = session.answers[qOrig2];
                const isCurrent = i === idx;
                const isBM = bookmarks.includes(qOrig2);
                let stateClass = 'skipped';
                if (ans != null) stateClass = 'ok';
                return (
                  <span key={i} className={stateClass}
                    style={{
                      width: 26, height: 26, borderRadius: 6, fontSize: 11,
                      borderColor: isCurrent ? 'var(--accent)' : isBM ? 'var(--accent-tint)' : '',
                      background: isCurrent ? 'var(--accent-soft)' : '',
                      color: isCurrent ? 'var(--accent)' : '',
                      fontWeight: isCurrent ? 600 : 400,
                      position: 'relative',
                    }}
                    onClick={() => goto(i)}>
                    {i + 1}
                    {isBM && <span style={{ position: 'absolute', top: -3, right: -2, fontSize: 9, color: 'var(--accent)' }}>★</span>}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── All on one page (Approach A) ───────────────────────────────────
function AllOnOnePage({ state, actions, navigate, quiz, session }) {
  const [search, setSearch] = useState('');
  const bookmarks = state.questionBookmarks[quiz.id] || [];
  const total = quiz.questions.length;
  const answeredCount = session.answers.filter(a => a != null).length;
  const isInstant = session.feedback === 'instant';
  const allAnswered = answeredCount === total;

  const pick = (qOrig, origChoiceIdx) => {
    const locked = isInstant && session.answers[qOrig] != null;
    if (locked) return;
    const next = { ...session, answers: session.answers.slice() };
    next.answers[qOrig] = origChoiceIdx;
    actions.saveSession(quiz.id, next);
  };

  const submit = () => {
    const finished = { ...session, submitted: true, finishedAt: Date.now() };
    actions.saveSession(quiz.id, finished);
    const summary = { ...QGHelpers.scoreSession(quiz, finished), finishedAt: finished.finishedAt, durationMs: finished.finishedAt - finished.startedAt };
    actions.saveResult(quiz.id, summary);
    navigate({ name: 'results', quizId: quiz.id });
  };

  const visibleQOrigs = session.questionOrder.filter((qOrig) => {
    if (!search) return true;
    const q = quiz.questions[qOrig];
    return (q.prompt + ' ' + q.choices.join(' ')).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <QGTopbar
        onMenu={navigate.onMenu}
        title={quiz.title.replace(/^\[.+?\]\s*/, '')}
        subtitle={`${answeredCount}/${total} answered · ${session.feedback === 'instant' ? 'instant feedback' : 'feedback at end'}`}
        right={<>
          <div className="qg-search" style={{ width: 200 }}>
            <QGIcon.Search size={14} />
            <input className="qg-input" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} style={{ height: 32, fontSize: 13 }} />
          </div>
          <button className="qg-btn ghost sm" onClick={() => {
            if (confirm('Exit this quiz? Your progress is saved.')) navigate({ name: 'library' });
          }}>Exit</button>
          <button className="qg-btn primary sm" disabled={!allAnswered} onClick={submit}>Submit quiz</button>
        </>}
      />
      <div className="qg-scroll">
        <div className="qg-content wide">
          <div className="qg-progress thick" style={{ marginBottom: 18 }}>
            <i style={{ width: `${(answeredCount / total) * 100}%` }} />
          </div>

          {visibleQOrigs.map((qOrig, displayN) => {
            const q = quiz.questions[qOrig];
            const order = session.choiceOrders[qOrig];
            const answered = session.answers[qOrig];
            const locked = isInstant && answered != null;
            const isBM = bookmarks.includes(qOrig);
            const userNum = session.questionOrder.indexOf(qOrig) + 1;
            return (
              <div key={qOrig} className="qg-qcard">
                <div className="qhead">
                  <h3 className="qprompt"><span className="qnum">{userNum}.</span><RichText nodes={q.prompt} /></h3>
                  <button className="qg-iconbtn" onClick={() => actions.toggleQuestionBookmark(quiz.id, qOrig)}>
                    {isBM ? <StarFill size={16} style={{ color: 'var(--accent)' }} /> : <Star size={16} />}
                  </button>
                </div>
                <div className="qg-col" style={{ gap: 8 }}>
                  {order.map((origChoiceIdx, displayIdx) => {
                    const isPicked = answered === origChoiceIdx;
                    const isCorrect = origChoiceIdx === q.correctIdx;
                    let cls = 'qg-choice';
                    if (locked) {
                      cls += ' locked';
                      if (isCorrect) cls += ' correct';
                      else if (isPicked) cls += ' wrong';
                    } else if (isPicked) {
                      cls += ' picked';
                    }
                    return (
                      <button key={origChoiceIdx} className={cls} onClick={() => pick(qOrig, origChoiceIdx)}>
                        <span className="bullet">
                          {locked && isCorrect && <Check size={12} />}
                          {locked && isPicked && !isCorrect && <X size={12} />}
                          {!locked && isPicked && <Check size={12} />}
                        </span>
                        <span className="label">
                          <span className="qg-muted" style={{ marginRight: 6, fontSize: 13 }}>{String.fromCharCode(65 + displayIdx)}.</span>
                          <RichText nodes={q.choices[origChoiceIdx]} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {visibleQOrigs.length === 0 && (
            <div className="qg-empty">No questions match "{search}".</div>
          )}

          <div className="qg-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="qg-btn primary lg" disabled={!allAnswered} onClick={submit}>
              Submit quiz <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Results Screen ─────────────────────────────────────────────────
export function QGResultsScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const session = state.sessions[quizId];
  const result = state.results[quizId];
  const [filter, setFilter] = useState('all');
  const bookmarks = state.questionBookmarks[quiz?.id] || [];
  const isFav = quiz ? state.bookmarks.includes(quizId) : false;

  if (!quiz || !session || !result) {
    return <div className="qg-scroll"><div className="qg-content">No results to show.</div></div>;
  }

  const filtered = session.questionOrder.filter((qOrig) => {
    const ans = session.answers[qOrig];
    const isWrong = ans != null && ans !== quiz.questions[qOrig].correctIdx;
    const isBM = bookmarks.includes(qOrig);
    if (filter === 'wrong') return isWrong;
    if (filter === 'bookmarked') return isBM;
    return true;
  });

  const retakeAll = () => {
    if (!confirm('Retake the entire quiz from scratch?')) return;
    const fresh = QGHelpers.makeSession(quiz, {
      randomizeQuestions: session.randomizeQuestions,
      randomizeChoices: session.randomizeChoices,
      layout: session.layout,
      feedback: session.feedback,
    });
    actions.clearResult(quiz.id);
    actions.saveSession(quiz.id, fresh);
    navigate({ name: 'quiz', quizId });
  };

  const retakeWrong = () => {
    const wrongOrigs = quiz.questions
      .map((q, i) => (session.answers[i] !== q.correctIdx ? i : -1))
      .filter((i) => i >= 0);
    if (!wrongOrigs.length) { alert('No wrong answers to retake!'); return; }
    const subset = {
      ...quiz,
      id: 'sub_' + Math.random().toString(36).slice(2, 8),
      title: quiz.title + ' · wrong only',
      questions: wrongOrigs.map((i) => quiz.questions[i]),
      createdAt: Date.now(),
    };
    actions.saveQuiz(subset);
    const fresh = QGHelpers.makeSession(subset, {
      randomizeQuestions: session.randomizeQuestions,
      randomizeChoices: session.randomizeChoices,
      layout: session.layout,
      feedback: session.feedback,
    });
    actions.saveSession(subset.id, fresh);
    navigate({ name: 'quiz', quizId: subset.id });
  };

  const dur = result.durationMs ? QGHelpers.formatDuration(result.durationMs) : '';
  const pctRound = Math.round(result.pct * 100);

  return (
    <>
      <QGTopbar
        onMenu={navigate.onMenu}
        title={quiz.title.replace(/^\[.+?\]\s*/, '')}
        subtitle={dur ? `Finished in ${dur}` : 'Finished'}
        right={<>
          <button className="qg-btn sm" onClick={() => actions.toggleBookmark(quizId)}>
            {isFav ? <StarFill size={14} style={{ color: 'var(--accent)' }} /> : <Star size={14} />}
            {isFav ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button className="qg-btn sm" onClick={() => QGExport.downloadResults(quiz, session, result)}>
            <Download size={14} /> Download
          </button>
          <button className="qg-btn primary sm" onClick={() => navigate({ name: 'upload' })}>
            <Plus size={14} /> New quiz
          </button>
        </>}
      />

      <div className="qg-scroll">
        <div className="qg-content wide">
          <div className="qg-grid-2" style={{ gridTemplateColumns: '280px 1fr', gap: 18, alignItems: 'start' }}>
            <div className="qg-card qg-card-pad" style={{ textAlign: 'center' }}>
              <svg className="qg-donut" width="180" height="180" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="9" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="9"
                  strokeDasharray={`${42 * 2 * Math.PI}`}
                  strokeDashoffset={`${42 * 2 * Math.PI * (1 - result.pct)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)" />
                <text x="50" y="48" textAnchor="middle" fontSize="20" fill="var(--ink)" fontWeight="600">{result.right}/{result.total}</text>
                <text x="50" y="62" textAnchor="middle" fontSize="8" fill="var(--ink-3)">{pctRound}% correct</text>
              </svg>
              <div className="qg-row" style={{ justifyContent: 'center', gap: 18, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ whiteSpace: 'nowrap' }}><b style={{ color: 'var(--ok)' }}>{result.right}</b> <span className="qg-muted">right</span></span>
                <span style={{ whiteSpace: 'nowrap' }}><b style={{ color: 'var(--bad)' }}>{result.wrong}</b> <span className="qg-muted">wrong</span></span>
                {result.skipped > 0 && <span style={{ whiteSpace: 'nowrap' }}><b className="qg-muted">{result.skipped}</b> <span className="qg-muted">skipped</span></span>}
              </div>

              <hr className="qg-divider" />

              <div className="qg-col" style={{ gap: 6 }}>
                <button className="qg-btn primary" onClick={retakeAll}><Refresh size={14} /> Retake quiz</button>
                <button className="qg-btn" onClick={retakeWrong} disabled={result.wrong === 0}>
                  <X size={14} /> Retake wrong only ({result.wrong})
                </button>
                <button className="qg-btn ghost" onClick={() => navigate({ name: 'upload' })}>
                  <Plus size={14} /> Upload another quizfetch
                </button>
              </div>
            </div>

            <div>
              <div className="qg-card qg-card-pad" style={{ marginBottom: 14 }}>
                <div className="qg-h3" style={{ marginBottom: 10 }}>Question grid</div>
                <div className="qg-dotgrid">
                  {session.questionOrder.map((qOrig, i) => {
                    const ans = session.answers[qOrig];
                    const right = ans === quiz.questions[qOrig].correctIdx;
                    return (
                      <span key={qOrig}
                        className={ans == null ? 'skipped' : right ? 'ok' : 'bad'}
                        title={`Q${i + 1}: ${right ? 'correct' : ans == null ? 'skipped' : 'wrong'}`}>
                        {ans == null ? '–' : right ? '✓' : '✗'}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="qg-card qg-card-pad">
                <div className="qg-row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div className="qg-h3">Review answers</div>
                  <div className="qg-tabbar">
                    <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All ({result.total})</button>
                    <button className={filter === 'wrong' ? 'on' : ''} onClick={() => setFilter('wrong')}>Wrong ({result.wrong})</button>
                    <button className={filter === 'bookmarked' ? 'on' : ''} onClick={() => setFilter('bookmarked')}>★ ({bookmarks.length})</button>
                  </div>
                </div>

                <div className="qg-col" style={{ gap: 12 }}>
                  {filtered.map((qOrig) => {
                    const q = quiz.questions[qOrig];
                    const order = session.choiceOrders[qOrig];
                    const ans = session.answers[qOrig];
                    const correctOrig = q.correctIdx;
                    const userNum = session.questionOrder.indexOf(qOrig) + 1;
                    const right = ans === correctOrig;
                    const isBM = bookmarks.includes(qOrig);
                    return (
                      <div key={qOrig} className="qg-card flat" style={{ padding: 14, border: '1px solid var(--border)' }}>
                        <div className="qg-row between" style={{ alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 15.5, lineHeight: 1.35 }}>
                            <span className="qg-muted">{userNum}.</span> <RichText nodes={q.prompt} />
                          </div>
                          <div className="qg-row" style={{ gap: 6, flex: '0 0 auto' }}>
                            {isBM && <span className="qg-pill accent"><StarFill size={11} /></span>}
                            <span className={`qg-pill ${right ? 'ok' : ans == null ? '' : 'bad'}`}>
                              {right ? '✓ correct' : ans == null ? '— skipped' : '✗ wrong'}
                            </span>
                          </div>
                        </div>
                        <div className="qg-col" style={{ gap: 6 }}>
                          {order.map((origChoiceIdx, displayIdx) => {
                            const isPicked = ans === origChoiceIdx;
                            const isCorrect = origChoiceIdx === correctOrig;
                            let cls = 'qg-choice locked';
                            if (isCorrect) cls += ' correct';
                            else if (isPicked) cls += ' wrong';
                            return (
                              <div key={origChoiceIdx} className={cls} style={{ padding: '8px 10px', fontSize: 14 }}>
                                <span className="bullet" style={{ width: 16, height: 16, flex: '0 0 16px' }}>
                                  {isCorrect && <Check size={10} />}
                                  {isPicked && !isCorrect && <X size={10} />}
                                </span>
                                <span className="label">
                                  <span className="qg-muted" style={{ marginRight: 6 }}>{String.fromCharCode(65 + displayIdx)}.</span>
                                  <RichText nodes={q.choices[origChoiceIdx]} />
                                </span>
                                {isCorrect && <span className="badge">Correct</span>}
                                {isPicked && !isCorrect && <span className="badge">Your answer</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="qg-muted" style={{ textAlign: 'center', padding: 20 }}>Nothing to show here.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
