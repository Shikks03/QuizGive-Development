// Quiz-taking and Results screens.

const QGQ_R = React;
const { useState: useStateQ, useEffect: useEffectQ } = QGQ_R;
const Icon_Q = window.SketchIcon;
const Deco_Q = window.SketchDeco;

function QGQuizScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const result = state.results[quizId];
  const existingSession = state.sessions[quizId];

  // If we have a finalized result and no live session, go to results.
  if (result && (!existingSession || existingSession.submitted)) {
    return <QGResultsScreen state={state} actions={actions} navigate={navigate} quizId={quizId} />;
  }

  useEffectQ(() => {
    if (!quiz) return;
    if (!existingSession) {
      const s = makeSession(quiz, {
        randomizeQuestions: false,
        randomizeChoices: false,
        layout: 'one',
        feedback: 'instant',
      });
      actions.saveSession(quizId, s);
    }
  }, [quizId]);

  if (!quiz) return <div className="qg-scroll"><div className="qg-content">Quiz not found.</div></div>;
  if (!existingSession) return null;

  return existingSession.layout === 'one'
    ? <OneAtATime state={state} actions={actions} navigate={navigate} quiz={quiz} session={existingSession} />
    : <AllOnOne state={state} actions={actions} navigate={navigate} quiz={quiz} session={existingSession} />;
}

function makeSession(quiz, opts) {
  const n = quiz.questions.length;
  return {
    submitted: false,
    answers: new Array(n).fill(null),
    questionOrder: Array.from({ length: n }, (_, i) => i),
    choiceOrders: quiz.questions.map((q) => q.choices.map((_, i) => i)),
    currentIdx: 0,
    layout: opts.layout || 'one',
    feedback: opts.feedback || 'instant',
    randomizeQuestions: !!opts.randomizeQuestions,
    randomizeChoices: !!opts.randomizeChoices,
    startedAt: Date.now(),
  };
}

function scoreSession(quiz, session) {
  let right = 0, wrong = 0, skipped = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    const a = session.answers[i];
    if (a == null) skipped++;
    else if (a === quiz.questions[i].correctIdx) right++;
    else wrong++;
  }
  const total = quiz.questions.length;
  return { right, wrong, skipped, total, pct: total ? right / total : 0 };
}

/* ── One at a time ────────────────────────────────────────────── */
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
    const summary = {
      ...scoreSession(quiz, finished),
      finishedAt: finished.finishedAt,
      durationMs: finished.finishedAt - finished.startedAt,
    };
    actions.saveResult(quiz.id, summary);
    navigate({ name: 'results', quizId: quiz.id });
  };

  const isLast = idx === total - 1;
  const allAnswered = session.answers.every(a => a != null);
  const QGTopbar = window.SketchShell.QGTopbar;
  const { Star, StarFill, ChevLeft, ChevRight, ArrowRight, Check, X } = Icon_Q;

  return (
    <>
      <QGTopbar
        onMenu={navigate.onMenu}
        title={quiz.title.replace(/^\[.+?\]\s*/, '')}
        subtitle={`Question ${idx + 1} of ${total} · ${session.feedback === 'instant' ? 'instant feedback' : 'feedback at end'}`}
        right={<>
          <button className="qg-iconbtn" onClick={() => actions.toggleQuestionBookmark(quiz.id, qOrig)} title="Bookmark this question">
            {isBookmarked ? <StarFill size={20} style={{ color: 'var(--accent)' }} /> : <Star size={20} />}
          </button>
          <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'library' })}>Exit</button>
          <button className="qg-btn primary sm" disabled={!allAnswered} onClick={submit}>Submit quiz</button>
        </>}
      />

      <div className="qg-scroll">
        <div className="qg-focused">
          <div className="qg-progress thick" style={{ marginBottom: 4 }}>
            <i style={{ width: `${((idx + 1) / total) * 100}%` }} />
          </div>

          <div className="qg-row" style={{ gap: 12, fontSize: 15, color: 'var(--ink-3)' }}>
            <span>{session.answers.filter(a => a != null).length} of {total} answered</span>
            {bookmarks.length > 0 && (
              <span className="qg-pill accent"><StarFill size={11} /> {bookmarks.length} bookmarked</span>
            )}
          </div>

          <div className="qg-row" style={{ gap: 14, alignItems: 'flex-start' }}>
            <Deco_Q.CircledNum n={idx + 1} size={44} color="var(--accent)" />
            <h1 className="prompt" style={{ flex: 1 }}>{q.prompt}</h1>
          </div>

          <div className="qg-col" style={{ gap: 12 }}>
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
                  <span className={`bullet ${!locked && !isPicked ? 'letter' : ''}`}>
                    {locked && isCorrect && <Check size={14} />}
                    {locked && isPicked && !isCorrect && <X size={14} />}
                    {!locked && isPicked && <Check size={14} />}
                    {!locked && !isPicked && String.fromCharCode(65 + displayIdx)}
                  </span>
                  <span className="label">{choice}</span>
                  {locked && isCorrect && <span className="badge">correct!</span>}
                  {locked && isPicked && !isCorrect && <span className="badge">your pick</span>}
                </button>
              );
            })}
          </div>

          {locked && answered !== correctOrig && (
            <div className="qg-card flat" style={{
              padding: 14, background: 'var(--bad-tint)', borderColor: 'var(--bad)',
              fontSize: 16, marginTop: 6, position: 'relative',
            }}>
              <div className="qg-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                <Deco_Q.HandCross size={28} />
                <div>
                  <b>Not quite.</b> The correct answer is <b>{q.choices[correctOrig]}</b>.
                </div>
              </div>
            </div>
          )}
          {locked && answered === correctOrig && (
            <div className="qg-card flat" style={{
              padding: 14, background: 'var(--ok-tint)', borderColor: 'var(--ok)',
              fontSize: 16, marginTop: 6, position: 'relative',
            }}>
              <div className="qg-row" style={{ gap: 10 }}>
                <Deco_Q.HandCheck size={28} />
                <div><b>Correct!</b> Nicely done.</div>
              </div>
            </div>
          )}

          <div className="qg-row between" style={{ marginTop: 22 }}>
            <button className="qg-btn" disabled={idx === 0} onClick={() => goto(idx - 1)}>
              <ChevLeft size={16} /> Previous
            </button>
            {isLast
              ? <button className="qg-btn primary" disabled={!allAnswered} onClick={submit}>
                  Submit quiz <ArrowRight size={16} />
                </button>
              : <button className="qg-btn primary" disabled={isInstant && answered == null} onClick={() => goto(idx + 1)}>
                  Next <ArrowRight size={16} />
                </button>}
          </div>

          {/* Dot navigator */}
          <div style={{ marginTop: 32 }}>
            <div className="qg-row" style={{ gap: 10, marginBottom: 10 }}>
              <h3 className="qg-h3" style={{ color: 'var(--ink-3)', fontSize: 18 }}>Jump to a question</h3>
              <Deco_Q.HandSquiggle w={80} color="var(--ink-4)" />
            </div>
            <div className="qg-dotgrid">
              {session.questionOrder.map((qOrig2, i) => {
                const ans = session.answers[qOrig2];
                const isCurrent = i === idx;
                const isBM = bookmarks.includes(qOrig2);
                let cls = 'skipped';
                if (ans != null) cls = 'ok';
                if (isCurrent) cls += ' current';
                return (
                  <span key={i} className={cls} onClick={() => goto(i)}>
                    {i + 1}
                    {isBM && <span style={{ position: 'absolute', top: -6, right: -4, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--hand-display)', fontWeight: 700 }}>★</span>}
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

/* ── All on one page ──────────────────────────────────────────── */
function AllOnOne({ state, actions, navigate, quiz, session }) {
  const [search, setSearch] = useStateQ('');
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
    const summary = {
      ...scoreSession(quiz, finished),
      finishedAt: finished.finishedAt,
      durationMs: finished.finishedAt - finished.startedAt,
    };
    actions.saveResult(quiz.id, summary);
    navigate({ name: 'results', quizId: quiz.id });
  };

  const visibleQOrigs = session.questionOrder.filter((qOrig) => {
    if (!search) return true;
    const q = quiz.questions[qOrig];
    return (q.prompt + ' ' + q.choices.join(' ')).toLowerCase().includes(search.toLowerCase());
  });

  const QGTopbar = window.SketchShell.QGTopbar;
  const { Star, StarFill, ArrowRight, Check, X, Search } = Icon_Q;

  return (
    <>
      <QGTopbar
        onMenu={navigate.onMenu}
        title={quiz.title.replace(/^\[.+?\]\s*/, '')}
        subtitle={`${answeredCount}/${total} answered · ${session.feedback === 'instant' ? 'instant feedback' : 'feedback at end'}`}
        right={<>
          <div className="qg-search" style={{ width: 220 }}>
            <Search size={15} />
            <input className="qg-input sm" placeholder="search questions" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'library' })}>Exit</button>
          <button className="qg-btn primary sm" disabled={!allAnswered} onClick={submit}>Submit quiz</button>
        </>}
      />
      <div className="qg-scroll">
        <div className="qg-content wide">
          <div className="qg-progress thick" style={{ marginBottom: 22 }}>
            <i style={{ width: `${(answeredCount / total) * 100}%` }} />
          </div>

          {visibleQOrigs.map((qOrig) => {
            const q = quiz.questions[qOrig];
            const order = session.choiceOrders[qOrig];
            const answered = session.answers[qOrig];
            const locked = isInstant && answered != null;
            const isBM = bookmarks.includes(qOrig);
            const userNum = session.questionOrder.indexOf(qOrig) + 1;
            return (
              <div key={qOrig} className="qg-qcard">
                <div className="qhead">
                  <h3 className="qprompt"><span className="qnum">{userNum}.</span>{q.prompt}</h3>
                  <button className="qg-iconbtn" onClick={() => actions.toggleQuestionBookmark(quiz.id, qOrig)}>
                    {isBM ? <StarFill size={18} style={{ color: 'var(--accent)' }} /> : <Star size={18} />}
                  </button>
                </div>
                <div className="qg-col" style={{ gap: 10 }}>
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
                        <span className={`bullet ${!locked && !isPicked ? 'letter' : ''}`}>
                          {locked && isCorrect && <Check size={14} />}
                          {locked && isPicked && !isCorrect && <X size={14} />}
                          {!locked && isPicked && <Check size={14} />}
                          {!locked && !isPicked && String.fromCharCode(65 + displayIdx)}
                        </span>
                        <span className="label">{q.choices[origChoiceIdx]}</span>
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

          <div className="qg-row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="qg-btn primary lg" disabled={!allAnswered} onClick={submit}>
              Submit quiz <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Results ──────────────────────────────────────────────────── */
function QGResultsScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const session = state.sessions[quizId];
  const result = state.results[quizId];
  const [filter, setFilter] = useStateQ('all');
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
    const fresh = makeSession(quiz, { layout: 'one', feedback: 'instant' });
    actions.clearResult(quiz.id);
    actions.saveSession(quiz.id, fresh);
    navigate({ name: 'quiz', quizId });
  };

  const QGTopbar = window.SketchShell.QGTopbar;
  const { Star, StarFill, Refresh, Download, Plus, Check, X } = Icon_Q;
  const dur = result.durationMs ? window.SketchData.formatDuration(result.durationMs) : '';
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
          <button className="qg-btn sm">
            <Download size={14} /> Download
          </button>
          <button className="qg-btn primary sm" onClick={() => navigate({ name: 'upload' })}>
            <Plus size={14} /> New quiz
          </button>
        </>}
      />

      <div className="qg-scroll">
        <div className="qg-content wide">
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22, alignItems: 'start' }}>
            <div className="qg-card qg-card-pad" style={{ textAlign: 'center', position: 'relative' }}>
              {pctRound >= 80 && <span className="qg-stamp accent">A+</span>}
              <Deco_Q.HandDonut pct={result.pct} right={result.right} total={result.total} />
              <div className="qg-row" style={{ justifyContent: 'center', gap: 22, marginTop: 8, flexWrap: 'wrap', fontFamily: 'var(--hand-body)' }}>
                <span><b style={{ color: 'var(--ok)', fontFamily: 'var(--hand-display)', fontSize: 22 }}>{result.right}</b> <span className="qg-muted">right</span></span>
                <span><b style={{ color: 'var(--bad)', fontFamily: 'var(--hand-display)', fontSize: 22 }}>{result.wrong}</b> <span className="qg-muted">wrong</span></span>
                {result.skipped > 0 && <span><b style={{ fontFamily: 'var(--hand-display)', fontSize: 22 }} className="qg-muted">{result.skipped}</b> <span className="qg-muted">skipped</span></span>}
              </div>

              <hr className="qg-divider" />

              <div className="qg-col" style={{ gap: 8 }}>
                <button className="qg-btn primary" onClick={retakeAll}><Refresh size={15} /> Retake quiz</button>
                <button className="qg-btn" disabled={result.wrong === 0}>
                  <X size={15} /> Retake wrong only ({result.wrong})
                </button>
                <button className="qg-btn ghost" onClick={() => navigate({ name: 'upload' })}>
                  <Plus size={15} /> Upload another
                </button>
              </div>
            </div>

            <div>
              <div className="qg-card qg-card-pad" style={{ marginBottom: 18 }}>
                <div className="qg-row" style={{ gap: 12, marginBottom: 14 }}>
                  <h3 className="qg-h3">Question grid</h3>
                  <Deco_Q.HandSquiggle w={80} color="var(--ink-4)" />
                </div>
                <div className="qg-dotgrid">
                  {session.questionOrder.map((qOrig, i) => {
                    const ans = session.answers[qOrig];
                    const right = ans === quiz.questions[qOrig].correctIdx;
                    return (
                      <span key={qOrig} className={ans == null ? 'skipped' : right ? 'ok' : 'bad'}
                        title={`Q${i + 1}: ${right ? 'correct' : ans == null ? 'skipped' : 'wrong'}`}>
                        {ans == null ? '–' : right ? '✓' : '✗'}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="qg-card qg-card-pad">
                <div className="qg-row between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <h3 className="qg-h3">Review answers</h3>
                  <div className="qg-tabbar">
                    <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All ({result.total})</button>
                    <button className={filter === 'wrong' ? 'on' : ''} onClick={() => setFilter('wrong')}>Wrong ({result.wrong})</button>
                    <button className={filter === 'bookmarked' ? 'on' : ''} onClick={() => setFilter('bookmarked')}>★ ({bookmarks.length})</button>
                  </div>
                </div>

                <div className="qg-col" style={{ gap: 14 }}>
                  {filtered.map((qOrig) => {
                    const q = quiz.questions[qOrig];
                    const order = session.choiceOrders[qOrig];
                    const ans = session.answers[qOrig];
                    const correctOrig = q.correctIdx;
                    const userNum = session.questionOrder.indexOf(qOrig) + 1;
                    const right = ans === correctOrig;
                    const isBM = bookmarks.includes(qOrig);
                    return (
                      <div key={qOrig} className="qg-card flat" style={{ padding: 16, boxShadow: 'none' }}>
                        <div className="qg-row between" style={{ alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                          <div style={{ fontFamily: 'var(--hand-display)', fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>
                            <span style={{ color: 'var(--accent)', marginRight: 6 }}>{userNum}.</span>
                            {q.prompt}
                          </div>
                          <div className="qg-row" style={{ gap: 6, flex: '0 0 auto' }}>
                            {isBM && <span className="qg-pill accent"><StarFill size={11} /></span>}
                            <span className={`qg-pill ${right ? 'ok' : ans == null ? '' : 'bad'}`}>
                              {right ? <><Check size={11} /> correct</> : ans == null ? '— skipped' : <><X size={11} /> wrong</>}
                            </span>
                          </div>
                        </div>
                        <div className="qg-col" style={{ gap: 8 }}>
                          {order.map((origChoiceIdx, displayIdx) => {
                            const isPicked = ans === origChoiceIdx;
                            const isCorrect = origChoiceIdx === correctOrig;
                            let cls = 'qg-choice locked';
                            if (isCorrect) cls += ' correct';
                            else if (isPicked) cls += ' wrong';
                            return (
                              <div key={origChoiceIdx} className={cls} style={{ padding: '10px 12px', fontSize: 15 }}>
                                <span className="bullet letter" style={{ width: 22, height: 22, flex: '0 0 22px', fontSize: 13 }}>
                                  {isCorrect && <Check size={12} />}
                                  {isPicked && !isCorrect && <X size={12} />}
                                  {!isCorrect && !isPicked && String.fromCharCode(65 + displayIdx)}
                                </span>
                                <span className="label">{q.choices[origChoiceIdx]}</span>
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
                    <div className="qg-muted" style={{ textAlign: 'center', padding: 24 }}>Nothing to show here.</div>
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

window.SketchQuiz = { QGQuizScreen, QGResultsScreen };
