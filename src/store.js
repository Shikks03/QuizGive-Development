import { useState, useEffect, useCallback, useMemo } from 'react';

const QG_KEY = 'quizgive.v1';

const QG_DEFAULTS = {
  user: { name: 'You', initials: 'YO' },
  theme: 'light',
  quizzes: {},
  sessions: {},
  results: {},
  bookmarks: [],
  questionBookmarks: {},
  recentQuizId: null,
  ranOnboarding: false,
  folders: {},
  cardOrder: [],
  folderOrder: [],
  folderCardOrder: {},
};

function loadState() {
  try {
    const raw = localStorage.getItem(QG_KEY);
    if (!raw) return { ...QG_DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...QG_DEFAULTS, ...parsed };
  } catch {
    return { ...QG_DEFAULTS };
  }
}

function saveState(s) {
  try { localStorage.setItem(QG_KEY, JSON.stringify(s)); } catch {}
}

export function resolveOrder(order, availableIds) {
  const idSet = new Set(availableIds);
  const known = order.filter(id => idSet.has(id));
  const knownSet = new Set(known);
  const novel = availableIds.filter(id => !knownSet.has(id));
  return [...known, ...novel];
}

export function useQGStore() {
  const [state, setState] = useState(() => loadState());

  useEffect(() => { saveState(state); }, [state]);

  const update = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  const actions = useMemo(() => ({
    setUser: (u) => update((s) => ({ ...s, user: { ...s.user, ...u } })),
    setTheme: (t) => update((s) => ({ ...s, theme: t })),

    saveQuiz: (quiz) => update((s) => ({
      ...s,
      quizzes: { ...s.quizzes, [quiz.id]: quiz },
      recentQuizId: quiz.id,
    })),
    deleteQuiz: (id) => update((s) => {
      const { [id]: _gone, ...quizzes } = s.quizzes;
      const { [id]: _g2, ...sessions } = s.sessions;
      const { [id]: _g3, ...results } = s.results;
      const { [id]: _g4, ...qbm } = s.questionBookmarks;
      return {
        ...s, quizzes, sessions, results,
        bookmarks: s.bookmarks.filter(b => b !== id),
        questionBookmarks: qbm,
        recentQuizId: s.recentQuizId === id ? null : s.recentQuizId,
      };
    }),
    renameQuiz: (id, title) => update((s) => ({
      ...s,
      quizzes: { ...s.quizzes, [id]: { ...s.quizzes[id], title } },
    })),

    saveSession: (quizId, session) => update((s) => ({
      ...s,
      sessions: { ...s.sessions, [quizId]: session },
    })),
    clearSession: (quizId) => update((s) => {
      const { [quizId]: _g, ...sessions } = s.sessions;
      return { ...s, sessions };
    }),

    saveResult: (quizId, summary) => update((s) => ({
      ...s,
      results: { ...s.results, [quizId]: summary },
    })),
    clearResult: (quizId) => update((s) => {
      const { [quizId]: _g, ...results } = s.results;
      return { ...s, results };
    }),

    toggleBookmark: (quizId) => update((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(quizId)
        ? s.bookmarks.filter(x => x !== quizId)
        : [quizId, ...s.bookmarks],
    })),

    toggleQuestionBookmark: (quizId, qIdx) => update((s) => {
      const cur = s.questionBookmarks[quizId] || [];
      const next = cur.includes(qIdx) ? cur.filter(x => x !== qIdx) : [...cur, qIdx];
      return { ...s, questionBookmarks: { ...s.questionBookmarks, [quizId]: next } };
    }),

    setRecent: (quizId) => update((s) => ({ ...s, recentQuizId: quizId })),
    markOnboarded: () => update((s) => ({ ...s, ranOnboarding: true })),

    createFolder: (name) => update((s) => {
      const id = 'f_' + Date.now().toString(36);
      return { ...s, folders: { ...s.folders, [id]: { id, name, quizIds: [], createdAt: Date.now() } } };
    }),
    deleteFolder: (id) => update((s) => {
      const { [id]: _gone, ...folders } = s.folders;
      return { ...s, folders };
    }),
    renameFolder: (id, name) => update((s) => ({
      ...s, folders: { ...s.folders, [id]: { ...s.folders[id], name } },
    })),
    addQuizToFolder: (folderId, quizId) => update((s) => {
      const folder = s.folders[folderId];
      if (!folder || folder.quizIds.includes(quizId)) return s;
      return { ...s, folders: { ...s.folders, [folderId]: { ...folder, quizIds: [...folder.quizIds, quizId] } } };
    }),
    removeQuizFromFolder: (folderId, quizId) => update((s) => {
      const folder = s.folders[folderId];
      if (!folder) return s;
      return { ...s, folders: { ...s.folders, [folderId]: { ...folder, quizIds: folder.quizIds.filter(id => id !== quizId) } } };
    }),
    setCardOrder: (ids) => update(s => ({ ...s, cardOrder: ids })),
    setFolderOrder: (ids) => update(s => ({ ...s, folderOrder: ids })),
    setFolderCardOrder: (folderId, ids) => update(s => ({
      ...s, folderCardOrder: { ...s.folderCardOrder, [folderId]: ids },
    })),
  }), [update]);

  return [state, actions];
}

export const QGHelpers = {
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  makeSession(quiz, config) {
    const n = quiz.questions.length;
    const questionOrder = config.randomizeQuestions
      ? QGHelpers.shuffle(Array.from({ length: n }, (_, i) => i))
      : Array.from({ length: n }, (_, i) => i);
    const choiceOrders = quiz.questions.map((q) => {
      const indices = Array.from({ length: q.choices.length }, (_, i) => i);
      return config.randomizeChoices ? QGHelpers.shuffle(indices) : indices;
    });
    return {
      quizId: quiz.id,
      startedAt: Date.now(),
      finishedAt: null,
      layout: config.layout || 'one',
      feedback: config.feedback || 'submit',
      randomizeQuestions: !!config.randomizeQuestions,
      randomizeChoices: !!config.randomizeChoices,
      questionOrder,
      choiceOrders,
      answers: Array(n).fill(null),
      currentIdx: 0,
      submitted: false,
    };
  },

  scoreSession(quiz, session) {
    let right = 0, wrong = 0, skipped = 0;
    quiz.questions.forEach((q, i) => {
      const ans = session.answers[i];
      if (ans == null) skipped++;
      else if (ans === q.correctIdx) right++;
      else wrong++;
    });
    return {
      right, wrong, skipped,
      total: quiz.questions.length,
      pct: quiz.questions.length ? right / quiz.questions.length : 0,
    };
  },

  formatRelative(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 7) return `${d}d ago`;
    const w = Math.floor(d / 7);
    if (w < 4) return `${w}w ago`;
    return new Date(ts).toLocaleDateString();
  },

  formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
  },

  initialsOf(name) {
    const parts = (name || '').trim().split(/\s+/);
    if (!parts[0]) return 'YO';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },
};
