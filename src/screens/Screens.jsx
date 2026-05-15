import { useState, useRef, useEffect } from 'react';
import { QGIcon, HandArrow, HandStar } from '../icons.jsx';
import { QGHelpers, resolveOrder } from '../store.js';
import { QGExport } from '../lib/export.js';
import { DownloadQuizModal } from '../components/DownloadQuizModal.jsx';
import { parseQuizfetch, runAllParsers } from '../lib/parser.js';
import { POLISH_PROMPT } from '../lib/polishPrompt.js';
import { RichText } from '../components/RichText.jsx';
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable,
  rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Plus, Upload, Star, StarFill, Search, Sparkles, FileText, Award, Refresh, Trash, Shuffle, Eye, Play, ChevRight, ArrowRight, Clock, MoreH, Download, Folder, FolderPlus, FolderMinus, Edit } = QGIcon;

// ── DragCard (overlay ghost) ─────────────────────────────────────
function DragCard({ id, state }) {
  const quiz = state.quizzes?.[id];
  const folder = state.folders?.[id];
  const style = {
    transform: 'rotate(1.5deg)',
    boxShadow: '0 8px 24px rgba(108,99,255,0.25)',
    border: '2px solid var(--accent)',
    opacity: 0.95,
    pointerEvents: 'none',
  };
  if (folder) {
    return (
      <div className="qg-lib-card" style={style}>
        <div className="title"><Folder size={14} style={{ display: 'inline', marginRight: 6 }} />{folder.name}</div>
        <div className="meta">{(folder.quizIds || []).length} quiz{(folder.quizIds || []).length !== 1 ? 'zes' : ''}</div>
      </div>
    );
  }
  if (quiz) {
    return (
      <div className="qg-lib-card" style={style}>
        <div className="title">{quiz.title.replace(/^\[.+?\]\s*/, '')}</div>
        <div className="meta">{quiz.questions.length} questions</div>
      </div>
    );
  }
  return null;
}

// ── Library (welcome) ────────────────────────────────────────────
export function QGLibraryScreen({ state, actions, navigate }) {
  const [query, setQuery] = useState('');
  const [activeCardId, setActiveCardId] = useState(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const quizzes = Object.values(state.quizzes);
  const filtered = query
    ? quizzes.filter((q) => (q.title + ' ' + q.course).toLowerCase().includes(query.toLowerCase()))
    : quizzes;

  const sorted = filtered.sort((a, b) => {
    const aBm = state.bookmarks.includes(a.id) ? 1 : 0;
    const bBm = state.bookmarks.includes(b.id) ? 1 : 0;
    if (aBm !== bBm) return bBm - aBm;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const folderedIds = new Set(
    Object.values(state.folders || {}).flatMap(f => f.quizIds)
  );
  const allFolderIds = Object.keys(state.folders || {});
  const folderIds = resolveOrder(state.folderOrder, allFolderIds);
  const folders = folderIds.map(id => state.folders[id]).filter(Boolean);

  const allUngroupedIds = Object.values(state.quizzes)
    .filter(q => !folderedIds.has(q.id))
    .map(q => q.id);
  const ungroupedIds = resolveOrder(state.cardOrder, allUngroupedIds);
  const ungrouped = ungroupedIds.map(id => state.quizzes[id]).filter(Boolean);

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    actions.createFolder(folderName.trim());
    setFolderName('');
    setCreatingFolder(false);
  };

  const sortableIds = [...folderIds, ...ungroupedIds];

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const isFolderItem = id => (state.folders || {})[id] !== undefined;

    if (isFolderItem(over.id) && !isFolderItem(active.id)) {
      actions.addQuizToFolder(over.id, active.id);
      return;
    }

    const oldIndex = sortableIds.indexOf(active.id);
    const newIndex = sortableIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(sortableIds, oldIndex, newIndex);

    actions.setFolderOrder(newOrder.filter(id => isFolderItem(id)));
    actions.setCardOrder(newOrder.filter(id => !isFolderItem(id)));
  }

  if (quizzes.length === 0) {
    return (
      <div className="qg-scroll center">
        <div className="qg-content" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div className="qg-empty">
            <div className="icon-wrap"><Sparkles size={28} /></div>
            <h1 className="qg-h2">Welcome to QuizGive</h1>
            <p className="qg-muted-2" style={{ maxWidth: 440, margin: '8px auto 24px' }}>
              Drop a <b>quizfetch</b> HTML file, paste study notes, or use our AI prompt to turn any reviewer into a fresh quiz.
              Everything stays in your browser.
            </p>
            <button className="qg-btn primary lg" onClick={() => navigate({ name: 'upload' })}>
              <Upload size={16} /> Upload or paste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qg-scroll" onClick={() => setActiveCardId(null)}>
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="qg-row" style={{ alignItems: 'flex-end', gap: 8 }}>
              <h1 className="qg-h1" style={{ margin: 0 }}><span className="hl">Library</span></h1>
              <HandArrow dir="down-left" size={50} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--hand-display)',
                fontSize: 20,
                color: 'var(--accent)',
                transform: 'rotate(-4deg)',
                lineHeight: 1,
                paddingBottom: 6,
              }}>
                {quizzes.length} saved!
              </span>
            </div>
          </div>
          <div className="qg-row" style={{ gap: 8 }}>
            <div className="qg-search" style={{ width: 220 }}>
              <Search size={15} />
              <input className="qg-input" placeholder="Search quizzes" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {creatingFolder ? (
              <div className="qg-row" style={{ gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <input
                  className="qg-input"
                  placeholder="Folder name"
                  value={folderName}
                  autoFocus
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setCreatingFolder(false); setFolderName(''); } }}
                  style={{ width: 140, padding: '5px 10px', height: 34 }}
                />
                <button className="qg-btn primary sm" onClick={handleCreateFolder} disabled={!folderName.trim()}>Create</button>
                <button className="qg-btn ghost sm" onClick={() => { setCreatingFolder(false); setFolderName(''); }}>✕</button>
              </div>
            ) : (
              <button className="qg-btn" onClick={(e) => { e.stopPropagation(); setCreatingFolder(true); }}>
                <FolderPlus size={15} /> New folder
              </button>
            )}
            <button className="qg-btn primary" onClick={() => navigate({ name: 'upload' })}>
              <Plus size={15} /> New quiz
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="qg-lib-grid">
              {folders.map(f => (
                <FolderCard
                  key={f.id}
                  folder={f}
                  state={state}
                  actions={actions}
                  navigate={navigate}
                  activeId={activeId}
                />
              ))}
              {ungrouped.map((q, idx) => (
                <LibraryCard
                  key={q.id}
                  quiz={q}
                  tiltClass={idx % 2 === 0 ? 'tilt-r' : 'tilt-l'}
                  state={state}
                  actions={actions}
                  navigate={navigate}
                  activeCardId={activeCardId}
                  setActiveCardId={setActiveCardId}
                />
              ))}
              <div className="qg-lib-card empty" onClick={(e) => { e.stopPropagation(); navigate({ name: 'upload' }); }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}><Plus size={22} /></div>
                <div className="qg-muted">Upload or paste another</div>
              </div>
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? <DragCard id={activeId} state={state} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

function FolderCard({ folder, state, actions, navigate, activeId }) {
  const quizzes = (folder.quizIds || []).map(id => state.quizzes[id]).filter(Boolean);

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging, isOver,
  } = useSortable({ id: folder.id });

  const isQuizHovering = isOver && activeId && !(state.folders || {})[activeId];

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleRename = () => {
    if (newName.trim()) actions.renameFolder(folder.id, newName.trim());
    setRenaming(false);
    setMenuOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      className="qg-folder-stack"
      onClick={() => { if (!menuOpen && !renaming) navigate({ name: 'folder', folderId: folder.id }); }}
    >
      <div
        className="qg-lib-card qg-folder-main"
        style={isQuizHovering ? {
          background: 'var(--accent-tint, #ece9ff)',
          borderColor: 'var(--accent)',
          boxShadow: '0 0 0 3px rgba(108,99,255,0.18)',
        } : undefined}
      >
        {isQuizHovering && (
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
            Drop to add ↓
          </div>
        )}
        <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
          <div className="qg-row" style={{ gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0 }}><Folder size={16} /></span>
            {renaming ? (
              <input className="qg-input"
                value={newName} autoFocus
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setRenaming(false); setNewName(folder.name); } }}
                onClick={(e) => e.stopPropagation()}
                style={{ padding: '2px 6px', height: 26, fontSize: 14 }}
              />
            ) : (
              <div className="title" style={{ flex: 1 }}>{folder.name}</div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button className="qg-iconbtn" onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}>
              <MoreH size={16} />
            </button>
            {menuOpen && (
              <div ref={menuRef} className="qg-card"
                style={{ position: 'absolute', right: 0, top: 28, minWidth: 160, padding: 4, zIndex: 31, boxShadow: 'var(--shadow-lg)' }}
                onClick={(e) => e.stopPropagation()}>
                <button className="qg-btn ghost" style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => { setRenaming(true); setMenuOpen(false); }}>
                  <Edit size={14} /> Rename
                </button>
                <button className="qg-btn ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--bad)' }}
                  onClick={() => { setMenuOpen(false); if (confirm(`Delete folder "${folder.name}"? Quizzes inside will not be deleted.`)) actions.deleteFolder(folder.id); }}>
                  <Trash size={14} /> Delete folder
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="meta">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</div>
        <div className="qg-row" style={{ gap: 6, marginTop: 8 }}>
          <span className="qg-pill accent"><Folder size={11} /> folder</span>
        </div>
      </div>
      {quizzes.slice(0, 2).map((q, i) => (
        <div key={q.id} className={`qg-folder-peek peek-${i + 1}`}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {q.title.replace(/^\[.+?\]\s*/, '')}
          </span>
        </div>
      ))}
    </div>
  );
}

function LibraryCard({ quiz, state, actions, navigate, activeCardId, setActiveCardId, folderId, tiltClass }) {
  const isFav = state.bookmarks.includes(quiz.id);
  const session = state.sessions[quiz.id];
  const result = state.results[quiz.id];
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const menuRef = useRef(null);
  const isFlipped = activeCardId === quiz.id;
  const folderList = Object.values(state.folders || {});

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('scroll', handler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('scroll', handler, true);
    };
  }, [menuOpen]);

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: quiz.id });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 0 : undefined,
  };

  let status = 'not started';
  let pct = 0;
  if (result) {
    status = `${Math.round(result.pct * 100)}% · ${QGHelpers.formatRelative(result.finishedAt)}`;
    pct = result.pct;
  } else if (session && !session.submitted) {
    const answered = session.answers.filter(a => a != null).length;
    pct = answered / session.answers.length;
    status = `${Math.round(pct * 100)}% answered · in progress`;
  }

  return (
    <>
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      className={`qg-flip-card${isFlipped ? ' is-flipped' : ''}${tiltClass ? ' ' + tiltClass : ''}`}
      onClick={(e) => { e.stopPropagation(); setActiveCardId(quiz.id); }}
    >
      <div className="qg-flip-card-inner">

        {/* ── Front face ── */}
        <div className="qg-lib-card qg-flip-card-front" style={{ position: 'relative' }}>
          {isFav && (
            <HandStar
              size={28}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                transform: 'rotate(-12deg)',
                color: 'var(--accent)',
                pointerEvents: 'none',
              }}
            />
          )}
          <div className="qg-row between" style={{ alignItems: 'flex-start' }}>
            <div className="title" style={{ flex: 1 }}>{quiz.title.replace(/^\[.+?\]\s*/, '')}</div>
            <div style={{ position: 'relative' }}>
              <button
                className="qg-iconbtn"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
              >
                <MoreH size={16} />
              </button>
              {menuOpen && (
                <>
                  <div
                    ref={menuRef}
                    className="qg-card"
                    style={{ position: 'absolute', right: 0, top: 28, minWidth: 180, padding: 4, zIndex: 31, boxShadow: 'var(--shadow-lg)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="qg-btn ghost"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => { actions.toggleBookmark(quiz.id); setMenuOpen(false); }}
                    >
                      {isFav ? <StarFill size={14} /> : <Star size={14} />}
                      {isFav ? 'Remove bookmark' : 'Bookmark'}
                    </button>
                    <button
                      className="qg-btn ghost"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={(e) => { e.stopPropagation(); QGExport.downloadJSON(quiz); setMenuOpen(false); }}
                    >
                      <Download size={14} /> Download JSON
                    </button>
                    <button
                      className="qg-btn ghost"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={(e) => { e.stopPropagation(); QGExport.downloadHTML(quiz); setMenuOpen(false); }}
                    >
                      <Download size={14} /> Download HTML
                    </button>
                    {!folderId && folderList.length > 0 && (
                      <>
                        <button className="qg-btn ghost" style={{ width: '100%', justifyContent: 'flex-start' }}
                          onClick={() => setFolderPickerOpen(o => !o)}>
                          <Folder size={14} /> Add to folder {folderPickerOpen ? '▲' : '▼'}
                        </button>
                        {folderPickerOpen && (
                          <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }}>
                            {folderList.map(f => (
                              <button key={f.id} className="qg-btn ghost" style={{ width: '100%', justifyContent: 'flex-start', paddingLeft: 24, fontSize: 13 }}
                                onClick={() => { actions.addQuizToFolder(f.id, quiz.id); setMenuOpen(false); setFolderPickerOpen(false); }}>
                                {f.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {folderId && (
                      <button className="qg-btn ghost" style={{ width: '100%', justifyContent: 'flex-start' }}
                        onClick={() => { actions.removeQuizFromFolder(folderId, quiz.id); setMenuOpen(false); }}>
                        <FolderMinus size={14} /> Remove from folder
                      </button>
                    )}
                    <button
                      className="qg-btn ghost"
                      style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--bad)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        if (confirm(`Delete "${quiz.title}"? This cannot be undone.`)) actions.deleteQuiz(quiz.id);
                      }}
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="meta">
            {quiz.course && <span>{quiz.course} · </span>}
            {quiz.questions.length} questions
          </div>
          <div className="meta">{status}</div>
          {pct > 0 && (
            <div className="qg-progress" style={{ marginTop: 6 }}>
              <i style={{ width: `${Math.round(pct * 100)}%` }} />
            </div>
          )}
          <div className="qg-row" style={{ gap: 6, marginTop: 8 }}>
            {isFav && <span className="qg-pill accent"><StarFill size={11} /> bookmarked</span>}
            {result && <span className="qg-pill ok">finished</span>}
            {session && !session.submitted && <span className="qg-pill warn">in progress</span>}
            {!result && !session && <span className="qg-pill">new</span>}
          </div>
          {result && <span className="qg-stamp ok">passed!</span>}
        </div>

        {/* ── Back face ── */}
        <div className="qg-flip-card-back" onClick={(e) => e.stopPropagation()}>
          <div className="qg-flip-back-title">
            {quiz.title.replace(/^\[.+?\]\s*/, '')}
            <span className="qg-muted" style={{ fontSize: 12, fontWeight: 400, fontFamily: 'var(--font-sans)' }}>
              {' '}· {quiz.questions.length} questions
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <button
              className="qg-btn primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={(e) => { e.stopPropagation(); navigate({ name: 'quiz', quizId: quiz.id }); }}
            >
              <Play size={14} /> Start quiz
            </button>
            <button
              className="qg-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={(e) => { e.stopPropagation(); setDownloadOpen(true); }}
            >
              <Download size={14} /> Download
            </button>
          </div>
          <button
            className="qg-btn ghost sm"
            style={{ alignSelf: 'flex-end' }}
            onClick={(e) => { e.stopPropagation(); setActiveCardId(null); }}
          >
            ← back
          </button>
        </div>

      </div>
    </div>
    {downloadOpen && (
      <DownloadQuizModal quiz={quiz} state={state} onClose={() => setDownloadOpen(false)} />
    )}
    </>
  );
}

// ── Upload ───────────────────────────────────────────────────────
export function QGUploadScreen({ state, actions, navigate, sample }) {
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [promptOpen, setPromptOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const saveAndNavigate = (quiz, filename) => {
    quiz.sourceFilename = filename || '';
    actions.saveQuiz(quiz);
    navigate({ name: 'preview', quizId: quiz.id });
  };

  const handleFile = async (file) => {
    if (!file) return;
    setParsing(true);
    setError('');
    try {
      const text = await file.text();
      const hint = /\.html?$/i.test(file.name) || file.type === 'text/html' ? 'html' : undefined;
      const { best } = runAllParsers(text, hint);
      if (!best || !best.quiz.questions.length) {
        setError("Couldn't find any questions in that file. Try the Polish First prompt on the right.");
        setParsing(false);
        return;
      }
      saveAndNavigate(best.quiz, file.name);
    } catch (err) {
      setError('Sorry, I could not read that file. ' + (err.message || ''));
      setParsing(false);
    }
  };

  const handlePastedText = () => {
    if (!pasteText.trim()) return;
    setParsing(true);
    setError('');
    try {
      const { best } = runAllParsers(pasteText, 'text');
      if (!best || !best.quiz.questions.length) {
        setError("Couldn't parse — try the Polish First prompt on the right.");
        setParsing(false);
        return;
      }
      saveAndNavigate(best.quiz, 'pasted-text');
    } catch (err) {
      setError('Parse error: ' + (err.message || ''));
      setParsing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const trySample = async () => {
    if (!sample) return;
    setParsing(true);
    try {
      const quiz = parseQuizfetch(sample.html);
      quiz.sourceFilename = sample.name;
      actions.saveQuiz(quiz);
      navigate({ name: 'preview', quizId: quiz.id });
    } catch (err) {
      setError('Could not load sample.');
      setParsing(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(POLISH_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="qg-scroll">
      <div className="qg-content wide" style={{ maxWidth: 960 }}>
        <h1 className="qg-h1" style={{ marginBottom: 4 }}>Upload or paste your quiz source</h1>
        <p className="qg-muted-2" style={{ marginBottom: 20 }}>
          Drop a quizfetch HTML file, paste notes in any format, or use the AI prompt to convert any reviewer.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Left column — drop zone + textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              className={`qg-drop ${over ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="icon"><Upload size={20} /></div>
              <div className="qg-h2" style={{ fontSize: 17 }}>
                {parsing ? 'Parsing…' : 'Drop a file here'}
              </div>
              <div className="qg-muted" style={{ marginTop: 4, fontSize: 13 }}>
                or <u>click to browse</u> · .html, .txt, .md · nothing leaves your device
              </div>
              <input ref={inputRef} type="file" accept=".html,.htm,.txt,.md,text/html,text/plain,text/markdown" style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>

            <div className="qg-card qg-card-pad" style={{ padding: 14 }}>
              <div className="qg-h3" style={{ marginBottom: 8, fontSize: 14 }}>Or paste text directly</div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Paste your notes, Quizlet export, Q&A pairs, or AI-generated JSON here…"}
                style={{
                  width: '100%', minHeight: 120, resize: 'vertical',
                  fontFamily: 'var(--font-mono, monospace)', fontSize: 12.5,
                  border: '1px solid var(--rule)', borderRadius: 6,
                  padding: '8px 10px', background: 'var(--surface)',
                  color: 'var(--ink)', boxSizing: 'border-box',
                }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="qg-btn primary"
                  onClick={handlePastedText}
                  disabled={!pasteText.trim() || parsing}
                >
                  <Sparkles size={14} /> Parse
                </button>
              </div>
            </div>

            {error && (
              <div className="qg-pill bad" style={{ marginTop: 0 }}>{error}</div>
            )}

            {sample && (
              <div style={{ fontSize: 13 }}>
                <button className="qg-btn" onClick={trySample}>
                  <Sparkles size={14} /> Try the sample quiz
                </button>
              </div>
            )}

            <div className="qg-tiny" style={{ marginTop: 4 }}>
              <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'library' })}>
                ← Back to library
              </button>
            </div>
          </div>

          {/* Right column — Polish-First panel */}
          <div className="qg-card" style={{ overflow: 'hidden' }}>
            <button
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: promptOpen ? '1px solid var(--rule)' : 'none',
              }}
              onClick={() => setPromptOpen(o => !o)}
            >
              <span className="qg-h3" style={{ fontSize: 14, margin: 0 }}>
                <Sparkles size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Pasting from a reviewer? Polish it first.
              </span>
              <span className="qg-muted" style={{ fontSize: 12 }}>{promptOpen ? '▲' : '▼'}</span>
            </button>

            {promptOpen && (
              <div style={{ padding: '14px 16px' }}>
                <p className="qg-muted" style={{ fontSize: 13, marginBottom: 10 }}>
                  Copy this prompt, paste it into <b>ChatGPT, Claude, or Gemini</b> along with your study material.
                  Paste the JSON it returns into the text box on the left.
                </p>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'var(--surface-2)', borderRadius: 6,
                    padding: '10px 12px', fontSize: 11.5, lineHeight: 1.55,
                    overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    margin: 0, color: 'var(--ink-2)',
                    border: '1px solid var(--rule)',
                    maxHeight: 320, overflowY: 'auto',
                  }}>
                    {POLISH_PROMPT}
                  </pre>
                  <button
                    className="qg-btn sm"
                    onClick={copyPrompt}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    {copied ? '✓ Copied!' : 'Copy prompt'}
                  </button>
                </div>
                <p className="qg-tiny" style={{ marginTop: 10, color: 'var(--ink-3)' }}>
                  The AI returns clean JSON — paste it in the text box and click Parse. It will always parse at 100% confidence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Preview & configure ──────────────────────────────────────────
export function QGPreviewScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const [cfg, setCfg] = useState({
    randomizeQuestions: true,
    randomizeChoices: true,
    layout: 'one',
    feedback: 'instant',
  });

  if (!quiz) {
    return <div className="qg-scroll"><div className="qg-content">Quiz not found.</div></div>;
  }

  const generate = () => {
    const session = QGHelpers.makeSession(quiz, cfg);
    actions.saveSession(quiz.id, session);
    navigate({ name: 'ready', quizId: quiz.id });
  };

  const lowConfidence = quiz.confidence != null && quiz.confidence < 0.7;

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="qg-h1">{quiz.title.replace(/^\[.+?\]\s*/, '')}</h1>
            <div className="qg-muted" style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {quiz.course && <>{quiz.course} · </>}
              <span className="qg-pill ok"><Sparkles size={11} /> {quiz.questions.length} questions parsed</span>
              {quiz.parserName && (
                <span className="qg-pill" style={{ fontSize: 11 }}>parsed by {quiz.parserName}</span>
              )}
            </div>
          </div>
          <div className="qg-row" style={{ gap: 8 }}>
            <button className="qg-btn" onClick={() => navigate({ name: 'upload' })}>
              <Refresh size={14} /> Re-upload
            </button>
          </div>
        </div>

        {lowConfidence && (
          <div className="qg-pill warn" style={{ marginBottom: 16, display: 'block', textAlign: 'center', padding: '8px 14px' }}>
            Parsed with <b>{quiz.parserName}</b> (confidence {Math.round(quiz.confidence * 100)}%) — review carefully before starting.
          </div>
        )}

        <div className="qg-grid-2">
          {/* Options panel */}
          <div className="qg-card qg-card-pad">
            <h3 className="qg-h3" style={{ marginBottom: 12 }}>Quiz options</h3>

            <CheckRow checked={cfg.randomizeQuestions} onToggle={() => setCfg({ ...cfg, randomizeQuestions: !cfg.randomizeQuestions })}
              icon={<Shuffle size={14} />} label="Randomize question order" />
            <CheckRow checked={cfg.randomizeChoices} onToggle={() => setCfg({ ...cfg, randomizeChoices: !cfg.randomizeChoices })}
              icon={<Shuffle size={14} />} label="Randomize choice order" />

            <hr className="qg-divider" />

            <h3 className="qg-h3" style={{ marginBottom: 6 }}>Layout</h3>
            <RadioRow checked={cfg.layout === 'one'} onPick={() => setCfg({ ...cfg, layout: 'one' })}
              label="One question at a time" sub="Focused mode — see one question per screen." />
            <RadioRow checked={cfg.layout === 'all'} onPick={() => setCfg({ ...cfg, layout: 'all' })}
              label="All questions on one page" sub="Scroll through everything. Submit at the end." />

            <hr className="qg-divider" />

            <h3 className="qg-h3" style={{ marginBottom: 6 }}>Feedback</h3>
            <RadioRow checked={cfg.feedback === 'instant'} onPick={() => setCfg({ ...cfg, feedback: 'instant' })}
              label="Instant" sub="Reveal the correct answer the moment you pick." />
            <RadioRow checked={cfg.feedback === 'submit'} onPick={() => setCfg({ ...cfg, feedback: 'submit' })}
              label="After submit" sub="See all results once at the end." />
          </div>

          {/* Preview panel */}
          <div className="qg-card qg-card-pad">
            <div className="qg-row between" style={{ marginBottom: 12 }}>
              <h3 className="qg-h3">Parsed preview</h3>
              <span className="qg-pill ok">✓ {quiz.questions.length}/{quiz.questions.length}</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto', margin: '0 -4px', padding: '0 4px' }}>
              {quiz.questions.slice(0, 8).map((q, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px dashed var(--rule-soft)' }}>
                  <div style={{ fontSize: 13.5, color: 'var(--ink)' }}>
                    <span className="qg-muted">{i + 1}.</span> <RichText nodes={q.prompt} />
                  </div>
                  <div className="qg-tiny" style={{ marginTop: 2 }}>
                    {q.choices.length} choices · answer: <span style={{ color: 'var(--ok)' }}><RichText nodes={q.choices[q.correctIdx]} /></span>
                  </div>
                </div>
              ))}
              {quiz.questions.length > 8 && (
                <div className="qg-tiny" style={{ paddingTop: 8 }}>… and {quiz.questions.length - 8} more</div>
              )}
            </div>
          </div>
        </div>

        <div className="qg-row between" style={{ marginTop: 22 }}>
          <button className="qg-btn ghost" onClick={() => navigate({ name: 'library' })}>← Cancel</button>
          <button className="qg-btn primary lg" onClick={generate}>
            <Sparkles size={15} /> Generate quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ checked, onToggle, icon, label }) {
  return (
    <div className={`qg-check-row ${checked ? 'on' : ''}`} onClick={onToggle}>
      <span className="box">{checked && <QGIcon.Check size={12} />}</span>
      <span className="label-main qg-row" style={{ gap: 6 }}>
        {icon && <span className="qg-muted">{icon}</span>} {label}
      </span>
    </div>
  );
}

function RadioRow({ checked, onPick, label, sub }) {
  return (
    <div className={`qg-check-row radio ${checked ? 'on' : ''}`} onClick={onPick}
      style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 0 }}>
      <div className="qg-row" style={{ gap: 10 }}>
        <span className="box" />
        <span className="label-main">{label}</span>
      </div>
      {sub && <div className="label-sub">{sub}</div>}
    </div>
  );
}

// ── Ready / decision ─────────────────────────────────────────────
export function QGReadyScreen({ state, actions, navigate, quizId }) {
  const quiz = state.quizzes[quizId];
  const session = state.sessions[quizId];
  const isFav = state.bookmarks.includes(quizId);
  if (!quiz) return null;

  const cfgLabel = session
    ? [
        session.layout === 'one' ? 'one-by-one' : 'all on one page',
        session.feedback === 'instant' ? 'instant feedback' : 'feedback at end',
        session.randomizeQuestions ? 'randomized' : 'in order',
      ].join(' · ')
    : '';

  return (
    <div className="qg-scroll">
      <div className="qg-content wide">
        <div className="qg-row between" style={{ marginBottom: 18, alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="qg-h1">Your quiz is <span className="hl">ready!</span></h1>
            <div className="qg-muted-2" style={{ marginTop: 6 }}>
              <b>{quiz.title.replace(/^\[.+?\]\s*/, '')}</b> · {quiz.questions.length} questions
            </div>
            <div className="qg-muted" style={{ fontSize: 13, marginTop: 2 }}>{cfgLabel}</div>
          </div>
          <span className="qg-pill ok"><Sparkles size={11} /> generated · saved to library</span>
        </div>

        <div className="qg-h3" style={{ color: 'var(--ink-3)', fontWeight: 500, fontSize: 13, marginBottom: 10 }}>
          What would you like to do?
        </div>

        <div className="qg-decision-grid">
          <button className="qg-decision primary" onClick={() => navigate({ name: 'quiz', quizId })}>
            <div className="ico"><Play size={18} /></div>
            <h4>Take the quiz now</h4>
            <p>Jump in — your progress autosaves to this device.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn primary sm">Start <ArrowRight size={13} /></span>
            </div>
          </button>

          <button className="qg-decision" onClick={() => {
            actions.toggleBookmark(quizId);
          }}>
            <div className="ico" style={{ background: 'var(--warn-tint)', color: 'var(--warn)' }}>
              {isFav ? <StarFill size={18} /> : <Star size={18} />}
            </div>
            <h4>{isFav ? 'Bookmarked ✓' : 'Bookmark for later'}</h4>
            <p>Save to your library — pin to top for quick access.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn sm">{isFav ? 'Unbookmark' : 'Bookmark'}</span>
            </div>
          </button>

          <button className="qg-decision" onClick={() => navigate({ name: 'upload' })}>
            <div className="ico" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}><Refresh size={18} /></div>
            <h4>Re-upload</h4>
            <p>Replace this quiz with a different file or pasted text.</p>
            <div className="qg-row" style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
              <span className="qg-btn sm">Re-upload</span>
            </div>
          </button>
        </div>

        <div className="qg-card flat" style={{ marginTop: 16, padding: '10px 14px', background: 'var(--surface-2)', borderStyle: 'dashed' }}>
          <div className="qg-row between" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div className="qg-row qg-muted-2" style={{ fontSize: 13 }}>
              <Download size={14} />
              Also: <a onClick={(e) => { e.preventDefault(); QGExport.downloadJSON(quiz); }} href="#">download JSON</a>
              · <a onClick={(e) => { e.preventDefault(); QGExport.downloadHTML(quiz); }} href="#">download HTML</a>
            </div>
            <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'preview', quizId })}>
              ← Back to configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Folder screen ────────────────────────────────────────────────
export function QGFolderScreen({ state, actions, navigate, folderId }) {
  const folder = state.folders?.[folderId];
  const [activeCardId, setActiveCardId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const availableQuizIds = (folder?.quizIds || []).filter(id => state.quizzes[id]);
  const orderedQuizIds = resolveOrder(state.folderCardOrder?.[folderId] || [], availableQuizIds);
  const quizzes = orderedQuizIds.map(id => state.quizzes[id]).filter(Boolean);

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = orderedQuizIds.indexOf(active.id);
    const newIndex = orderedQuizIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    actions.setFolderCardOrder(folderId, arrayMove(orderedQuizIds, oldIndex, newIndex));
  }

  if (!folder) return <div className="qg-scroll"><div className="qg-content">Folder not found.</div></div>;

  return (
    <div className="qg-scroll" onClick={() => setActiveCardId(null)}>
      <div className="qg-content wide">
        <div className="qg-row" style={{ gap: 6, marginBottom: 8 }}>
          <button className="qg-btn ghost sm" onClick={() => navigate({ name: 'library' })}>Library</button>
          <span className="qg-muted" style={{ fontSize: 13 }}>›</span>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{folder.name}</span>
        </div>
        <div className="qg-row between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="qg-h1">{folder.name}</h1>
            <div className="qg-muted" style={{ marginTop: 4 }}>{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}</div>
          </div>
        </div>
        {quizzes.length === 0 ? (
          <div className="qg-empty">
            <div className="icon-wrap"><Folder size={24} /></div>
            <div className="qg-h2">Empty folder</div>
            <p className="qg-muted-2" style={{ maxWidth: 340, margin: '8px auto 0' }}>
              Use the ··· menu on any quiz card to add it to this folder.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveId(active.id)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedQuizIds} strategy={rectSortingStrategy}>
              <div className="qg-lib-grid">
                {quizzes.map((q) => (
                  <LibraryCard
                    key={q.id}
                    quiz={q}
                    state={state}
                    actions={actions}
                    navigate={navigate}
                    activeCardId={activeCardId}
                    setActiveCardId={setActiveCardId}
                    folderId={folderId}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? <DragCard id={activeId} state={state} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
