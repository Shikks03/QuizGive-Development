/* global React, Logo, Avatar, Row, Screen, DropZone, QuestionCardCompact, ScreenCaption, FlowArrow */

// ═══════════════════════════════════════════════════════════════════
// APPROACH B — extras: parsed-preview screen + "ready" decision screen
// plus a full phone version of the whole flow.
// ═══════════════════════════════════════════════════════════════════

const Bx_W = 820, Bx_H = 540;

// reuse the sidebar from approach-b.jsx (defined there but scoped locally),
// so we redeclare a slim version here that matches.
const Bx_Sidebar = ({ active = -1, ghost = false }) => {
  const quizzes = [
    ['Philosophy S1', '84%', false],
    ['Bio Cell Midterm', ghost ? 'parsing…' : '—', true],
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
      {quizzes.map(([name, score, isNew], i) => (
        <div key={i} style={{
          padding: '6px 8px', borderRadius: 8,
          background: i === active ? 'var(--paper)' : 'transparent',
          border: i === active ? '2px solid var(--ink)' : '2px solid transparent',
          boxShadow: i === active ? '2px 2px 0 var(--ink)' : 'none',
        }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: isNew && ghost ? 'italic' : 'normal' }}>
              {isNew && ghost && '○ '}{name}
            </span>
            <span style={{ fontSize: 12, color: score === '—' || score === 'parsing…' ? 'var(--ink-3)' : 'var(--ok)' }}>{score}</span>
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

// ─── Bx1 · Parsed preview & configure (A2 inside B's sidebar) ──────
const Bx_Preview = () => (
  <Screen w={Bx_W} h={Bx_H}>
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
      <Bx_Sidebar active={1} ghost />
      <div style={{ padding: '14px 24px', overflow: 'hidden' }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="s-hand" style={{ fontSize: 22 }}>Bio Cell Midterm</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>BIO2526_CELL_2N12 · just uploaded</div>
          </div>
          <Row><span className="s-btn sm">↻ Re-upload</span></Row>
        </Row>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="s-box" style={{ padding: 10 }}>
            <div className="s-hand" style={{ fontSize: 17, marginBottom: 6 }}>Quiz options</div>
            <Row style={{ marginBottom: 4 }}><span className="s-check on" /> Randomize question order</Row>
            <Row style={{ marginBottom: 4 }}><span className="s-check on" /> Randomize choice order</Row>
            <Row style={{ marginBottom: 4 }}><span className="s-check" /> Timed (40 min)</Row>
            <Row><span className="s-check on" /> Save progress to library</Row>
            <hr className="s-rule soft" />
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>Layout</div>
            <Row><span className="s-radio" /> All questions, one page</Row>
            <Row><span className="s-radio on" /> One question at a time</Row>
            <hr className="s-rule soft" />
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>Feedback</div>
            <Row><span className="s-radio on" /> Instant (reveal on pick)</Row>
            <Row><span className="s-radio" /> After submit</Row>
          </div>
          <div className="s-box" style={{ padding: 10, overflow: 'hidden' }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="s-hand" style={{ fontSize: 17 }}>Parsed preview</div>
              <span className="s-pill ok">✓ 40/40 parsed</span>
            </Row>
            {[
              ['1', 'Which organelle is responsible for ATP synthesis?'],
              ['2', 'The cell membrane is primarily composed of…'],
              ['3', 'During mitosis, sister chromatids separate in…'],
              ['4', 'Which process produces 2 ATP per glucose…'],
              ['5', 'The Golgi apparatus is responsible for…'],
              ['6', 'Lysosomes contain enzymes that…'],
            ].map(([n, t]) => (
              <div key={n} style={{ fontSize: 13, padding: '3px 0', borderBottom: '1px dashed var(--rule-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ color: 'var(--ink-3)' }}>{n}.</span> {t}
              </div>
            ))}
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>… +34 more</div>
          </div>
        </div>

        <Row style={{ justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
          <span className="s-btn">Cancel</span>
          <span className="s-btn primary">✨ Generate quiz →</span>
        </Row>
      </div>
    </div>
  </Screen>
);

// ─── Bx2 · "What now?" decision (C3 inside B's sidebar) ────────────
const Bx_Ready = () => (
  <Screen w={Bx_W} h={Bx_H}>
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
      <Bx_Sidebar active={1} />
      <div style={{ padding: '24px 36px' }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div className="s-hand" style={{ fontSize: 24 }}>Your quiz is ready ✨</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              <b>Bio Cell Midterm</b> · 40 q · randomized · instant feedback
            </div>
          </div>
          <span className="s-pill ok">✓ saved to library</span>
        </Row>

        <div className="s-hand" style={{ fontSize: 17, color: 'var(--ink-3)', marginBottom: 8 }}>
          What would you like to do?
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { ico: '▶', title: 'Take it now', sub: 'Jump in. Progress autosaves as you go.', primary: true, cta: 'Start →' },
            { ico: '★', title: 'Bookmark for later', sub: 'Already in your library — pin to top.', cta: 'Pin' },
            { ico: '↻', title: 'Re-upload', sub: 'Replace with a different quizfetch file.', cta: 'Re-upload' },
          ].map((card) => (
            <div key={card.title} className="s-box" style={{
              padding: 14, minHeight: 170,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              background: card.primary ? 'var(--accent-tint)' : 'var(--paper)',
              borderColor: card.primary ? 'var(--accent)' : 'var(--ink)',
              boxShadow: card.primary ? '4px 4px 0 var(--ink)' : '3px 3px 0 var(--ink)',
            }}>
              <div>
                <div style={{ fontSize: 30, fontFamily: 'Caveat, cursive', color: card.primary ? 'var(--accent)' : 'var(--ink)' }}>
                  {card.ico}
                </div>
                <div className="s-hand" style={{ fontSize: 19, marginTop: 2 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{card.sub}</div>
              </div>
              <span className={card.primary ? 's-btn primary' : 's-btn'} style={{ justifyContent: 'center', marginTop: 10 }}>
                {card.cta}
              </span>
            </div>
          ))}
        </div>

        <div className="s-box dashed" style={{ padding: 10, marginTop: 14, background: 'var(--paper-2)', boxShadow: 'none' }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row><span style={{ fontSize: 16 }}>⬇</span><span style={{ fontSize: 14 }}>Also: <u>download PDF</u> · <u>download HTML</u> · <u>share link</u></span></Row>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>← Back to configure</span>
          </Row>
        </div>
      </div>
    </div>
  </Screen>
);

Object.assign(window, { Bx_Preview, Bx_Ready });

// ═══════════════════════════════════════════════════════════════════
// APPROACH B — PHONE flow
// Same IA (library + sidebar collapsed to drawer + same screens) but
// sized for a phone. Includes: home/library, upload, preview,
// ready/decision, question, instant feedback, results.
// ═══════════════════════════════════════════════════════════════════

const Bp_W = 320, Bp_H = 600;

const Bp_StatusBar = () => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 14px', fontSize: 11, color: 'var(--ink-2)',
    borderBottom: '1px dashed var(--rule-soft)',
  }}>
    <span style={{ fontFamily: 'Caveat, cursive', fontSize: 14 }}>9:41</span>
    <span>● ● ●</span>
  </div>
);

const Bp_Frame = ({ children }) => (
  <Screen w={Bp_W} h={Bp_H}>
    <Bp_StatusBar />
    {children}
  </Screen>
);

const Bp_TopNav = ({ title, sub, back = false, right = '★' }) => (
  <Row style={{ justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px dashed var(--rule-soft)' }}>
    <span style={{ fontSize: 16, width: 24 }}>{back ? '←' : '☰'}</span>
    <div style={{ textAlign: 'center', flex: 1, padding: '0 6px' }}>
      <div style={{ fontFamily: 'Caveat, cursive', fontSize: 17, lineHeight: 1 }}>{title}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{sub}</div>}
    </div>
    <span style={{ fontSize: 16, width: 24, textAlign: 'right' }}>{right}</span>
  </Row>
);

// 1 · Library (home) — sidebar collapsed into a list view
const Bp1_Library = () => (
  <Bp_Frame>
    <Row style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
      <Logo size={18} />
      <Avatar size={24} />
    </Row>
    <div style={{ padding: '4px 14px' }}>
      <div className="s-hand" style={{ fontSize: 22 }}>Your library</div>
      <Row style={{ marginTop: 6, gap: 6 }}>
        <input className="s-input" placeholder="🔍 search" style={{ padding: '4px 8px', fontSize: 13 }} />
      </Row>

      <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
        {[
          ['Philosophy S1', '90 q · 84% · 2d', true],
          ['Bio Cell Midterm', '40 q · 18% · in progress', true],
          ['Econ 101 Quiz 3', '25 q · 92% · 1w', false],
          ['Linear Algebra W6', '30 q · 67% · 2w', false],
          ['World History Q2', '50 q · not started', false],
        ].map(([name, sub, fav], i) => (
          <div key={i} className="s-box" style={{ padding: '6px 10px', boxShadow: '2px 2px 0 var(--ink)' }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14 }}>{fav ? '★ ' : ''}{name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>
              </div>
              <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>›</span>
            </Row>
            {i === 1 && <div className="s-progress" style={{ marginTop: 4, height: 6 }}><i style={{ width: '18%' }} /></div>}
          </div>
        ))}
      </div>
    </div>

    <div style={{ position: 'absolute', bottom: 60, left: 14, right: 14 }}>
      <span className="s-btn primary lg" style={{ width: '100%', justifyContent: 'center' }}>+ New quiz</span>
    </div>

    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 14px', borderTop: '1.5px dashed var(--rule-soft)', display: 'flex', justifyContent: 'space-around', fontSize: 12 }}>
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>📚 Library</span>
      <span style={{ color: 'var(--ink-3)' }}>★ Saved</span>
      <span style={{ color: 'var(--ink-3)' }}>⚙ Settings</span>
    </div>
  </Bp_Frame>
);

// 2 · Upload (after tapping + New quiz)
const Bp2_Upload = () => (
  <Bp_Frame>
    <Bp_TopNav title="New quiz" sub="upload your quizfetch" back right="" />
    <div style={{ padding: '14px 16px' }}>
      <div className="s-hand" style={{ fontSize: 22, textAlign: 'center', lineHeight: 1.05 }}>
        Drop a <span className="s-squig">quizfetch</span> file
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 2, marginBottom: 12 }}>
        Parsed on-device. Nothing leaves your phone.
      </div>
      <DropZone tall hint="Tap to pick file" />
      <div style={{ textAlign: 'center', margin: '10px 0', fontSize: 11, color: 'var(--ink-3)' }}>— or —</div>
      <span className="s-btn" style={{ width: '100%', justifyContent: 'center' }}>📋 Paste HTML</span>
    </div>
  </Bp_Frame>
);

// 3 · Preview & configure (A2-style, collapsed for phone)
const Bp3_Preview = () => (
  <Bp_Frame>
    <Bp_TopNav title="Bio Cell Midterm" sub="40 questions detected" back right="↻" />
    <div style={{ padding: '10px 14px', overflow: 'hidden' }}>
      <div className="s-pill ok" style={{ display: 'inline-flex' }}>✓ 40/40 parsed</div>

      <div className="s-box" style={{ padding: 10, marginTop: 8 }}>
        <div className="s-hand" style={{ fontSize: 16, marginBottom: 4 }}>Quiz options</div>
        <Row style={{ marginBottom: 3 }}><span className="s-check on" /><span style={{ fontSize: 13 }}>Randomize questions</span></Row>
        <Row style={{ marginBottom: 3 }}><span className="s-check on" /><span style={{ fontSize: 13 }}>Randomize choices</span></Row>
        <Row><span className="s-check" /><span style={{ fontSize: 13 }}>Timed (40 min)</span></Row>
        <hr className="s-rule soft" />
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 2 }}>Layout</div>
        <Row><span className="s-radio" /><span style={{ fontSize: 13 }}>All on one page</span></Row>
        <Row><span className="s-radio on" /><span style={{ fontSize: 13 }}>One question at a time</span></Row>
        <hr className="s-rule soft" />
        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 2 }}>Feedback</div>
        <Row><span className="s-radio on" /><span style={{ fontSize: 13 }}>Instant (on pick)</span></Row>
        <Row><span className="s-radio" /><span style={{ fontSize: 13 }}>After submit</span></Row>
      </div>

      <div className="s-box" style={{ padding: 8, marginTop: 8 }}>
        <div className="s-hand" style={{ fontSize: 15 }}>Preview</div>
        {[
          '1. Which organelle is responsible for ATP…',
          '2. The cell membrane is primarily…',
          '3. During mitosis, sister chromatids…',
        ].map((t) => (
          <div key={t} style={{ fontSize: 12, padding: '2px 0', borderBottom: '1px dashed var(--rule-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>… +37 more</div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 12, padding: '0 14px' }}>
      <span className="s-btn primary lg" style={{ width: '100%', justifyContent: 'center' }}>✨ Generate quiz</span>
    </div>
  </Bp_Frame>
);

// 4 · Ready (decision cards, stacked)
const Bp4_Ready = () => (
  <Bp_Frame>
    <Bp_TopNav title="Quiz ready ✨" sub="Bio Cell Midterm · 40 q" back right="" />
    <div style={{ padding: '12px 14px' }}>
      <span className="s-pill ok" style={{ display: 'inline-flex' }}>✓ saved to library</span>
      <div className="s-hand" style={{ fontSize: 16, color: 'var(--ink-3)', marginTop: 8, marginBottom: 6 }}>What's next?</div>

      {[
        { ico: '▶', t: 'Take it now', s: 'Progress autosaves as you go.', primary: true, cta: 'Start →' },
        { ico: '★', t: 'Bookmark for later', s: 'Already in library · pin to top.', cta: 'Pin' },
        { ico: '↻', t: 'Re-upload', s: 'Use a different quizfetch file.', cta: 'Re-upload' },
      ].map((card) => (
        <div key={card.t} className="s-box" style={{
          padding: '10px 12px', marginBottom: 8,
          background: card.primary ? 'var(--accent-tint)' : 'var(--paper)',
          borderColor: card.primary ? 'var(--accent)' : 'var(--ink)',
          boxShadow: card.primary ? '3px 3px 0 var(--ink)' : '2px 2px 0 var(--ink)',
        }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: 10 }}>
              <span style={{ fontSize: 24, fontFamily: 'Caveat, cursive', color: card.primary ? 'var(--accent)' : 'var(--ink)' }}>{card.ico}</span>
              <div>
                <div className="s-hand" style={{ fontSize: 17, lineHeight: 1 }}>{card.t}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-2)' }}>{card.s}</div>
              </div>
            </Row>
            <span className={card.primary ? 's-btn sm primary' : 's-btn sm'}>{card.cta}</span>
          </Row>
        </div>
      ))}

      <div className="s-box dashed" style={{ padding: 8, background: 'var(--paper-2)', boxShadow: 'none', textAlign: 'center', fontSize: 12 }}>
        ⬇ <u>Download PDF</u> · <u>HTML</u> · <u>Share</u>
      </div>
    </div>
  </Bp_Frame>
);

// 5 · Question (one at a time)
const Bp5_Question = () => (
  <Bp_Frame>
    <Row style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>← exit</span>
      <span className="s-pill">7 / 40</span>
      <span style={{ fontSize: 16 }}>★</span>
    </Row>
    <div style={{ padding: '4px 14px' }}>
      <div className="s-progress" style={{ marginBottom: 12 }}><i style={{ width: '17%' }} /></div>
      <div className="s-box" style={{ padding: 12, boxShadow: '4px 4px 0 var(--ink)' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Question 7</div>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 21, lineHeight: 1.15, marginTop: 4, marginBottom: 10 }}>
          Which organelle is responsible for <span className="s-squig">ATP synthesis</span>?
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'].map((c, i) => (
            <div key={c} className="s-box" style={{
              padding: '7px 10px',
              boxShadow: i === 1 ? '2px 2px 0 var(--accent)' : '2px 2px 0 var(--ink)',
              borderColor: i === 1 ? 'var(--accent)' : 'var(--ink)',
              background: i === 1 ? 'var(--accent-tint)' : 'var(--paper)',
            }}>
              <Row><span className={`s-radio ${i === 1 ? 'on' : ''}`} /><span style={{ fontSize: 14 }}>{c}</span></Row>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, padding: '0 14px', display: 'flex', gap: 8 }}>
      <span className="s-btn lg" style={{ flex: 1, justifyContent: 'center' }}>←</span>
      <span className="s-btn lg primary" style={{ flex: 3, justifyContent: 'center' }}>Submit answer</span>
    </div>
  </Bp_Frame>
);

// 6 · Instant feedback (wrong)
const Bp6_Feedback = () => (
  <Bp_Frame>
    <Row style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>← exit</span>
      <span className="s-pill bad">✗ not quite</span>
      <span style={{ fontSize: 16 }}>★</span>
    </Row>
    <div style={{ padding: '4px 14px' }}>
      <div className="s-progress" style={{ marginBottom: 10 }}><i style={{ width: '17%' }} /></div>
      <div className="s-box" style={{ padding: 10, boxShadow: '4px 4px 0 var(--ink)' }}>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 19, lineHeight: 1.15, marginBottom: 8 }}>
          Which organelle is responsible for ATP synthesis?
        </div>
        <div style={{ display: 'grid', gap: 5 }}>
          {[
            ['Ribosome', 'none'],
            ['Mitochondrion', 'correct'],
            ['Golgi apparatus', 'picked'],
            ['Lysosome', 'none'],
          ].map(([c, s]) => {
            const cls = s === 'correct' ? 's-hatch-ok' : s === 'picked' ? 's-hatch-bad' : '';
            const bc = s === 'correct' ? 'var(--ok)' : s === 'picked' ? 'var(--bad)' : 'var(--rule-soft)';
            return (
              <div key={c} className={`s-box ${cls}`} style={{ padding: '6px 9px', borderColor: bc, boxShadow: '2px 2px 0 var(--ink)' }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row>
                    <span className={`s-radio ${s==='correct'?'on-ok':s==='picked'?'on-bad':''}`} />
                    <span style={{ fontSize: 13 }}>{c}</span>
                  </Row>
                  {s === 'correct' && <span style={{ fontSize: 11, color: 'var(--ok)' }}>✓ correct</span>}
                  {s === 'picked' && <span style={{ fontSize: 11, color: 'var(--bad)' }}>yours</span>}
                </Row>
              </div>
            );
          })}
        </div>
      </div>
      <div className="s-box dashed" style={{ padding: '7px 10px', marginTop: 8, boxShadow: 'none', background: 'var(--paper-2)' }}>
        <span className="s-hand" style={{ fontSize: 14, color: 'var(--accent)' }}>note · </span>
        <span style={{ fontSize: 12 }}>Mitochondria generate ATP via oxidative phosphorylation.</span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, padding: '0 14px', display: 'flex', gap: 8 }}>
      <span className="s-btn lg" style={{ flex: 1, justifyContent: 'center' }}>★</span>
      <span className="s-btn lg primary" style={{ flex: 3, justifyContent: 'center' }}>Next →</span>
    </div>
  </Bp_Frame>
);

// 7 · Results
const Bp7_Results = () => (
  <Bp_Frame>
    <Bp_TopNav title="🎉 done!" sub="Bio Cell Midterm" back right="⋯" />
    <div style={{ padding: '6px 16px', textAlign: 'center' }}>
      <svg width="150" height="150" viewBox="0 0 100 100" style={{ display: 'block', margin: '4px auto' }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rule-soft)" strokeWidth="8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="8"
          strokeDasharray="264" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="48" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="22" fill="var(--ink)">32/40</text>
        <text x="50" y="62" textAnchor="middle" fontSize="8" fill="var(--ink-3)">80% correct</text>
      </svg>
      <Row style={{ justifyContent: 'center', gap: 12, fontSize: 13, marginBottom: 10 }}>
        <span><b style={{ color: 'var(--ok)' }}>32</b> right</span>
        <span><b style={{ color: 'var(--bad)' }}>8</b> wrong</span>
        <span><b style={{ color: 'var(--accent)' }}>4</b> ★</span>
      </Row>

      <div style={{ display: 'grid', gap: 6, textAlign: 'left' }}>
        <span className="s-btn" style={{ justifyContent: 'flex-start' }}>↻  Retake quiz</span>
        <span className="s-btn" style={{ justifyContent: 'flex-start' }}>✗  Only wrong (8)</span>
        <span className="s-btn" style={{ justifyContent: 'flex-start' }}>⬇  Download results</span>
        <span className="s-btn primary" style={{ justifyContent: 'flex-start' }}>+  Upload another</span>
      </div>
    </div>
  </Bp_Frame>
);

window.ApproachB_Phone = function ApproachB_Phone() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      {[
        ['B·m1', 'Library', 'home', Bp1_Library],
        ['B·m2', 'Upload', 'pick file', Bp2_Upload],
        ['B·m3', 'Preview & configure', 'parsed Qs + options', Bp3_Preview],
        ['B·m4', 'Quiz ready', 'take · bookmark · re-upload', Bp4_Ready],
        ['B·m5', 'Question', 'one at a time', Bp5_Question],
        ['B·m6', 'Instant feedback', 'wrong revealed', Bp6_Feedback],
        ['B·m7', 'Results', 'retake · download', Bp7_Results],
      ].map(([idx, label, note, Comp], i, arr) => (
        <React.Fragment key={idx}>
          <div>
            <ScreenCaption idx={idx} label={label} note={note} />
            <Comp />
          </div>
          {i < arr.length - 1 && <FlowArrow />}
        </React.Fragment>
      ))}
    </div>
  );
};
