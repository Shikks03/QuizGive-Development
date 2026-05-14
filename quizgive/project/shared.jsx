/* global React */
// ─── shared bits used across approaches ────────────────────────────

const Logo = ({ size = 24 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: size, color: 'var(--ink)' }}>
    <svg width={size * 1.05} height={size * 1.05} viewBox="0 0 32 32" style={{ overflow: 'visible' }}>
      <path d="M5 8 Q5 5 8 5 L22 5 Q26 5 26 9 L26 21 Q26 25 22 25 L13 25 L7 28 L8 24 Q5 23 5 20 Z"
        fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M11 13 q3 -3 6 0 t6 0" fill="none" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="22" cy="18" r="1.6" fill="var(--paper)"/>
    </svg>
    QuizGive
  </span>
);

const Avatar = ({ initials = 'NK', size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: '2px solid var(--ink)', background: 'var(--accent-tint)',
    display: 'grid', placeItems: 'center', fontSize: 13, color: 'var(--ink)',
    fontFamily: 'Patrick Hand, cursive',
    boxShadow: '2px 2px 0 var(--ink)',
  }}>{initials}</div>
);

// quick row used in lists
const Row = ({ children, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>{children}</div>
);

// section label inside an artboard (above each "screen")
const ScreenCaption = ({ idx, label, note }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
    <span style={{
      fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: 22, color: 'var(--accent)',
    }}>{idx}.</span>
    <span style={{ fontFamily: 'Caveat, cursive', fontSize: 20, color: 'var(--ink)' }}>{label}</span>
    {note && <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>· {note}</span>}
  </div>
);

// "frame" — a soft sketchy outer container per screen
const Screen = ({ children, w, h, style }) => (
  <div style={{
    width: w, height: h, background: 'var(--paper)',
    border: '2px solid var(--ink)', borderRadius: 14,
    boxShadow: 'var(--shadow)',
    overflow: 'hidden', position: 'relative',
    ...style,
  }}>{children}</div>
);

// little arrow used between flow screens
const FlowArrow = () => (
  <svg width="36" height="22" viewBox="0 0 60 30" style={{ flex: '0 0 36px', alignSelf: 'center', margin: '0 -4px' }}>
    <path d="M3 15 Q 20 5 40 15 T 56 15" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M50 8 L 56 15 L 50 22" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// re-usable "drop zone" for upload UI
const DropZone = ({ tall = false, hint = "Drop your quizfetch.html here", showSample = true }) => (
  <div className="s-box dashed" style={{
    border: '2.5px dashed var(--ink)', boxShadow: 'none',
    padding: tall ? 30 : 18,
    background: 'var(--paper-2)',
    textAlign: 'center',
    borderRadius: 14,
  }}>
    <svg width="34" height="34" viewBox="0 0 40 40" style={{ marginBottom: 4 }}>
      <path d="M8 28 L8 32 Q8 34 10 34 L30 34 Q32 34 32 32 L32 28" stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M20 6 L20 26 M20 6 L13 13 M20 6 L27 13" stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <div style={{ fontFamily: 'Caveat, cursive', fontSize: tall ? 26 : 20, color: 'var(--ink)' }}>{hint}</div>
    <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>or <u>click to browse</u> · only .html</div>
    {showSample && (
      <div style={{ marginTop: 10 }}>
        <span className="s-btn sm" style={{ background: 'var(--paper)' }}>✨ Try sample quiz</span>
      </div>
    )}
  </div>
);

// question card (compact, all-on-one-page mode)
const QuestionCardCompact = ({ n, prompt, choices, picked, correct, mode = "neutral" }) => (
  <div className="s-box" style={{ padding: 10, marginBottom: 10, boxShadow: '2px 2px 0 var(--ink)' }}>
    <Row style={{ marginBottom: 6, justifyContent: 'space-between' }}>
      <div style={{ fontWeight: 700 }}>{n}. {prompt}</div>
      {mode === 'correct' && <span className="s-pill ok">✓ correct</span>}
      {mode === 'wrong' && <span className="s-pill bad">✗ wrong</span>}
    </Row>
    <div style={{ display: 'grid', gap: 4 }}>
      {choices.map((c, i) => {
        const isPicked = picked === i;
        const isCorrect = correct === i;
        let cls = 's-box flat';
        let style = { padding: '4px 8px', fontSize: 14, borderColor: 'var(--rule-soft)', background: 'var(--paper)' };
        if (mode === 'correct' && isCorrect) { cls += ' s-hatch-ok'; style.borderColor = 'var(--ok)'; }
        if (mode === 'wrong' && isCorrect) { cls += ' s-hatch-ok'; style.borderColor = 'var(--ok)'; }
        if (mode === 'wrong' && isPicked && !isCorrect) { cls += ' s-hatch-bad'; style.borderColor = 'var(--bad)'; }
        return (
          <div key={i} className={cls} style={style}>
            <span className={`s-radio ${isPicked ? (isCorrect ? 'on-ok' : (mode==='wrong'?'on-bad':'on')) : (mode==='correct' && isCorrect ? 'on-ok' : '')}`} />
            {c}
            {mode === 'wrong' && isCorrect && <span style={{ float: 'right', fontSize: 12, color: 'var(--ok)' }}>← correct answer</span>}
            {mode === 'wrong' && isPicked && !isCorrect && <span style={{ float: 'right', fontSize: 12, color: 'var(--bad)' }}>your pick</span>}
          </div>
        );
      })}
    </div>
  </div>
);

Object.assign(window, {
  Logo, Avatar, Row, ScreenCaption, Screen, FlowArrow, DropZone, QuestionCardCompact,
});
