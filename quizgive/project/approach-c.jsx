/* global React, Logo, Avatar, Row, Screen, DropZone, QuestionCardCompact, ScreenCaption, FlowArrow */

// ═══════════════════════════════════════════════════════════════════
// APPROACH C — "Stepper Workflow"
// Linear numbered steps along the top: Upload → Configure → Take → Done.
// Each step is its own screen. Heavy emphasis on the "what now?" CTAs
// after finishing (download, bookmark, upload another).
// ═══════════════════════════════════════════════════════════════════

const C_W = 760, C_H = 540;

const Steps = ({ at }) => {
  const steps = ['Upload', 'Configure', 'Ready', 'Take quiz', 'Review'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '14px 0 10px', gap: 6, borderBottom: '1.5px dashed var(--rule-soft)',
    }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              border: '2px solid var(--ink)',
              background: i === at ? 'var(--accent)' : i < at ? 'var(--ok-soft)' : 'var(--paper)',
              color: i === at ? 'var(--paper)' : 'var(--ink)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: 17,
              boxShadow: i === at ? '2px 2px 0 var(--ink)' : 'none',
            }}>
              {i < at ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 14, fontWeight: i === at ? 700 : 400, color: i === at ? 'var(--ink)' : 'var(--ink-3)' }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 26, borderTop: i < at ? '2px solid var(--ok)' : '2px dashed var(--rule-soft)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const C_TopBar = () => (
  <Row style={{ justifyContent: 'space-between', padding: '8px 14px' }}>
    <Logo size={20} />
    <Row><span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Library · 5 quizzes</span><Avatar size={24} /></Row>
  </Row>
);

const C1_Upload = () => (
  <Screen w={C_W} h={C_H}>
    <C_TopBar />
    <Steps at={0} />
    <div style={{ padding: '24px 60px' }}>
      <div className="s-hand" style={{ fontSize: 28, textAlign: 'center', marginBottom: 4 }}>
        Step 1 — Bring your <span className="s-squig">quizfetch</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-3)', marginBottom: 16 }}>
        We'll parse it locally. Nothing leaves your browser.
      </div>
      <DropZone tall />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>← Back to library</span>
        <Row><span className="s-btn">Paste HTML instead</span><span className="s-btn primary">Continue →</span></Row>
      </div>
    </div>
  </Screen>
);

const C2_Configure = () => (
  <Screen w={C_W} h={C_H}>
    <C_TopBar />
    <Steps at={1} />
    <div style={{ padding: '18px 40px' }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="s-hand" style={{ fontSize: 24 }}>Step 2 — Set it up</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Detected: <b>Summative Assessment 1</b> · <span className="s-pill ok" style={{ verticalAlign: '1px' }}>90 questions</span>
          </div>
        </div>
        <Row><span className="s-btn sm">↻ Re-upload</span></Row>
      </Row>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="s-box" style={{ padding: 12 }}>
          <div className="s-hand" style={{ fontSize: 18, marginBottom: 6 }}>How to take it</div>
          {[
            ['All on one page', 'Scroll through every question. Submit at the end.', true],
            ['One at a time', 'Focused mode — see one question per screen.', false],
          ].map(([t, d, on]) => (
            <div key={t} className="s-box flat" style={{
              padding: 8, marginBottom: 6, borderColor: on ? 'var(--accent)' : 'var(--rule-soft)',
              background: on ? 'var(--accent-tint)' : 'var(--paper)',
            }}>
              <Row><span className={`s-radio ${on ? 'on' : ''}`} /><b>{t}</b></Row>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginLeft: 26 }}>{d}</div>
            </div>
          ))}
        </div>
        <div className="s-box" style={{ padding: 12 }}>
          <div className="s-hand" style={{ fontSize: 18, marginBottom: 6 }}>When to show answers</div>
          {[
            ['Instantly', 'Reveal correct answer the moment you pick.', false],
            ['After submit', 'See all results once at the end.', true],
          ].map(([t, d, on]) => (
            <div key={t} className="s-box flat" style={{
              padding: 8, marginBottom: 6, borderColor: on ? 'var(--accent)' : 'var(--rule-soft)',
              background: on ? 'var(--accent-tint)' : 'var(--paper)',
            }}>
              <Row><span className={`s-radio ${on ? 'on' : ''}`} /><b>{t}</b></Row>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginLeft: 26 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="s-box" style={{ padding: 10, marginTop: 12 }}>
        <Row style={{ gap: 20 }}>
          <Row><span className="s-check on" /> Randomize questions</Row>
          <Row><span className="s-check on" /> Randomize choices</Row>
          <Row><span className="s-check" /> Timed (90 min)</Row>
          <Row><span className="s-check" /> Save progress</Row>
        </Row>
      </div>

      <Row style={{ justifyContent: 'space-between', marginTop: 16 }}>
        <span className="s-btn">← Back</span>
        <span className="s-btn primary lg">✨ Generate quiz →</span>
      </Row>
    </div>
  </Screen>
);

const C3_Ready = () => (
  <Screen w={C_W} h={C_H}>
    <C_TopBar />
    <Steps at={2} />
    <div style={{ padding: '20px 40px' }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
        <div>
          <div className="s-hand" style={{ fontSize: 26 }}>Your quiz is ready ✨</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            <b>Summative Assessment 1</b> · 90 q · randomized · feedback after submit
          </div>
        </div>
        <span className="s-pill ok">✓ generated · 0.2s</span>
      </Row>

      <div className="s-hand" style={{ fontSize: 18, color: 'var(--ink-3)', marginBottom: 8 }}>What would you like to do?</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          {
            ico: '▶',
            title: 'Take the quiz now',
            sub: 'Jump in — your progress autosaves to this device.',
            primary: true,
          },
          {
            ico: '★',
            title: 'Bookmark for later',
            sub: 'Save to your library. Pick it up any time.',
          },
          {
            ico: '↻',
            title: 'Re-upload',
            sub: 'Replace this quizfetch with a different file.',
          },
        ].map((card) => (
          <div key={card.title} className="s-box" style={{
            padding: 14, textAlign: 'center', minHeight: 160,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            background: card.primary ? 'var(--accent-tint)' : 'var(--paper)',
            borderColor: card.primary ? 'var(--accent)' : 'var(--ink)',
            boxShadow: card.primary ? '4px 4px 0 var(--ink)' : '3px 3px 0 var(--ink)',
          }}>
            <div>
              <div style={{ fontSize: 30, fontFamily: 'Caveat, cursive', color: card.primary ? 'var(--accent)' : 'var(--ink)' }}>
                {card.ico}
              </div>
              <div className="s-hand" style={{ fontSize: 20, marginTop: 2 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{card.sub}</div>
            </div>
            <span className={card.primary ? 's-btn primary' : 's-btn'} style={{ justifyContent: 'center', marginTop: 10 }}>
              {card.primary ? 'Start →' : card.ico === '★' ? 'Bookmark' : 'Re-upload'}
            </span>
          </div>
        ))}
      </div>

      <div className="s-box dashed" style={{ padding: 10, marginTop: 14, background: 'var(--paper-2)', boxShadow: 'none' }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row><span style={{ fontSize: 16 }}>⬇</span><span style={{ fontSize: 14 }}>Also: <u>download as PDF</u> · <u>download as HTML</u> · <u>share link</u></span></Row>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>← Back to configure</span>
        </Row>
      </div>
    </div>
  </Screen>
);

const C4_Take = () => (
  <Screen w={C_W} h={C_H}>
    <C_TopBar />
    <Steps at={3} />
    <div style={{ padding: '14px 30px' }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <Row>
          <span className="s-pill">36/90 answered</span>
          <span className="s-pill accent">★ 3 bookmarked</span>
        </Row>
        <Row><input className="s-input" placeholder="🔍 search" style={{ width: 140, padding: '3px 8px', fontSize: 13 }} /><span className="s-btn sm primary">Submit →</span></Row>
      </Row>
      <div className="s-progress" style={{ marginBottom: 12 }}><i style={{ width: '40%' }} /></div>

      <QuestionCardCompact n={1} prompt='Which branch asks "What makes reasoning valid?"' choices={['Aesthetics','Logic','Ethics','Epistemology']} picked={1} mode="neutral" />
      <QuestionCardCompact n={2} prompt='The branch of philosophy that studies correct reasoning…' choices={['Epistemology','Ethics','Logic','Aesthetics']} picked={2} mode="neutral" />
      <QuestionCardCompact n={3} prompt='Identifying fallacies in arguments belongs to:' choices={['Epistemology','Logic','Ethics','Aesthetics']} picked={null} mode="neutral" />
      <QuestionCardCompact n={4} prompt='The question "Does God exist?" belongs to:' choices={['Metaphysics','Logic','Aesthetics','Epistemology']} picked={null} mode="neutral" />
    </div>
  </Screen>
);

const C5_Done = () => (
  <Screen w={C_W} h={C_H}>
    <C_TopBar />
    <Steps at={4} />
    <div style={{ padding: '22px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ paddingTop: 6 }}>
        <div className="s-hand" style={{ fontSize: 32, lineHeight: 1 }}>You did it!</div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 4 }}>
          76 out of 90 — <b className="s-squig">84.4%</b>
        </div>

        <div className="s-progress" style={{ marginTop: 12, height: 14 }}><i style={{ width: '84.4%' }} /></div>

        <div style={{ marginTop: 16 }}>
          <div className="s-hand" style={{ fontSize: 18, marginBottom: 6 }}>What next?</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="s-btn lg" style={{ justifyContent: 'flex-start' }}>⬇  Download as PDF / HTML</span>
            <span className="s-btn lg" style={{ justifyContent: 'flex-start' }}>★  Bookmark this quiz</span>
            <span className="s-btn lg" style={{ justifyContent: 'flex-start' }}>↻  Retake the full quiz</span>
            <span className="s-btn lg" style={{ justifyContent: 'flex-start' }}>✗  Retake only wrong answers (14)</span>
            <span className="s-btn lg primary" style={{ justifyContent: 'flex-start' }}>+  Upload another quizfetch</span>
          </div>
        </div>
      </div>

      <div className="s-box" style={{ padding: 12 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="s-hand" style={{ fontSize: 18 }}>Breakdown</div>
          <Row>
            <span className="s-pill ok">76 right</span>
            <span className="s-pill bad">14 wrong</span>
          </Row>
        </Row>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {Array.from({ length: 90 }).map((_, i) => {
            const wrong = [4, 9, 11, 18, 22, 27, 33, 41, 47, 52, 60, 68, 71, 83].includes(i);
            return (
              <span key={i} style={{
                width: 16, height: 16, fontSize: 9, display: 'grid', placeItems: 'center',
                border: '1.2px solid var(--ink)', borderRadius: 3,
                background: wrong ? 'var(--bad-soft)' : 'var(--ok-soft)',
                color: wrong ? 'var(--bad)' : 'var(--ok)',
              }}>{wrong ? '✗' : '✓'}</span>
            );
          })}
        </div>
        <hr className="s-rule soft" />
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Tap any to jump back & review.</div>
        <hr className="s-rule soft" />
        <div className="s-hand" style={{ fontSize: 16, marginBottom: 4 }}>Hardest by topic</div>
        <div style={{ fontSize: 13 }}>Aesthetics  · 3 wrong</div>
        <div style={{ fontSize: 13 }}>Metaphysics · 5 wrong</div>
        <div style={{ fontSize: 13 }}>Logic       · 2 wrong</div>
      </div>
    </div>
  </Screen>
);

window.ApproachC = function ApproachC() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <div>
        <ScreenCaption idx="C1" label="Upload" note="step 1 of 4" />
        <C1_Upload />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="C2" label="Configure" note="modes & feedback" />
        <C2_Configure />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="C3" label="Quiz ready" note="take · bookmark · re-upload" />
        <C3_Ready />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="C4" label="Take quiz" />
        <C4_Take />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="C5" label="Done — what next?" note="prominent actions" />
        <C5_Done />
      </div>
    </div>
  );
};
