// Upload, Preview, Ready screens.

const { useState: useStateUp, useRef: useRefUp } = React;
const { Upload, Sparkles, Refresh, Plus, ArrowRight, ArrowLeft, Star, StarFill, Download, Play, Shuffle, X: XIcon, Check, Eye } = window.SketchIcon;
const { HandUnderline: HU2, HandArrow: HA2, HandSquiggle: HS2, HandStar: HST2, CircledNum: CN2 } = window.SketchDeco;

function QGUploadScreen({ state, actions, navigate }) {
  const [over, setOver] = useStateUp(false);
  const [pasteText, setPasteText] = useStateUp('');
  const [promptOpen, setPromptOpen] = useStateUp(true);
  const [copied, setCopied] = useStateUp(false);
  const inputRef = useRefUp(null);

  const handleFakeUpload = () => {
    // Pick a sample quiz to "parse"
    const sample = Object.values(state.quizzes)[0];
    navigate({ name: 'preview', quizId: sample.id });
  };

  const handlePaste = () => {
    if (!pasteText.trim()) return;
    const sample = Object.values(state.quizzes)[0];
    navigate({ name: 'preview', quizId: sample.id });
  };

  const copyPrompt = () => {
    try {
      navigator.clipboard.writeText(window.SketchData.POLISH_PROMPT_PREVIEW);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qg-scroll">
      <div className="qg-content wide" style={{ maxWidth: 1000 }}>
        <div className="qg-row" style={{ alignItems: 'flex-end', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
          <h1 className="qg-h1"><span className="hl">New</span> quiz</h1>
          <HA2 dir="down-right" size={50} color="var(--accent)" style={{ marginBottom: -2, opacity: 0.85 }} />
        </div>
        <p className="qg-muted-2" style={{ marginBottom: 28, fontSize: 17, marginTop: 14 }}>
          Drop a quizfetch HTML file, paste notes in any format, or use the AI prompt to convert any reviewer.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
          {/* Left: drop zone + paste box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              className={`qg-drop ${over ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); handleFakeUpload(); }}
              onClick={handleFakeUpload}
            >
              <div className="icon"><Upload size={26} /></div>
              <div className="qg-h2" style={{ fontSize: 28 }}>Drop a file here</div>
              <div className="qg-muted" style={{ marginTop: 8, fontSize: 16 }}>
                or <u>click to browse</u> · .html, .txt, .md
              </div>
              <div className="qg-muted" style={{ fontSize: 14, marginTop: 6 }}>
                nothing leaves your device
              </div>
              <input ref={inputRef} type="file" style={{ display: 'none' }}
                onChange={() => handleFakeUpload()} />
            </div>

            <div className="qg-card qg-card-pad" style={{ padding: 18 }}>
              <div className="qg-row" style={{ gap: 10, marginBottom: 10 }}>
                <span style={{ color: 'var(--accent)' }}><Sparkles size={18} /></span>
                <h3 className="qg-h3" style={{ fontSize: 20 }}>Or paste text directly</h3>
              </div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Paste your notes, Quizlet export, Q&A pairs, or AI-generated JSON here…"}
                style={{
                  width: '100%', minHeight: 130, resize: 'vertical',
                  fontFamily: 'var(--hand-body)', fontSize: 16, lineHeight: 1.5,
                  border: '2.5px solid var(--ink)', borderRadius: 10,
                  padding: '10px 12px', background: 'var(--surface)',
                  color: 'var(--ink)', boxSizing: 'border-box',
                  boxShadow: 'var(--shadow-marker-sm)',
                }}
              />
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="qg-btn primary" onClick={handlePaste} disabled={!pasteText.trim()}>
                  <Sparkles size={15} /> Parse
                </button>
              </div>
            </div>

            <div className="qg-row" style={{ gap: 10 }}>
              <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'library' })}>
                ← Back to library
              </button>
              <span className="qg-muted" style={{ fontSize: 14 }}>·</span>
              <button className="qg-btn sm" onClick={handleFakeUpload}>
                <Sparkles size={14} /> Try the sample quiz
              </button>
            </div>
          </div>

          {/* Right: Polish-first prompt panel */}
          <div className="qg-card" style={{ overflow: 'hidden', position: 'relative' }}>
            {/* tape on top */}
            <span style={{
              position: 'absolute', top: -10, right: 24, width: 60, height: 22,
              background: 'rgba(201, 100, 66, 0.32)',
              border: '1.5px solid rgba(41, 38, 27, 0.4)',
              transform: 'rotate(8deg)',
              zIndex: 2,
              borderRadius: 2,
            }} />
            <button
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: promptOpen ? '2.5px dashed var(--ink)' : 'none',
                font: 'inherit', textAlign: 'left',
              }}
              onClick={() => setPromptOpen(o => !o)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={18} color="var(--accent)" />
                <span className="qg-h3" style={{ fontSize: 20 }}>Pasting from a reviewer? Polish first.</span>
              </span>
              <span className="qg-muted" style={{ fontSize: 16 }}>{promptOpen ? '▲' : '▼'}</span>
            </button>

            {promptOpen && (
              <div style={{ padding: 18 }}>
                <p className="qg-muted-2" style={{ fontSize: 15, marginTop: 0, marginBottom: 12, lineHeight: 1.5 }}>
                  Copy this prompt, paste it into <b>ChatGPT, Claude, or Gemini</b> with your study material, and bring the JSON back here.
                </p>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'var(--surface-2)',
                    border: '2px solid var(--ink)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 13,
                    lineHeight: 1.55,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    color: 'var(--ink-2)',
                    fontFamily: 'var(--hand-body)',
                    maxHeight: 280, overflowY: 'auto',
                  }}>
                    {window.SketchData.POLISH_PROMPT_PREVIEW}
                  </pre>
                  <button
                    className="qg-btn sm"
                    onClick={copyPrompt}
                    style={{ position: 'absolute', top: 10, right: 10 }}
                  >
                    {copied ? <span><Check size={13} /> copied!</span> : 'Copy prompt'}
                  </button>
                </div>
                <p className="qg-tiny" style={{ marginTop: 12 }}>
                  The AI returns clean JSON — paste it on the left and click Parse.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Preview & configure ──────────────────────────────────────── */
function QGPreviewScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const [cfg, setCfg] = useStateUp({
    randomizeQuestions: true,
    randomizeChoices: true,
    layout: 'one',
    feedback: 'instant',
  });

  if (!quiz) return <div className="qg-scroll"><div className="qg-content">Quiz not found.</div></div>;

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 22, flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <h1 className="qg-h1">{quiz.title.replace(/^\[.+?\]\s*/, '')}</h1>
            <div className="qg-row" style={{ marginTop: 14, gap: 10, flexWrap: 'wrap', fontSize: 15 }}>
              {quiz.course && <span className="qg-muted">{quiz.course}</span>}
              <span className="qg-pill ok"><Sparkles size={12} /> {quiz.questions.length} questions parsed</span>
              <span className="qg-pill">parsed by quizfetch v2</span>
            </div>
          </div>
          <div className="qg-row" style={{ gap: 10 }}>
            <button className="qg-btn" onClick={() => navigate({ name: 'upload' })}>
              <Refresh size={15} /> Re-upload
            </button>
          </div>
        </div>

        <div className="qg-grid-2">
          <div className="qg-card qg-card-pad">
            <h3 className="qg-h3" style={{ marginBottom: 14 }}>Quiz options</h3>

            <CheckRow checked={cfg.randomizeQuestions} onToggle={() => setCfg({ ...cfg, randomizeQuestions: !cfg.randomizeQuestions })}
              icon={<Shuffle size={15} />} label="Randomize question order" />
            <CheckRow checked={cfg.randomizeChoices} onToggle={() => setCfg({ ...cfg, randomizeChoices: !cfg.randomizeChoices })}
              icon={<Shuffle size={15} />} label="Randomize choice order" />

            <hr className="qg-divider" />

            <h3 className="qg-h3" style={{ marginBottom: 8 }}>Layout</h3>
            <RadioRow checked={cfg.layout === 'one'} onPick={() => setCfg({ ...cfg, layout: 'one' })}
              label="One question at a time" sub="Focused mode — see one question per screen." />
            <RadioRow checked={cfg.layout === 'all'} onPick={() => setCfg({ ...cfg, layout: 'all' })}
              label="All questions on one page" sub="Scroll through everything. Submit at the end." />

            <hr className="qg-divider" />

            <h3 className="qg-h3" style={{ marginBottom: 8 }}>Feedback</h3>
            <RadioRow checked={cfg.feedback === 'instant'} onPick={() => setCfg({ ...cfg, feedback: 'instant' })}
              label="Instant" sub="Reveal the correct answer the moment you pick." />
            <RadioRow checked={cfg.feedback === 'submit'} onPick={() => setCfg({ ...cfg, feedback: 'submit' })}
              label="After submit" sub="See all results once at the end." />
          </div>

          <div className="qg-card qg-card-pad">
            <div className="qg-row between" style={{ marginBottom: 14 }}>
              <h3 className="qg-h3">Parsed preview</h3>
              <span className="qg-pill ok"><Check size={11} /> {quiz.questions.length}/{quiz.questions.length}</span>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto', margin: '0 -4px', padding: '0 4px 4px' }}>
              {quiz.questions.slice(0, 6).map((q, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '2px dashed var(--border-soft)' }}>
                  <div style={{ fontSize: 16, color: 'var(--ink)', fontFamily: 'var(--hand-body)', lineHeight: 1.35 }}>
                    <span className="qg-muted" style={{ fontFamily: 'var(--hand-display)', fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>
                    {q.prompt}
                  </div>
                  <div className="qg-tiny" style={{ marginTop: 4 }}>
                    {q.choices.length} choices · answer: <span style={{ color: 'var(--ok)', fontWeight: 700 }}>{q.choices[q.correctIdx]}</span>
                  </div>
                </div>
              ))}
              {quiz.questions.length > 6 && (
                <div className="qg-tiny" style={{ paddingTop: 10 }}>… and {quiz.questions.length - 6} more</div>
              )}
            </div>
          </div>
        </div>

        <div className="qg-row between" style={{ marginTop: 28 }}>
          <button className="qg-btn ghost" onClick={() => navigate({ name: 'library' })}>← Cancel</button>
          <div className="qg-row" style={{ gap: 16, alignItems: 'center' }}>
            <span className="qg-handnote" style={{
              fontFamily: 'var(--hand-display)', fontSize: 22, color: 'var(--accent)',
              transform: 'rotate(-3deg)',
            }}>let's go!</span>
            <HA2 dir="right" size={50} color="var(--accent)" style={{ opacity: 0.8 }} />
            <button className="qg-btn primary lg" onClick={() => navigate({ name: 'ready', quizId })}>
              <Sparkles size={16} /> Generate quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ checked, onToggle, icon, label }) {
  return (
    <div className={`qg-check-row ${checked ? 'on' : ''}`} onClick={onToggle}>
      <span className="box">{checked && <Check size={14} />}</span>
      <span className="label-main qg-row" style={{ gap: 8 }}>
        {icon && <span className="qg-muted">{icon}</span>} {label}
      </span>
    </div>
  );
}

function RadioRow({ checked, onPick, label, sub }) {
  return (
    <div className={`qg-check-row radio ${checked ? 'on' : ''}`} onClick={onPick}
      style={{ flexDirection: 'column', gap: 0, alignItems: 'flex-start' }}>
      <div className="qg-row" style={{ gap: 12 }}>
        <span className="box" />
        <span className="label-main">{label}</span>
      </div>
      {sub && <div className="label-sub">{sub}</div>}
    </div>
  );
}

/* ── Ready / decision ─────────────────────────────────────────── */
function QGReadyScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  if (!quiz) return null;
  const isFav = state.bookmarks.includes(quizId);

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 24, alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <div className="qg-row" style={{ gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <h1 className="qg-h1">Your quiz is <span className="hl">ready!</span></h1>
              <HST2 size={32} color="var(--accent)" filled style={{ marginBottom: 4, transform: 'rotate(15deg)' }} />
            </div>
            <div className="qg-muted-2" style={{ marginTop: 16, fontSize: 17 }}>
              <b>{quiz.title.replace(/^\[.+?\]\s*/, '')}</b> · {quiz.questions.length} questions
            </div>
            <div className="qg-muted" style={{ fontSize: 14, marginTop: 4 }}>
              one-by-one · instant feedback · randomized
            </div>
          </div>
          <span className="qg-pill ok"><Sparkles size={12} /> saved to library</span>
        </div>

        <div className="qg-handnote" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--hand-display)', fontSize: 22, color: 'var(--ink-3)',
          }}>What now?</span>
          <HS2 w={120} color="var(--ink-3)" />
        </div>

        <div className="qg-decision-grid">
          <button className="qg-decision primary" onClick={() => navigate({ name: 'quiz', quizId })}>
            <div className="ico"><Play size={20} /></div>
            <h4>Take the quiz now</h4>
            <p>Jump in — your progress autosaves to this device.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn primary sm">Start <ArrowRight size={14} /></span>
            </div>
          </button>

          <button className="qg-decision" onClick={() => actions.toggleBookmark(quizId)}>
            <div className="ico" style={{ background: 'var(--warn-tint)', color: 'var(--warn)' }}>
              {isFav ? <StarFill size={20} /> : <Star size={20} />}
            </div>
            <h4>{isFav ? 'Bookmarked ✓' : 'Bookmark for later'}</h4>
            <p>Save to your library — pin to the top for quick access.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn sm">{isFav ? 'Unbookmark' : 'Bookmark'}</span>
            </div>
          </button>

          <button className="qg-decision" onClick={() => navigate({ name: 'upload' })}>
            <div className="ico" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}><Refresh size={20} /></div>
            <h4>Re-upload</h4>
            <p>Replace this quiz with a different file or pasted text.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn sm">Re-upload</span>
            </div>
          </button>
        </div>

        <div className="qg-card dashed" style={{ marginTop: 22, padding: '12px 18px', background: 'var(--surface-2)' }}>
          <div className="qg-row between" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div className="qg-row qg-muted-2" style={{ fontSize: 15 }}>
              <Download size={15} />
              Also:&nbsp;
              <a>download JSON</a>&nbsp;·&nbsp;<a>download HTML</a>
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

window.SketchScreens = { QGUploadScreen, QGPreviewScreen, QGReadyScreen };
