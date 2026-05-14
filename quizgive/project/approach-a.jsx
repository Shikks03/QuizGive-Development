/* global React, Logo, Avatar, Row, Screen, DropZone, QuestionCardCompact */

// ═══════════════════════════════════════════════════════════════════
// APPROACH A — "Hero Drop"
// Landing page does all the heavy lifting; library is a row underneath.
// Quiz takes whole page, scrollable, all-questions-on-one-page mode.
// ═══════════════════════════════════════════════════════════════════

const A_W = 760, A_H = 540;

const A_TopBar = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1.5px dashed var(--rule-soft)' }}>
    <Logo size={22} />
    <Row style={{ gap: 12 }}>
      <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Library</span>
      <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Help</span>
      <Avatar />
    </Row>
  </div>
);

const A1_Landing = () => (
  <Screen w={A_W} h={A_H}>
    <A_TopBar />
    <div style={{ padding: '28px 60px' }}>
      <div style={{ fontFamily: 'Caveat, cursive', fontSize: 44, lineHeight: 1, textAlign: 'center', marginBottom: 6 }}>
        Turn a quizfetch into a <span className="s-squig">real quiz</span>.
      </div>
      <div style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: 15, marginBottom: 18 }}>
        Drop the answer-key HTML — we'll wipe the answers and let you take it fresh.
      </div>
      <DropZone tall />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
        <span className="s-btn primary lg">✨ Generate quiz</span>
        <span className="s-btn lg">Paste HTML</span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 60px 12px', borderTop: '1.5px dashed var(--rule-soft)' }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Recent · <u>Philosophy S1</u> · <u>Bio Midterm</u> · <u>+3 more</u></span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Saved locally · no upload to server</span>
      </Row>
    </div>
  </Screen>
);

const A2_Preview = () => (
  <Screen w={A_W} h={A_H}>
    <A_TopBar />
    <div style={{ padding: '14px 30px' }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'Caveat, cursive', fontSize: 26 }}>Summative Assessment 1</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>STSY2526_GEO0871_1N34-10 · 90 questions detected</div>
        </div>
        <Row>
          <span className="s-btn">↻ Re-upload</span>
          <span className="s-btn primary">Generate quiz →</span>
        </Row>
      </Row>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="s-box" style={{ padding: 10 }}>
          <div className="s-hand" style={{ fontSize: 18, marginBottom: 6 }}>Quiz options</div>
          <Row style={{ marginBottom: 4 }}><span className="s-check on" /> Randomize question order</Row>
          <Row style={{ marginBottom: 4 }}><span className="s-check on" /> Randomize choice order</Row>
          <Row style={{ marginBottom: 4 }}><span className="s-check" /> Timed (90 min)</Row>
          <hr className="s-rule soft" />
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>Layout</div>
          <Row><span className="s-radio on" /> All questions, one page</Row>
          <Row><span className="s-radio" /> One question at a time</Row>
          <hr className="s-rule soft" />
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>Feedback</div>
          <Row><span className="s-radio" /> Instant (reveal on pick)</Row>
          <Row><span className="s-radio on" /> After submit</Row>
        </div>
        <div className="s-box" style={{ padding: 10, overflow: 'hidden' }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="s-hand" style={{ fontSize: 18 }}>Parsed preview</div>
            <span className="s-pill ok">✓ 90/90 parsed</span>
          </Row>
          {[
            ['1', 'Which branch asks "What makes reasoning valid?"'],
            ['2', 'The branch of philosophy that studies correct reasoning…'],
            ['3', 'Identifying fallacies in arguments belongs to:'],
            ['4', 'The question "Does God exist?" belongs to:'],
            ['5', 'Aesthetics is concerned with…'],
          ].map(([n, t]) => (
            <div key={n} style={{ fontSize: 13, padding: '3px 0', borderBottom: '1px dashed var(--rule-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ color: 'var(--ink-3)' }}>{n}.</span> {t}
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>… +85 more</div>
        </div>
      </div>
    </div>
  </Screen>
);

const A3_Taking = () => (
  <Screen w={A_W} h={A_H}>
    <A_TopBar />
    <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', height: A_H - 46 }}>
      <div style={{ borderRight: '1.5px dashed var(--rule-soft)', padding: 12 }}>
        <div className="s-hand" style={{ fontSize: 18, marginBottom: 6 }}>Progress</div>
        <div className="s-progress" style={{ marginBottom: 6 }}><i style={{ width: '40%' }} /></div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>36 of 90 answered</div>
        <input className="s-input" placeholder="🔍 search questions…" style={{ fontSize: 13, padding: '4px 8px' }} />
        <hr className="s-rule soft" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({length: 30}).map((_,i) => (
            <span key={i} style={{
              width: 18, height: 18, fontSize: 10, display: 'grid', placeItems: 'center',
              border: '1.5px solid var(--ink)', borderRadius: 4,
              background: i < 12 ? 'var(--accent-tint)' : (i === 14 ? 'var(--paper-2)' : 'var(--paper)'),
              color: i < 12 ? 'var(--accent)' : 'var(--ink-3)',
            }}>{i+1}</span>
          ))}
        </div>
        <hr className="s-rule soft" />
        <Row><span className="s-pill accent">★ 3 bookmarked</span></Row>
      </div>
      <div style={{ padding: 14, overflow: 'hidden' }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="s-hand" style={{ fontSize: 20 }}>Summative Assessment 1</div>
          <Row><span className="s-btn sm">★ bookmark</span><span className="s-btn sm primary">Submit quiz</span></Row>
        </Row>
        <QuestionCardCompact n={1} prompt='Which branch asks "What makes reasoning valid?"' choices={['Aesthetics','Logic','Ethics','Epistemology']} picked={1} mode="neutral" />
        <QuestionCardCompact n={2} prompt="The branch of philosophy that studies correct reasoning…" choices={['Epistemology','Ethics','Logic','Aesthetics']} picked={0} mode="neutral" />
        <QuestionCardCompact n={3} prompt="Identifying fallacies in arguments belongs to:" choices={['Epistemology','Logic','Ethics','Aesthetics']} picked={null} mode="neutral" />
      </div>
    </div>
  </Screen>
);

const A4_Results = () => (
  <Screen w={A_W} h={A_H}>
    <A_TopBar />
    <div style={{ padding: '18px 30px' }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div className="s-hand" style={{ fontSize: 26 }}>Nice work!</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Summative Assessment 1 · 12 min</div>
        </div>
        <Row>
          <span className="s-btn">⬇ Download</span>
          <span className="s-btn">★ Bookmark</span>
          <span className="s-btn">↻ Retake</span>
          <span className="s-btn primary">+ New quizfetch</span>
        </Row>
      </Row>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14 }}>
        <div className="s-box" style={{ padding: 16, textAlign: 'center' }}>
          <svg width="140" height="140" viewBox="0 0 100 100" style={{ display: 'block', margin: '4px auto 0' }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rule-soft)" strokeWidth="9" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="9"
              strokeDasharray="264" strokeDashoffset="42" strokeLinecap="round" transform="rotate(-90 50 50)" />
            <text x="50" y="48" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="22" fill="var(--ink)">76/90</text>
            <text x="50" y="64" textAnchor="middle" fontSize="9" fill="var(--ink-3)">84.4% correct</text>
          </svg>
          <Row style={{ justifyContent: 'space-around', marginTop: 6, fontSize: 13 }}>
            <span><b style={{ color: 'var(--ok)' }}>76</b> right</span>
            <span><b style={{ color: 'var(--bad)' }}>14</b> wrong</span>
          </Row>
        </div>

        <div className="s-box" style={{ padding: 10 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <div className="s-hand" style={{ fontSize: 18 }}>Review your mistakes</div>
            <Row>
              <span className="s-pill ok">all</span>
              <span className="s-pill bad">wrong only</span>
              <span className="s-pill accent">★ bookmarked</span>
            </Row>
          </Row>
          <QuestionCardCompact n={7} prompt='What study deals with "what is beauty?"' choices={['Logic','Aesthetics','Ethics','Metaphysics']} picked={2} correct={1} mode="wrong" />
          <QuestionCardCompact n={12} prompt='Existence of God is a question of…' choices={['Logic','Ethics','Metaphysics','Aesthetics']} picked={1} correct={2} mode="wrong" />
        </div>
      </div>
    </div>
  </Screen>
);

window.ApproachA = function ApproachA() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <div>
        <ScreenCaption idx="A1" label="Landing" note="hero drop zone" />
        <A1_Landing />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="A2" label="Preview & configure" />
        <A2_Preview />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="A3" label="Take quiz" note="all on one page" />
        <A3_Taking />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="A4" label="Results" note="review wrong answers" />
        <A4_Results />
      </div>
    </div>
  );
};
