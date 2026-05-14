/* global React, Logo, Avatar, Row, Screen, DropZone, ScreenCaption, FlowArrow */

// ═══════════════════════════════════════════════════════════════════
// APPROACH D — "Pocket Stack" (mobile-feel, single-question focus)
// Tall narrow frames. Each question is a full card you swipe through.
// Big touch targets. Account/login is part of the flow.
// ═══════════════════════════════════════════════════════════════════

const D_W = 320, D_H = 580;

const D_StatusBar = () => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 14px', fontSize: 11, color: 'var(--ink-2)',
    borderBottom: '1px dashed var(--rule-soft)',
  }}>
    <span style={{ fontFamily: 'Caveat, cursive', fontSize: 14 }}>9:41</span>
    <span>● ● ●</span>
  </div>
);

const D_PhoneFrame = ({ children }) => (
  <Screen w={D_W} h={D_H}>
    <D_StatusBar />
    {children}
  </Screen>
);

const D1_Account = () => (
  <D_PhoneFrame>
    <div style={{ padding: '26px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <Logo size={28} />
      </div>
      <div className="s-hand" style={{ fontSize: 28, textAlign: 'center', lineHeight: 1.05 }}>
        Save quizzes, <br /><span className="s-squig">across devices.</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 4, marginBottom: 16 }}>
        Optional — you can also use QuizGive locally.
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <span className="s-btn lg" style={{ justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--ink)"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5a3.5 3.5 0 0 1 3.7-3.8c1 0 2.1.2 2.1.2v2.4h-1.2c-1.2 0-1.5.7-1.5 1.4V12h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12z"/></svg>
          Continue with Google
        </span>
        <span className="s-btn lg" style={{ justifyContent: 'center' }}>Continue with email</span>
      </div>

      <div style={{ textAlign: 'center', margin: '14px 0 10px', fontSize: 12, color: 'var(--ink-3)' }}>— or —</div>
      <div className="s-box dashed" style={{ padding: 10, textAlign: 'center', boxShadow: 'none', background: 'var(--paper-2)' }}>
        <div className="s-hand" style={{ fontSize: 18 }}>Skip & use locally</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>quizzes save to this device only</div>
      </div>

      <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--ink-3)' }}>
        By continuing you agree to the <u>Terms</u>.
      </div>
    </div>
  </D_PhoneFrame>
);

const D2_Home = () => (
  <D_PhoneFrame>
    <Row style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
      <Logo size={18} />
      <Avatar size={26} />
    </Row>
    <div style={{ padding: '6px 18px' }}>
      <div className="s-hand" style={{ fontSize: 24, lineHeight: 1.1 }}>
        Hey Naomi —<br />make a <span className="s-squig">new quiz</span>?
      </div>

      <div style={{ marginTop: 12 }}>
        <DropZone hint="Drop quizfetch HTML" />
      </div>

      <div className="s-hand" style={{ fontSize: 18, marginTop: 14, color: 'var(--ink-3)' }}>Library</div>
      {[
        ['Philosophy S1', '84% · 2d ago', true],
        ['Bio Cell Midterm', '18% · in progress', true],
        ['Econ 101 Quiz 3', '92% · 1w ago', false],
        ['Linear Algebra W6', '67% · 2w ago', false],
      ].map(([name, sub, fav], i) => (
        <div key={i} className="s-box" style={{ padding: '6px 10px', marginBottom: 6, boxShadow: '2px 2px 0 var(--ink)' }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14 }}>{fav ? '★ ' : ''}{name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>
            </div>
            <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>›</span>
          </Row>
        </div>
      ))}
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 14px', borderTop: '1.5px dashed var(--rule-soft)', display: 'flex', justifyContent: 'space-around', fontSize: 12 }}>
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>⌂ Home</span>
      <span style={{ color: 'var(--ink-3)' }}>★ Saved</span>
      <span style={{ color: 'var(--ink-3)' }}>⚙ Settings</span>
    </div>
  </D_PhoneFrame>
);

const D3_Question = () => (
  <D_PhoneFrame>
    <Row style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>← exit</span>
      <span className="s-pill">7 / 40</span>
      <span style={{ fontSize: 16 }}>★</span>
    </Row>
    <div style={{ padding: '0 14px' }}>
      <div className="s-progress" style={{ marginBottom: 16 }}><i style={{ width: '17%' }} /></div>

      <div className="s-box" style={{ padding: 14, boxShadow: '4px 4px 0 var(--ink)' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Question 7</div>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 22, lineHeight: 1.15, marginTop: 4, marginBottom: 12 }}>
          Which organelle is responsible for ATP synthesis?
        </div>

        <div style={{ display: 'grid', gap: 7 }}>
          {['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'].map((c, i) => (
            <div key={c} className="s-box" style={{
              padding: '8px 10px',
              boxShadow: i === 1 ? '2px 2px 0 var(--accent)' : '2px 2px 0 var(--ink)',
              borderColor: i === 1 ? 'var(--accent)' : 'var(--ink)',
              background: i === 1 ? 'var(--accent-tint)' : 'var(--paper)',
            }}>
              <Row><span className={`s-radio ${i === 1 ? 'on' : ''}`} />{c}</Row>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, padding: '0 14px', display: 'flex', gap: 8 }}>
      <span className="s-btn lg" style={{ flex: 1, justifyContent: 'center' }}>←</span>
      <span className="s-btn lg primary" style={{ flex: 3, justifyContent: 'center' }}>Submit answer</span>
    </div>
  </D_PhoneFrame>
);

const D4_Wrong = () => (
  <D_PhoneFrame>
    <Row style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>← exit</span>
      <span className="s-pill bad">✗ not quite</span>
      <span style={{ fontSize: 16 }}>★</span>
    </Row>
    <div style={{ padding: '0 14px' }}>
      <div className="s-progress" style={{ marginBottom: 12 }}><i style={{ width: '17%' }} /></div>

      <div className="s-box" style={{ padding: 12, boxShadow: '4px 4px 0 var(--ink)' }}>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 20, lineHeight: 1.15, marginBottom: 10 }}>
          Which organelle is responsible for ATP synthesis?
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {[
            ['Ribosome', 'none'],
            ['Mitochondrion', 'correct'],
            ['Golgi apparatus', 'picked'],
            ['Lysosome', 'none'],
          ].map(([c, s]) => {
            const cls = s === 'correct' ? 's-hatch-ok' : s === 'picked' ? 's-hatch-bad' : '';
            const bc = s === 'correct' ? 'var(--ok)' : s === 'picked' ? 'var(--bad)' : 'var(--rule-soft)';
            return (
              <div key={c} className={`s-box ${cls}`} style={{ padding: '7px 10px', borderColor: bc, boxShadow: '2px 2px 0 var(--ink)' }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row>
                    <span className={`s-radio ${s==='correct'?'on-ok':s==='picked'?'on-bad':''}`} />
                    <span style={{ fontSize: 14 }}>{c}</span>
                  </Row>
                  {s === 'correct' && <span style={{ fontSize: 11, color: 'var(--ok)' }}>✓ correct</span>}
                  {s === 'picked' && <span style={{ fontSize: 11, color: 'var(--bad)' }}>yours</span>}
                </Row>
              </div>
            );
          })}
        </div>
      </div>

      <div className="s-box dashed" style={{ padding: '8px 10px', marginTop: 8, boxShadow: 'none', background: 'var(--paper-2)' }}>
        <span className="s-hand" style={{ fontSize: 15, color: 'var(--accent)' }}>tip · </span>
        <span style={{ fontSize: 13 }}>Mitochondria generate ATP via oxidative phosphorylation.</span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, padding: '0 14px', display: 'flex', gap: 8 }}>
      <span className="s-btn lg" style={{ flex: 1, justifyContent: 'center' }}>★</span>
      <span className="s-btn lg primary" style={{ flex: 3, justifyContent: 'center' }}>Next →</span>
    </div>
  </D_PhoneFrame>
);

const D5_Done = () => (
  <D_PhoneFrame>
    <Row style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>← library</span>
      <span style={{ fontSize: 16 }}>⋯</span>
    </Row>
    <div style={{ padding: '8px 18px', textAlign: 'center' }}>
      <div className="s-hand" style={{ fontSize: 30, lineHeight: 1 }}>🎉 done!</div>
      <svg width="170" height="170" viewBox="0 0 100 100" style={{ display: 'block', margin: '4px auto' }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rule-soft)" strokeWidth="8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="8"
          strokeDasharray="264" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="48" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="22" fill="var(--ink)">32/40</text>
        <text x="50" y="62" textAnchor="middle" fontSize="8" fill="var(--ink-3)">80% correct</text>
      </svg>

      <Row style={{ justifyContent: 'center', gap: 14, fontSize: 13, marginBottom: 14 }}>
        <span><b style={{ color: 'var(--ok)' }}>32</b> right</span>
        <span><b style={{ color: 'var(--bad)' }}>8</b> wrong</span>
        <span><b style={{ color: 'var(--accent)' }}>4</b> ★</span>
      </Row>

      <div style={{ display: 'grid', gap: 6, textAlign: 'left' }}>
        <span className="s-btn" style={{ justifyContent: 'flex-start' }}>↻  Retake quiz</span>
        <span className="s-btn" style={{ justifyContent: 'flex-start' }}>✗  Only wrong (8)</span>
        <span className="s-btn" style={{ justifyContent: 'flex-start' }}>★  Save to library</span>
        <span className="s-btn" style={{ justifyContent: 'flex-start' }}>⬇  Download results</span>
        <span className="s-btn primary" style={{ justifyContent: 'flex-start' }}>+  Upload another quizfetch</span>
      </div>
    </div>
  </D_PhoneFrame>
);

window.ApproachD = function ApproachD() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <div>
        <ScreenCaption idx="D1" label="Sign in" note="optional · local-first" />
        <D1_Account />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="D2" label="Home" note="upload + library" />
        <D2_Home />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="D3" label="Question card" note="one at a time" />
        <D3_Question />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="D4" label="Wrong answer" note="reveal correct" />
        <D4_Wrong />
      </div>
      <FlowArrow />
      <div>
        <ScreenCaption idx="D5" label="Results" note="bookmark · retake · new" />
        <D5_Done />
      </div>
    </div>
  );
};
