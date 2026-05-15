// QuizGive Sketch — Shell (sidebar + topbar) and Library / Folder screens

const { useState, useEffect, useRef } = React;
const { Plus, Search, Star, StarFill, Sun, Moon, Menu, X, MoreH, Folder, FolderPlus, FolderMinus, Trash, Edit, Download, Book, Play, Refresh, Sparkles } = window.SketchIcon;
const { HandUnderline, HandArrow, HandStar, HandSquiggle, HandCheck, HandCross, CircledNum, QGLogo } = window.SketchDeco;

/* ── Sidebar ──────────────────────────────────────────────────── */
function QGSidebar({ state, actions, route, navigate, onClose }) {
  const quizzes = Object.values(state.quizzes).sort((a, b) => {
    const aBm = state.bookmarks.includes(a.id) ? 1 : 0;
    const bBm = state.bookmarks.includes(b.id) ? 1 : 0;
    if (aBm !== bBm) return bBm - aBm;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const inLibrary = route.name === 'library';
  const activeQuizId = route.quizId;

  return (
    <aside className="qg-sidebar">
      <div className="qg-side-header">
        <QGLogo size={28} />
        {onClose && (
          <button className="qg-iconbtn" onClick={onClose} aria-label="close sidebar">
            <X size={18} />
          </button>
        )}
      </div>

      <button className="qg-btn primary lg" style={{ width: '100%', justifyContent: 'center', marginBottom: 10, gap: 8 }}
        onClick={() => navigate({ name: 'upload' })}>
        <Plus size={18} /> New quiz
      </button>

      <div className={`qg-side-item ${inLibrary ? 'active' : ''}`} onClick={() => navigate({ name: 'library' })}>
        <span className="qg-row" style={{ gap: 10 }}>
          <Book size={17} />
          <span>Library</span>
        </span>
        <span className="qg-side-item-meta">{quizzes.length}</span>
      </div>

      {quizzes.length > 0 && (
        <div className="qg-side-section-label">your quizzes</div>
      )}

      <div className="qg-side-list">
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
      </div>

      <SideFooter state={state} actions={actions} />
    </aside>
  );
}

function SideFooter({ state, actions }) {
  const isDark = state.theme === 'dark';
  return (
    <div className="qg-side-footer">
      <div className="qg-row" style={{ gap: 10, flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div className="qg-avatar">{state.user.initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>{state.user.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Local account</div>
        </div>
      </div>
      <button className="qg-iconbtn" title={isDark ? 'Light mode' : 'Dark mode'}
        onClick={() => actions.setTheme(isDark ? 'light' : 'dark')}>
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}

/* ── Topbar ───────────────────────────────────────────────────── */
function QGTopbar({ title, subtitle, left, right, onMenu }) {
  return (
    <div className="qg-topbar">
      <div className="qg-row" style={{ gap: 8, minWidth: 0, flex: 1 }}>
        {onMenu && (
          <button className="qg-iconbtn" onClick={onMenu} aria-label="menu" style={{ marginLeft: -6 }}>
            <Menu size={22} />
          </button>
        )}
        {left}
        <div style={{ minWidth: 0, flex: 1 }}>
          {title && <div className="qg-topbar-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>}
          {subtitle && <div className="qg-topbar-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div>}
        </div>
      </div>
      <div className="qg-row" style={{ gap: 10, flexShrink: 0 }}>
        {right}
      </div>
    </div>
  );
}

/* ── Library ──────────────────────────────────────────────────── */
function QGLibraryScreen({ state, actions, navigate }) {
  const [query, setQuery] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');

  const quizzes = Object.values(state.quizzes);
  const filtered = query
    ? quizzes.filter((q) => (q.title + ' ' + q.course).toLowerCase().includes(query.toLowerCase()))
    : quizzes;

  const folderedIds = new Set(Object.values(state.folders || {}).flatMap(f => f.quizIds));
  const folders = (state.folderOrder || []).map(id => state.folders[id]).filter(Boolean);
  const ungrouped = filtered.filter(q => !folderedIds.has(q.id))
    .sort((a, b) => {
      const aBm = state.bookmarks.includes(a.id) ? 1 : 0;
      const bBm = state.bookmarks.includes(b.id) ? 1 : 0;
      if (aBm !== bBm) return bBm - aBm;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  if (quizzes.length === 0) {
    return (
      <div className="qg-scroll center">
        <div className="qg-content" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div className="qg-empty">
            <div className="icon-wrap"><Sparkles size={32} /></div>
            <h1 className="qg-h2">Welcome to QuizGive</h1>
            <p className="qg-muted-2" style={{ maxWidth: 440, margin: '12px auto 28px', fontSize: 17 }}>
              Drop a <b>quizfetch</b> HTML file, paste study notes, or use our AI prompt to turn any reviewer into a fresh quiz.
              Everything stays in your browser.
            </p>
            <button className="qg-btn primary lg" onClick={() => navigate({ name: 'upload' })}>
              <Plus size={18} /> Upload or paste
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    actions.createFolder(folderName.trim());
    setFolderName(''); setCreatingFolder(false);
  };

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 26, flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <div className="qg-row" style={{ gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <h1 className="qg-h1"><span className="hl">Library</span></h1>
              <HandArrow dir="down-left" size={50} color="var(--accent)" style={{ marginBottom: -2, opacity: 0.85 }} />
              <span className="qg-handnote" style={{
                fontFamily: 'var(--hand-display)', fontSize: 20, color: 'var(--accent)',
                transform: 'rotate(-4deg)', marginBottom: 4,
              }}>{quizzes.length} saved!</span>
            </div>
            <div className="qg-muted" style={{ marginTop: 14, fontSize: 16 }}>
              {quizzes.length} quiz{quizzes.length === 1 ? '' : 'zes'} on this device · drag the cards around to organize
            </div>
          </div>
          <div className="qg-row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <div className="qg-search" style={{ width: 240 }}>
              <Search size={16} />
              <input className="qg-input sm" placeholder="search quizzes" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {creatingFolder ? (
              <div className="qg-row" style={{ gap: 6 }}>
                <input className="qg-input sm" placeholder="folder name" value={folderName} autoFocus
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setCreatingFolder(false); setFolderName(''); } }}
                  style={{ width: 160 }} />
                <button className="qg-btn primary sm" onClick={handleCreateFolder} disabled={!folderName.trim()}>Create</button>
                <button className="qg-btn ghost sm" onClick={() => { setCreatingFolder(false); setFolderName(''); }}><X size={14} /></button>
              </div>
            ) : (
              <button className="qg-btn" onClick={() => setCreatingFolder(true)}>
                <FolderPlus size={15} /> New folder
              </button>
            )}
            <button className="qg-btn primary" onClick={() => navigate({ name: 'upload' })}>
              <Plus size={15} /> New quiz
            </button>
          </div>
        </div>

        <div className="qg-lib-grid">
          {folders.map((f, i) => (
            <FolderCard key={f.id} folder={f} state={state} navigate={navigate} actions={actions} tilt={i % 2 === 0 ? 'tilt-l' : 'tilt-r'} />
          ))}
          {ungrouped.map((q, i) => (
            <LibraryCard key={q.id} quiz={q} state={state} actions={actions} navigate={navigate}
              tilt={(folders.length + i) % 3 === 0 ? 'tilt-l' : (folders.length + i) % 3 === 1 ? 'tilt-r' : ''} />
          ))}
          <div className="qg-lib-card empty" onClick={() => navigate({ name: 'upload' })}>
            <div style={{ marginBottom: 8 }}><Plus size={28} /></div>
            <div className="qg-muted" style={{ fontSize: 16 }}>Upload or paste another</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderCard({ folder, state, navigate, actions, tilt = '' }) {
  const quizzes = (folder.quizIds || []).map(id => state.quizzes[id]).filter(Boolean);
  return (
    <div className={`qg-folder-stack ${tilt}`} onClick={() => navigate({ name: 'folder', folderId: folder.id })}>
      <div className="qg-lib-card qg-folder-main">
        <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
          <div className="qg-row" style={{ gap: 10 }}>
            <span style={{ color: 'var(--accent)' }}><Folder size={20} /></span>
            <div className="title">{folder.name}</div>
          </div>
          <button className="qg-iconbtn" onClick={(e) => e.stopPropagation()}><MoreH size={18} /></button>
        </div>
        <div className="meta">{quizzes.length} quizzes</div>
        <div className="qg-row" style={{ gap: 6, marginTop: 6 }}>
          <span className="qg-pill accent"><Folder size={12} /> folder</span>
        </div>
      </div>
      {quizzes.slice(0, 2).map((q, i) => (
        <div key={q.id} className={`qg-folder-peek peek-${i + 1}`}>
          {q.title.replace(/^\[.+?\]\s*/, '')}
        </div>
      ))}
    </div>
  );
}

function LibraryCard({ quiz, state, actions, navigate, tilt = '' }) {
  const isFav = state.bookmarks.includes(quiz.id);
  const session = state.sessions[quiz.id];
  const result = state.results[quiz.id];

  let status = 'not started';
  let pct = 0;
  if (result) {
    status = `${Math.round(result.pct * 100)}% · ${window.SketchData.formatRelative(result.finishedAt)}`;
    pct = result.pct;
  } else if (session && !session.submitted) {
    const answered = session.answers.filter(a => a != null).length;
    pct = answered / session.answers.length;
    status = `${Math.round(pct * 100)}% answered · in progress`;
  }

  return (
    <div className={`qg-lib-card ${tilt}`} onClick={() => navigate({ name: 'quiz', quizId: quiz.id })}>
      {isFav && (
        <span style={{ position: 'absolute', top: -10, left: -10, transform: 'rotate(-12deg)' }}>
          <HandStar size={28} filled color="var(--accent)" />
        </span>
      )}
      {result && (
        <span className="qg-stamp ok">passed!</span>
      )}
      <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
        <div className="title" style={{ flex: 1, marginRight: 10 }}>
          {quiz.title.replace(/^\[.+?\]\s*/, '')}
        </div>
        <button className="qg-iconbtn" onClick={(e) => e.stopPropagation()}>
          <MoreH size={18} />
        </button>
      </div>
      <div className="meta">
        {quiz.course && <span>{quiz.course} · </span>}
        {quiz.questions.length} questions
      </div>
      <div className="meta">{status}</div>
      {pct > 0 && (
        <div className="qg-progress thin" style={{ marginTop: 6 }}>
          <i style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
      )}
      <div className="qg-row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {isFav && <span className="qg-pill accent"><StarFill size={11} /> bookmarked</span>}
        {result && <span className="qg-pill ok"><HandCheck size={12} /> finished</span>}
        {session && !session.submitted && <span className="qg-pill warn">in progress</span>}
        {!result && !session && <span className="qg-pill">new</span>}
      </div>
    </div>
  );
}

/* ── Folder screen ────────────────────────────────────────────── */
function QGFolderScreen({ state, actions, navigate, folderId }) {
  const folder = state.folders?.[folderId];
  if (!folder) return <div className="qg-scroll"><div className="qg-content">Folder not found.</div></div>;
  const quizzes = (folder.quizIds || []).map(id => state.quizzes[id]).filter(Boolean);

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row" style={{ gap: 10, marginBottom: 12 }}>
          <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'library' })}>Library</button>
          <span className="qg-muted">›</span>
          <span style={{ fontSize: 16, color: 'var(--ink-2)' }}>{folder.name}</span>
        </div>
        <div className="qg-row between" style={{ marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="qg-h1"><span className="hl">{folder.name}</span></h1>
            <div className="qg-muted" style={{ marginTop: 14, fontSize: 16 }}>{quizzes.length} quizzes</div>
          </div>
        </div>
        {quizzes.length === 0 ? (
          <div className="qg-empty">
            <div className="icon-wrap"><Folder size={28} /></div>
            <div className="qg-h2">Empty folder</div>
          </div>
        ) : (
          <div className="qg-lib-grid">
            {quizzes.map((q, i) => (
              <LibraryCard key={q.id} quiz={q} state={state} actions={actions} navigate={navigate}
                tilt={i % 3 === 0 ? 'tilt-l' : i % 3 === 1 ? 'tilt-r' : ''} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

window.SketchShell = { QGSidebar, QGTopbar };
window.SketchLib = { QGLibraryScreen, QGFolderScreen };
