/* global React, Logo, Avatar, Row, Screen, DropZone, QuestionCardCompact, ScreenCaption, FlowArrow */

// ═══════════════════════════════════════════════════════════════════
// APPROACH B — "Library Sidebar" (Claude-style)
// Left rail with saved quizzes (chat-list feel). Main area is the
// currently-active quiz. One-question-at-a-time focused mode.
// ═══════════════════════════════════════════════════════════════════

const B_W = 820, B_H = 540;

const B_Sidebar = ({ active = 1 }) => {
  const quizzes = [
    ['Philosophy S1', '84%', true],
    ['Bio Cell Midterm', '—', false],
    ['Econ 101 Quiz 3', '92%', false],
    ['Linear Algebra W6', '67%', false],
    ['World History Q2', '—', false],
  ];
  return (
    <div style={{
      width: 200, borderRight: '1.5px dashed var(--rule-soft)',
      background: 'var(--paper-2)', padding: 12, fontSize: 14,
      display: 'flex', flexDirection: 'column', gap: 8, height: '100%',
    }}>
      <Logo size={20} />
      <span className="s-btn primary" style={{ justifyContent: 'center', marginTop: 4 }}>+ New quiz</span>
      <div className="s-hand" style={{ fontSize: 17, color: 'var(--ink-3)', marginTop: 4 }}>Your library</div>
      {quizzes.map(([name, score, isActive], i) => (
        <div key={i} className={i === active ? 's-box' : ''} style={{
          padding: '6px 8px', borderRadius: 8,
          background: i === active ? 'var(--paper)' : 'transparent',
          border: i === active ? '2px solid var(--ink)' : '2px solid transparent',
          boxShadow: i === active ? '2px 2px 0 var(--ink)' : 'none',
          cursor: 'pointer',
        }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {i === 1 ? '★ ' : ''}{name}
            </span>
            <span style={{ fontSize: 12, color: score === '—' ? 'var(--ink-3)' : 'var(--ok)' }}>{score}</span>
          </Row>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <hr className="s-rule soft" />
      <Row style={{ justifyContent: 'space-between' }}>
        <Row><Avatar initials="NK" size={24} /><span style={{ fontSize: 13 }}>Naomi K.</span></Row>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>⚙</span>
      </Row>
    </div>
  );
};

const B1_Empty = () => (
  <Screen w={B_W} h={B_H}>
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
      <B_Sidebar active={-1} />
      <div style={{ padding: '40px 60px' }}>
        <div className="s-hand" style={{ fontSize: 36, textAlign: 'center' }}>
          What are we <span className="s-squig">quizzing</span> today, Naomi?
        </div>
        <div style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: 14, marginBottom: 18, marginTop: 4 }}>
          Drop a quizfetch HTML file to start.
        </div>
        <DropZone tall />
        <div style={{ marginTop: 18 }}>
          <div className="s-hand" style={{ fontSize: 17, color: 'var(--ink-3)', marginBottom: 4 }}>Pick up where you left off</div>
          {[
            ['Bio Cell Midterm', '40 q · 18% done · 3 days ago'],
            ['Econ 101 Quiz 3', '25 q · finished · 92%'],
          ].map(([t, sub]) => (
            <div key={t} className="s-box" style={{ padding: '6px 10px', marginBottom: 6, boxShadow: '2px 2px 0 var(--ink)' }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 15 }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{sub}</div>
                </div>
                <span className="s-btn sm">resume</span>
              </Row>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Screen>
);

const B_QHeader = () => (
  <Row style={{ justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1.5px dashed var(--rule-soft)' }}>
    <div>
      <div className="s-hand" style={{ fontSize: 19 }}>★ Bio Cell Midterm</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>40 questions · randomized · instant feedback</div>
    </div>
    <Row>
      <span className="s-btn sm">⬇ Download</span>
      <span className="s-btn sm">★ Bookmark</span>
      <span className="s-btn sm">+ New quizfetch</span>
    </Row>
  </Row>
);

const B2_Question = () => (
  <Screen w={B_W} h={B_H}>
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
      <B_Sidebar active={1} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <B_QHeader />
        <div style={{ padding: '20px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="s-pill">Question 7 / 40</span>
            <Row><span className="s-pill">★ bookmark</span><span className="s-pill accent">instant feedback</span></Row>
          </Row>
          <div className="s-progress" style={{ marginBottom: 14 }}><i style={{ width: '17%' }} /></div>

          <div style={{ fontFamily: 'Caveat, cursive', fontSize: 26, lineHeight: 1.2, marginBottom: 14 }}>
            Which organelle is responsible for <span className="s-squig">ATP synthesis</span>?
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'].map((c, i) => (
              <div key={i} className="s-box" style={{ padding: '8px 12px', boxShadow: '2px 2px 0 var(--ink)' }}>
                <Row><span className="s-radio" />{c}</Row>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />
          <Row style={{ justifyContent: 'space-between' }}>
            <span className="s-btn">← Previous</span>
            <Row>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>autosaved · 2s ago</span>
              <span className="s-btn primary">Next →</span>
            </Row>
          </Row>
        </div>
      </div>
    </div>
  </Screen>
);

const B3_Feedback = () => (
  <Screen w={B_W} h={B_H}>
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
      <B_Sidebar active={1} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <B_QHeader />
        <div style={{ padding: '20px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="s-pill">Question 7 / 40</span>
            <span className="s-pill bad">✗ not quite</span>
          </Row>
          <div className="s-progress" style={{ marginBottom: 14 }}><i style={{ width: '17%' }} /></div>

          <div style={{ fontFamily: 'Caveat, cursive', fontSize: 26, lineHeight: 1.2, marginBottom: 14 }}>
            Which organelle is responsible for ATP synthesis?
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {[
              ['Ribosome',           'none'],
              ['Mitochondrion',      'correct'],
              ['Golgi apparatus',    'picked'],
              ['Lysosome',           'none'],
            ].map(([c, s], i) => {
              const cls = s === 'correct' ? 's-box s-hatch-ok' : s === 'picked' ? 's-box s-hatch-bad' : 's-box';
              const bs = s === 'correct' || s === 'picked' ? '3px 3px 0 var(--ink)' : '2px 2px 0 var(--ink)';
              const bc = s === 'correct' ? 'var(--ok)' : s === 'picked' ? 'var(--bad)' : 'var(--ink)';
              return (
                <div key={i} className={cls} style={{ padding: '8px 12px', boxShadow: bs, borderColor: bc }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row>
                      <span className={`s-radio ${s==='correct'?'on-ok':s==='picked'?'on-bad':''}`} />
                      {c}
                    </Row>
                    {s === 'correct' && <span style={{ fontSize: 13, color: 'var(--ok)' }}>✓ correct answer</span>}
                    {s === 'picked' && <span style={{ fontSize: 13, color: 'var(--bad)' }}>your answer</span>}
                  </Row>
                </div>
              );
            })}
          </div>

          <div className="s-box" style={{ padding: '8px 12px', marginTop: 12, background: 'var(--paper-2)', boxShadow: 'none', borderStyle: 'dashed' }}>
            <span className="s-hand" style={{ fontSize: 16, color: 'var(--accent)' }}>Note · </span>
            <span style={{ fontSize: 14 }}>Mitochondria are the "powerhouses" — they generate ATP via oxidative phosphorylation.</span>
          </div>

          <div style={{ flex: 1 }} />
          <Row style={{ justifyContent: 'space-between' }}>
            <span className="s-btn">← Previous</span>
            <Row>
              <span className="s-btn">★ bookmark this one</span>
              <span className="s-btn primary">Next question →</span>
            </Row>
          </Row>
        </div>
      </div>
    </div>
  </Screen>
);

const B4_Library = () => (
  <Screen w={B_W} h={B_H}>
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
      <B_Sidebar active={-1} />
      <div style={{ padding: '18px 30px', overflow: 'hidden' }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="s-hand" style={{ fontSize: 26 }}>Library</div>
          <Row>
            <input className="s-input" placeholder="🔍 search…" style={{ width: 180, padding: '4px 8px' }} />
            <span className="s-btn sm">filter ▾</span>
          </Row>
        </Row>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Philosophy S1', '90 q · 84%', 'finished · 2d ago', true],
            ['Bio Cell Midterm', '40 q · 18%', 'in progress', true],
            ['Econ 101 Quiz 3', '25 q · 92%', 'finished · 1w ago', false],
            ['Linear Algebra W6', '30 q · 67%', 'finished · 2w ago', false],
            ['World History Q2', '50 q · —', 'not started', false],
            ['+ Drop new quizfetch', '', '', false],
          ].map(([name, sub, status, fav], i) => (
            <div key={i} className="s-box" style={{
              padding: 10, boxShadow: '2px 2px 0 var(--ink)',
              borderStyle: i === 5 ? 'dashed' : 'solid',
              background: i === 5 ? 'var(--paper-2)' : 'var(--paper)',
              minHeight: 70,
            }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'Caveat, cursive', fontSize: 20, lineHeight: 1 }}>
                  {fav ? '★ ' : ''}{name}
                </div>
                {i !== 5 && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>⋯</span>}
              </Row>
              {sub && <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{sub}</div>}
              {status && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{status}</div>}
              {i === 1 && <div className="s-progress" style={{ marginTop: 6 }}><i style={{ width: '18%' }} /></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  </Screen>
);

window.ApproachB = function ApproachB() {
  const { Bx_Preview, Bx_Ready } = window;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <div>
        <ScreenCaption idx="B1" label="Empty state" note="upload or resume" />
        <B1_Empty />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="B2" label="Preview & configure" note="parsed Qs + options" />
        <Bx_Preview />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="B3" label="Quiz ready" note="take · bookmark · re-upload" />
        <Bx_Ready />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="B4" label="Take quiz" note="one question at a time" />
        <B2_Question />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="B5" label="Instant feedback" note="wrong answer revealed" />
        <B3_Feedback />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="B6" label="Library" note="all saved quizzes" />
        <B4_Library />
      </div>
    </div>
  );
};
