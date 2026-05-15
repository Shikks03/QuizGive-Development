// Lucide-style icons + hand-drawn decorations.

const ic = (path, opts = {}) => (props) => {
  const { size = 18, strokeWidth = 2, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={opts.fill || 'none'}
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      {...rest}>
      {path}
    </svg>
  );
};

const Icon = {
  Plus:        ic(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>),
  Upload:      ic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>),
  Download:    ic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>),
  Search:      ic(<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>),
  Star:        ic(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />),
  StarFill:    ic(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />, { fill: 'currentColor' }),
  Check:       ic(<polyline points="20 6 9 17 4 12" />),
  X:           ic(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>),
  ChevLeft:    ic(<polyline points="15 18 9 12 15 6" />),
  ChevRight:   ic(<polyline points="9 18 15 12 9 6" />),
  ChevDown:    ic(<polyline points="6 9 12 15 18 9" />),
  Refresh:     ic(<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>),
  Trash:       ic(<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>),
  Menu:        ic(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>),
  Play:        ic(<polygon points="5 3 19 12 5 21 5 3" />, { fill: 'currentColor' }),
  Sun:         ic(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>),
  Moon:        ic(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />),
  Sparkles:    ic(<><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6L19 14z" /></>),
  Book:        ic(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>),
  Clock:       ic(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  Award:       ic(<><circle cx="12" cy="8" r="6" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>),
  Shuffle:     ic(<><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></>),
  ArrowRight:  ic(<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>),
  ArrowLeft:   ic(<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>),
  MoreH:       ic(<><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/></>),
  Edit:        ic(<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>),
  Folder:      ic(<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />),
  FolderPlus:  ic(<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></>),
  FolderMinus: ic(<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="9" y1="14" x2="15" y2="14" /></>),
  FileText:    ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></>),
  Eye:         ic(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>),
  Settings:    ic(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
};

/* ── Hand-drawn decorations (organic SVG paths) ───────────────── */

// Wavy/scribbled underline used to emphasize headings.
function HandUnderline({ color, w = 200, h = 14, variant = 1, style }) {
  const stroke = color || 'currentColor';
  const paths = {
    1: 'M2 8 Q 25 2, 50 7 T 100 8 T 150 7 T 198 8',
    2: 'M2 6 Q 20 12, 40 6 T 80 6 T 120 6 T 160 6 T 198 7',
    3: 'M2 7 Q 25 11, 60 6 T 130 7 T 198 8 M4 11 Q 40 8, 80 11 T 195 10',
  };
  return (
    <svg className="deco-underline" viewBox={`0 0 200 ${h}`} preserveAspectRatio="none" style={style}>
      <path d={paths[variant] || paths[1]} stroke={stroke} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Curly arrow that points to something. Direction options.
function HandArrow({ dir = 'down-right', size = 70, color = 'var(--accent)', style }) {
  // 4 hand drawn arrow shapes; each defined on a 100x100 viewBox so it scales.
  const drawings = {
    'down-right': {
      path: 'M10 15 C 35 5, 70 20, 75 65',
      head: 'M65 55 L 75 70 L 88 60',
    },
    'down-left': {
      path: 'M90 15 C 65 5, 30 20, 25 65',
      head: 'M35 55 L 25 70 L 12 60',
    },
    'right': {
      path: 'M5 50 C 30 30, 60 70, 85 50',
      head: 'M75 40 L 90 50 L 75 60',
    },
    'left': {
      path: 'M95 50 C 70 30, 40 70, 15 50',
      head: 'M25 40 L 10 50 L 25 60',
    },
    'up-right': {
      path: 'M10 85 C 35 95, 70 80, 75 35',
      head: 'M65 45 L 75 30 L 88 40',
    },
  };
  const d = drawings[dir] || drawings['down-right'];
  return (
    <svg className="qg-deco-arrow" width={size} height={size} viewBox="0 0 100 100" style={style} fill="none"
      stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d={d.path} />
      <path d={d.head} />
    </svg>
  );
}

// Star burst doodle
function HandStar({ size = 24, color = 'var(--accent)', filled = false, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={filled ? color : 'none'}
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M16 4 L18.5 12 L27 13 L20.5 18.5 L22.5 27 L16 22.5 L9.5 27 L11.5 18.5 L5 13 L13.5 12 Z" />
    </svg>
  );
}

// Squiggle (decorative scribble)
function HandSquiggle({ w = 100, h = 12, color = 'currentColor', style }) {
  return (
    <svg className="qg-deco-squiggle" width={w} height={h} viewBox="0 0 100 12" fill="none" style={style}
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 82 6 T 98 6" />
    </svg>
  );
}

// Hand drawn check (overlay for "complete")
function HandCheck({ size = 32, color = 'var(--ok)', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style}
      stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17 Q 10 22, 13 24 Q 18 17, 28 6" />
    </svg>
  );
}

// Hand drawn X (overlay for "wrong")
function HandCross({ size = 32, color = 'var(--bad)', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={style}
      stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6 Q 16 14, 26 26" />
      <path d="M26 6 Q 18 14, 6 26" />
    </svg>
  );
}

// Hand drawn circled number/letter
function CircledNum({ n, size = 36, color = 'var(--accent)' }) {
  return (
    <span style={{
      display: 'inline-grid', placeItems: 'center',
      width: size, height: size,
      position: 'relative',
      fontFamily: 'var(--hand-display)', fontWeight: 700, fontSize: size * 0.55,
      color: color,
    }}>
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }} fill="none"
        stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <path d="M20 4 C 31 4, 36 12, 36 20 C 36 30, 28 36, 20 36 C 10 36, 4 28, 4 20 C 4 11, 11 4, 20 4 Z" />
      </svg>
      <span style={{ position: 'relative' }}>{n}</span>
    </span>
  );
}

// QuizGive logo — sketchy bookmark + magnifying glass
function QGLogo({ size = 30 }) {
  return (
    <span className="qg-logo" style={{ fontSize: size }}>
      <svg width={size + 8} height={size + 8} viewBox="0 0 40 40" fill="none"
        stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* book/page */}
        <path d="M6 7 Q 7 6, 8 7 L 26 7 Q 28 7, 28 9 L 28 32 Q 28 34, 26 34 L 8 34 Q 6 34, 6 32 Z" fill="var(--accent)" />
        <path d="M10 13 L 22 13 M 10 18 L 20 18 M 10 23 L 17 23" stroke="var(--bg)" strokeWidth="1.8" />
        {/* magnifier */}
        <circle cx="28" cy="27" r="5.5" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2.5" />
        <path d="M32 31 L 36 35" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      QuizGive
    </span>
  );
}

// Sketchy donut for results
function HandDonut({ pct, right, total, size = 200 }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <svg className="qg-donut" width={size} height={size} viewBox="0 0 200 200">
      {/* dashed track */}
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--ink)" strokeWidth="2"
        strokeDasharray="4 5" opacity="0.4" />
      {/* hand-drawn outer */}
      <circle cx="100" cy="100" r={r + 6} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
      <circle cx="100" cy="100" r={r - 6} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
      {/* progress fill */}
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--accent)" strokeWidth="14"
        strokeDasharray={`${c * pct} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 100 100)" />
      <text x="100" y="96" textAnchor="middle" fontSize="38" fill="var(--ink)" fontWeight="700">{right}/{total}</text>
      <text x="100" y="125" textAnchor="middle" fontSize="18" fill="var(--ink-3)">{Math.round(pct * 100)}% right</text>
    </svg>
  );
}

window.SketchIcon = Icon;
window.SketchDeco = { HandUnderline, HandArrow, HandStar, HandSquiggle, HandCheck, HandCross, CircledNum, QGLogo, HandDonut };
