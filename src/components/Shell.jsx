import { useState } from 'react';
import { QGIcon } from '../icons.jsx';
import { QGHelpers } from '../store.js';

const { Plus, Star, StarFill, Search, Settings, Menu, X, Sparkles, Book, FileText, Award, Edit } = QGIcon;

export function QGLogo({ size = 30 }) {
  return (
    <span className="qg-logo" style={{ fontSize: size }}>
      <svg width={size + 5} height={size + 5} viewBox="0 0 40 40"
        fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 8 C6 6 8 5 10 5 L30 5 C32 5 34 6 34 8 L34 32 C34 34 32 35 30 35 L10 35 C8 35 6 34 6 32 Z"
          fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.5" />
        <path d="M12 14 L20 14 M12 19 L20 19 M12 24 L17 24"
          stroke="var(--bg)" strokeWidth="1.8" />
        <circle cx="28" cy="27" r="5.5" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2.5" />
        <path d="M32 31 L36 35" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      QuizGive
    </span>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────
export function QGSidebar({ state, actions, auth, route, navigate, onClose }) {
  const quizzes = Object.values(state.quizzes).sort((a, b) => {
    const aBm = state.bookmarks.includes(a.id) ? 1 : 0;
    const bBm = state.bookmarks.includes(b.id) ? 1 : 0;
    if (aBm !== bBm) return bBm - aBm;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const inLibrary = route.name === 'library';
  const activeQuizId = route.quizId;

  const startNew = () => navigate({ name: 'upload' });

  return (
    <aside className="qg-sidebar">
      <div className="qg-side-header">
        <QGLogo />
        {onClose && (
          <button className="qg-iconbtn" onClick={onClose} aria-label="close sidebar">
            <X size={18} />
          </button>
        )}
      </div>

      <button className="qg-btn primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 6 }}
        onClick={startNew}>
        <Plus size={16} /> New quiz
      </button>

      <div className={`qg-side-item${inLibrary ? ' active' : ''}`} onClick={() => navigate({ name: 'library' })}>
        <span className="qg-row" style={{ gap: 8 }}>
          <Book size={16} />
          <span>Library</span>
        </span>
        <span className="qg-side-item-meta">{quizzes.length}</span>
      </div>

      {quizzes.length > 0 && (
        <div className="qg-side-section-label">Your quizzes</div>
      )}

      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, margin: '0 -4px', padding: '0 4px' }}>
        {quizzes.map((q) => {
          const isFav = state.bookmarks.includes(q.id);
          const session = state.sessions[q.id];
          const result = state.results[q.id];
          const isActive = activeQuizId === q.id && !inLibrary;
          let meta = '';
          if (result) meta = `${Math.round(result.pct * 100)}%`;
          else if (session && !session.submitted) meta = '…';
          return (
            <div key={q.id}
              className={`qg-side-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate({ name: 'quiz', quizId: q.id })}
              title={q.title}>
              <span className="qg-side-item-name">
                {isFav && <span className="fav">★</span>}
                {q.title.replace(/^\[.+?\]\s*/, '')}
              </span>
              {meta && <span className="qg-side-item-meta">{meta}</span>}
            </div>
          );
        })}
        {quizzes.length === 0 && (
          <div className="qg-tiny" style={{ padding: '8px 10px' }}>
            Your library is empty. Upload a quizfetch HTML to get started.
          </div>
        )}
      </div>

      <SideFooter state={state} actions={actions} auth={auth} />
    </aside>
  );
}

function SideFooter({ state, actions, auth }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const username = auth?.username || state.user.name;
  const initials = (username || 'YO').slice(0, 2).toUpperCase();
  return (
    <>
      <div className="qg-side-footer">
        <div className="qg-row" style={{ gap: 8, flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => setSettingsOpen(true)}>
          <div className="qg-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>@{username}</div>
          </div>
        </div>
      </div>
      {settingsOpen && (
        <SettingsModal state={state} actions={actions} auth={auth} onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}

const SCHEMES = [
  { id: 'sketch-light',  label: 'Sketch',       bg: '#faf9f5', accent: '#c96442' },
  { id: 'sketch-dark',   label: 'Sketch Dark',  bg: '#1a1814', accent: '#e08363' },
  { id: 'ocean',         label: 'Ocean',        bg: '#f0f6fc', accent: '#2a7aad' },
  { id: 'ocean-dark',    label: 'Ocean Dark',   bg: '#0d1b2a', accent: '#4eb8e8' },
  { id: 'forest',        label: 'Forest',       bg: '#f4f7f2', accent: '#4a7c59' },
  { id: 'forest-dark',   label: 'Forest Dark',  bg: '#111a14', accent: '#5cb87a' },
  { id: 'rose',          label: 'Rose',         bg: '#fdf4f5', accent: '#c44d6b' },
  { id: 'midnight',      label: 'Midnight',     bg: '#0f0f1a', accent: '#8b6fc8' },
];

function SettingsModal({ state, actions, auth, onClose }) {
  const username = auth?.username || state.user.name;
  return (
    <div className="qg-modal-scrim" onClick={onClose}>
      <div className="qg-modal" onClick={(e) => e.stopPropagation()} style={{ width: 360, maxWidth: '90vw' }}>
        <h2 className="qg-h2" style={{ marginBottom: 16 }}>Settings</h2>

        <div className="qg-h4" style={{ marginBottom: 10 }}>Appearance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {SCHEMES.map((s) => {
            const active = state.theme === s.id;
            return (
              <button
                key={s.id}
                onClick={() => actions.setTheme(s.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '8px 4px', borderRadius: 8, cursor: 'pointer', outline: 'none',
                  border: active ? '2.5px solid var(--accent)' : '2px solid var(--border-soft)',
                  background: active ? 'var(--accent-soft)' : 'var(--surface)',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: s.bg,
                  border: '2px solid rgba(0,0,0,0.12)',
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', bottom: 3, right: 3,
                    width: 13, height: 13, borderRadius: '50%',
                    background: s.accent,
                  }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="qg-h4" style={{ marginBottom: 6 }}>Account</div>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-3)', marginBottom: 4 }}>Username</label>
        <input
          className="qg-input"
          value={username}
          readOnly
          style={{ color: 'var(--ink-3)', cursor: 'default', marginBottom: 18 }}
        />

        <div className="qg-row between">
          <button className="qg-btn ghost" onClick={onClose}>Close</button>
          <button
            className="qg-btn"
            onClick={async () => {
              onClose();
              await auth?.signOut();
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Topbar ───────────────────────────────────────────────────────
export function QGTopbar({ title, subtitle, left, right, onMenu }) {
  return (
    <div className="qg-topbar">
      <div className="qg-row" style={{ gap: 8, minWidth: 0, flex: 1 }}>
        {onMenu && (
          <button className="qg-iconbtn" onClick={onMenu} aria-label="menu" style={{ marginLeft: -6 }}>
            <Menu size={20} />
          </button>
        )}
        {left}
        <div style={{ minWidth: 0, flex: 1 }}>
          {title && <div className="qg-topbar-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>}
          {subtitle && <div className="qg-topbar-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>}
        </div>
      </div>
      <div className="qg-row" style={{ gap: 8, flexShrink: 0 }}>
        {right}
      </div>
    </div>
  );
}
