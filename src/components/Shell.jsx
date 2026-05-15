import { useState } from 'react';
import { QGIcon } from '../icons.jsx';
import { QGHelpers } from '../store.js';

const { Plus, Star, StarFill, Search, Settings, Menu, X, Sun, Moon, Sparkles, Book, FileText, Award, Edit } = QGIcon;

export function QGLogo({ size = 30 }) {
  return (
    <span className="qg-logo" style={{ fontSize: size }}>
      <svg width={size + 5} height={size + 5} viewBox="0 0 32 32">
        <rect x="3" y="5" width="26" height="22" rx="4" fill="currentColor" />
        <path d="M9 12 L15 12 M9 16 L15 16 M9 20 L13 20" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="20" r="3.5" fill="none" stroke="var(--surface)" strokeWidth="1.8" />
        <path d="M24 22 L26 24" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      QuizGive
    </span>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────
export function QGSidebar({ state, actions, route, navigate, onClose }) {
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

      <SideFooter state={state} actions={actions} navigate={navigate} />
    </aside>
  );
}

function SideFooter({ state, actions, navigate }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const isDark = state.theme === 'dark';
  return (
    <>
      <div className="qg-side-footer">
        <div className="qg-row" style={{ gap: 8, flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => setAccountOpen(true)}>
          <div className="qg-avatar">{state.user.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Local account</div>
          </div>
        </div>
        <button className="qg-iconbtn" title={isDark ? 'Light mode' : 'Dark mode'}
          onClick={() => actions.setTheme(isDark ? 'light' : 'dark')}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      {accountOpen && (
        <AccountModal state={state} actions={actions} onClose={() => setAccountOpen(false)} />
      )}
    </>
  );
}

function AccountModal({ state, actions, onClose }) {
  const [name, setName] = useState(state.user.name);
  const save = () => {
    actions.setUser({ name: name.trim() || 'You', initials: QGHelpers.initialsOf(name) });
    onClose();
  };
  return (
    <div className="qg-modal-scrim" onClick={onClose}>
      <div className="qg-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="qg-h2" style={{ marginBottom: 4 }}>Account</h2>
        <p className="qg-muted" style={{ fontSize: 13, marginTop: 0, marginBottom: 16 }}>
          Your name and quizzes are saved locally to this browser.
        </p>
        <label className="qg-h3" style={{ display: 'block', marginBottom: 6 }}>Display name</label>
        <input className="qg-input" value={name} onChange={(e) => setName(e.target.value)}
          autoFocus onKeyDown={(e) => e.key === 'Enter' && save()} />

        <div className="qg-row between" style={{ marginTop: 18 }}>
          <button className="qg-btn ghost" onClick={() => {
            if (confirm('Delete all QuizGive data on this device? This cannot be undone.')) {
              localStorage.removeItem('quizgive.v1');
              location.reload();
            }
          }}>Reset all data</button>
          <div className="qg-row">
            <button className="qg-btn" onClick={onClose}>Cancel</button>
            <button className="qg-btn primary" onClick={save}>Save</button>
          </div>
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
