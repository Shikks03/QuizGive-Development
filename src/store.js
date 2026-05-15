import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase, signOutUser } from './lib/supabase.js';

const QG_DEFAULTS = {
  user: { name: 'You', initials: 'YO' },
  theme: 'sketch-light',
  font: 'sketch',
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

export function resolveOrder(order, availableIds) {
  const idSet = new Set(availableIds);
  const known = order.filter(id => idSet.has(id));
  const knownSet = new Set(known);
  const novel = availableIds.filter(id => !knownSet.has(id));
  return [...known, ...novel];
}

export function useQGStore() {
  const [state, setState] = useState(() => ({ ...QG_DEFAULTS }));
  const stateRef = useRef(state);
  const [authState, setAuthState] = useState({ session: null, status: 'loading', username: null });
  const prefsTimerRef = useRef(null);
  const pendingPrefsRef = useRef(null);

  useEffect(() => { stateRef.current = state; }, [state]);

  const update = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  // ── load all user data from Supabase ─────────────────────────────
  const loadUserData = useCallback(async (userId) => {
    let profileRes, quizzesRes, foldersRes, sessionsRes, resultsRes, prefsRes;
    try {
      [profileRes, quizzesRes, foldersRes, sessionsRes, resultsRes, prefsRes] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', userId).single(),
        supabase.from('quizzes').select('id, data').eq('user_id', userId),
        supabase.from('folders').select('id, name, quiz_ids').eq('user_id', userId),
        supabase.from('sessions').select('quiz_id, data').eq('user_id', userId),
        supabase.from('results').select('quiz_id, data').eq('user_id', userId),
        supabase.from('user_prefs').select('data').eq('user_id', userId).single(),
      ]);
    } catch (err) {
      console.error('loadUserData network error:', err);
      setState({ ...QG_DEFAULTS });
      setAuthState(prev => ({ ...prev, username: null }));
      return;
    }

    const username = profileRes.data?.username || null;

    const quizzes = {};
    for (const row of quizzesRes.data || []) quizzes[row.id] = row.data;

    const folders = {};
    for (const row of foldersRes.data || []) {
      folders[row.id] = { id: row.id, name: row.name, quizIds: row.quiz_ids || [], createdAt: Date.now() };
    }

    const sessions = {};
    for (const row of sessionsRes.data || []) sessions[row.quiz_id] = row.data;

    const results = {};
    for (const row of resultsRes.data || []) results[row.quiz_id] = row.data;

    const prefs = prefsRes.data?.data || {};

    setState({
      ...QG_DEFAULTS,
      quizzes, folders, sessions, results,
      bookmarks: prefs.bookmarks || [],
      questionBookmarks: prefs.questionBookmarks || {},
      cardOrder: prefs.cardOrder || [],
      folderOrder: prefs.folderOrder || [],
      folderCardOrder: prefs.folderCardOrder || {},
      theme: prefs.theme === 'light' ? 'sketch-light' : prefs.theme === 'dark' ? 'sketch-dark' : prefs.theme || 'sketch-light',
      font: prefs.font || 'sketch',
      recentQuizId: prefs.recentQuizId || null,
      ranOnboarding: prefs.ranOnboarding || false,
      user: { name: username || 'You', initials: (username || 'YO').slice(0, 2).toUpperCase() },
    });

    setAuthState(prev => ({ ...prev, username }));
  }, []);

  // ── auth state subscription ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthState({ session, status: 'authenticated', username: null });
        loadUserData(session.user.id);
      } else {
        setAuthState({ session: null, status: 'unauthenticated', username: null });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuthState(prev => ({ ...prev, session, status: 'authenticated' }));
        // only reload data on explicit sign-in, not on token refresh
        if (event === 'SIGNED_IN') loadUserData(session.user.id);
      } else {
        setAuthState({ session: null, status: 'unauthenticated', username: null });
        setState({ ...QG_DEFAULTS });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ── debounced prefs upsert ────────────────────────────────────────
  const flushPrefs = useCallback(async (prefs, userId) => {
    await supabase.from('user_prefs').upsert({ user_id: userId, data: prefs });
  }, []);

  const schedulePrefsFlush = useCallback((prefs, userId) => {
    pendingPrefsRef.current = { prefs, userId };
    if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
    prefsTimerRef.current = setTimeout(async () => {
      if (pendingPrefsRef.current) {
        const { prefs, userId } = pendingPrefsRef.current;
        pendingPrefsRef.current = null;
        await flushPrefs(prefs, userId);
      }
    }, 500);
  }, [flushPrefs]);

  const updatePrefs = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        const prefs = {
          bookmarks: next.bookmarks,
          questionBookmarks: next.questionBookmarks,
          cardOrder: next.cardOrder,
          folderOrder: next.folderOrder,
          folderCardOrder: next.folderCardOrder,
          theme: next.theme,
          font: next.font,
          recentQuizId: next.recentQuizId,
          ranOnboarding: next.ranOnboarding,
        };
        schedulePrefsFlush(prefs, session.user.id);
      });
      return next;
    });
  }, [schedulePrefsFlush]);

  // ── actions ───────────────────────────────────────────────────────
  const actions = useMemo(() => ({
    setUser: (u) => update((s) => ({ ...s, user: { ...s.user, ...u } })),
    setTheme: (t) => {
      updatePrefs((s) => ({ ...s, theme: t }));
    },
    setFont: (f) => {
      updatePrefs((s) => ({ ...s, font: f }));
    },

    saveQuiz: async (quiz) => {
      update((s) => ({
        ...s,
        quizzes: { ...s.quizzes, [quiz.id]: quiz },
        recentQuizId: quiz.id,
      }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('quizzes').upsert(
        { id: quiz.id, user_id: session.user.id, title: quiz.title, data: quiz },
        { onConflict: 'id' }
      );
      if (error) console.error('saveQuiz:', error);
    },

    renameQuiz: async (id, title) => {
      update((s) => ({ ...s, quizzes: { ...s.quizzes, [id]: { ...s.quizzes[id], title } } }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('quizzes')
        .update({ title })
        .eq('id', id).eq('user_id', session.user.id);
      if (error) console.error('renameQuiz:', error);
    },

    deleteQuiz: async (id) => {
      update((s) => {
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
      });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from('quizzes').delete().eq('id', id).eq('user_id', session.user.id);
      await supabase.from('sessions').delete().eq('quiz_id', id).eq('user_id', session.user.id);
      await supabase.from('results').delete().eq('quiz_id', id).eq('user_id', session.user.id);
    },

    saveSession: async (quizId, session) => {
      update((s) => ({ ...s, sessions: { ...s.sessions, [quizId]: session } }));
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) return;
      const { error } = await supabase.from('sessions').upsert(
        { user_id: authSession.user.id, quiz_id: quizId, data: session }
      );
      if (error) console.error('saveSession:', error);
    },

    clearSession: async (quizId) => {
      update((s) => {
        const { [quizId]: _g, ...sessions } = s.sessions;
        return { ...s, sessions };
      });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from('sessions').delete().eq('quiz_id', quizId).eq('user_id', session.user.id);
    },

    saveResult: async (quizId, summary) => {
      update((s) => ({ ...s, results: { ...s.results, [quizId]: summary } }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('results').upsert(
        { user_id: session.user.id, quiz_id: quizId, data: summary }
      );
      if (error) console.error('saveResult:', error);
    },

    clearResult: async (quizId) => {
      update((s) => {
        const { [quizId]: _g, ...results } = s.results;
        return { ...s, results };
      });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from('results').delete().eq('quiz_id', quizId).eq('user_id', session.user.id);
    },

    toggleBookmark: (quizId) => updatePrefs((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(quizId)
        ? s.bookmarks.filter(x => x !== quizId)
        : [quizId, ...s.bookmarks],
    })),

    toggleQuestionBookmark: (quizId, qIdx) => updatePrefs((s) => {
      const cur = s.questionBookmarks[quizId] || [];
      const next = cur.includes(qIdx) ? cur.filter(x => x !== qIdx) : [...cur, qIdx];
      return { ...s, questionBookmarks: { ...s.questionBookmarks, [quizId]: next } };
    }),

    setRecent: (quizId) => updatePrefs((s) => ({ ...s, recentQuizId: quizId })),
    markOnboarded: () => updatePrefs((s) => ({ ...s, ranOnboarding: true })),

    createFolder: async (name) => {
      const id = 'f_' + Date.now().toString(36);
      const folder = { id, name, quizIds: [], createdAt: Date.now() };
      update((s) => ({ ...s, folders: { ...s.folders, [id]: folder } }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('folders').upsert(
        { id, user_id: session.user.id, name, quiz_ids: [] }
      );
      if (error) console.error('createFolder:', error);
    },

    deleteFolder: async (id) => {
      update((s) => {
        const { [id]: _gone, ...folders } = s.folders;
        return { ...s, folders };
      });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from('folders').delete().eq('id', id).eq('user_id', session.user.id);
    },

    renameFolder: async (id, name) => {
      update((s) => ({ ...s, folders: { ...s.folders, [id]: { ...s.folders[id], name } } }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('folders')
        .update({ name })
        .eq('id', id).eq('user_id', session.user.id);
      if (error) console.error('renameFolder:', error);
    },

    addQuizToFolder: async (folderId, quizId) => {
      const folder = stateRef.current.folders[folderId];
      if (!folder || folder.quizIds.includes(quizId)) return;
      const newQuizIds = [...folder.quizIds, quizId];
      update((s) => ({ ...s, folders: { ...s.folders, [folderId]: { ...s.folders[folderId], quizIds: newQuizIds } } }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('folders')
        .update({ quiz_ids: newQuizIds })
        .eq('id', folderId).eq('user_id', session.user.id);
      if (error) console.error('addQuizToFolder:', error);
    },

    removeQuizFromFolder: async (folderId, quizId) => {
      const folder = stateRef.current.folders[folderId];
      if (!folder) return;
      const newQuizIds = folder.quizIds.filter(id => id !== quizId);
      update((s) => ({ ...s, folders: { ...s.folders, [folderId]: { ...s.folders[folderId], quizIds: newQuizIds } } }));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from('folders')
        .update({ quiz_ids: newQuizIds })
        .eq('id', folderId).eq('user_id', session.user.id);
      if (error) console.error('removeQuizFromFolder:', error);
    },

    setCardOrder: (ids) => updatePrefs(s => ({ ...s, cardOrder: ids })),
    setFolderOrder: (ids) => updatePrefs(s => ({ ...s, folderOrder: ids })),
    setFolderCardOrder: (folderId, ids) => updatePrefs(s => ({
      ...s, folderCardOrder: { ...s.folderCardOrder, [folderId]: ids },
    })),
  }), [update, updatePrefs]);

  const auth = useMemo(() => ({
    session: authState.session,
    status: authState.status,
    username: authState.username,
    signOut: signOutUser,
  }), [authState]);

  return [state, actions, auth];
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
