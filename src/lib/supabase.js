import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function toSyntheticEmail(username) {
  return `${username.toLowerCase()}@quizgive.local`;
}

const USERNAME_RE = /^[a-z0-9_]{3,24}$/i;

export async function signUpUser({ username, password }) {
  if (!USERNAME_RE.test(username)) {
    return { error: 'Username must be 3–24 characters: letters, numbers, underscores only.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: toSyntheticEmail(username),
    password,
    options: { data: { username: username.toLowerCase() } },
  });

  if (error) {
    if (error.message?.toLowerCase().includes('already registered') || error.code === '23505') {
      return { error: 'Username is already taken.' };
    }
    return { error: error.message };
  }

  // migrate existing local data if present
  if (data.user) {
    await migrateLocalData(data.user.id);
  }

  return { data };
}

export async function signInUser({ username, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toSyntheticEmail(username),
    password,
  });

  if (error) {
    if (error.message?.toLowerCase().includes('invalid login')) {
      return { error: 'Invalid username or password.' };
    }
    return { error: error.message };
  }

  return { data };
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

async function migrateLocalData(userId) {
  if (localStorage.getItem('quizgive.migrated') === 'true') return;

  const raw = localStorage.getItem('quizgive.v1');
  if (!raw) return;

  let local;
  try { local = JSON.parse(raw); } catch { return; }

  const quizzes = Object.values(local.quizzes || {});
  const folders = Object.values(local.folders || {});
  const sessions = Object.entries(local.sessions || {});
  const results = Object.entries(local.results || {});

  if (quizzes.length > 0) {
    await supabase.from('quizzes').upsert(
      quizzes.map(q => ({ id: q.id, user_id: userId, title: q.title, data: q })),
      { onConflict: 'id' }
    );
  }

  if (folders.length > 0) {
    await supabase.from('folders').upsert(
      folders.map(f => ({ id: f.id, user_id: userId, name: f.name, quiz_ids: f.quizIds || [] })),
      { onConflict: 'id' }
    );
  }

  for (const [quizId, session] of sessions) {
    await supabase.from('sessions').upsert({ user_id: userId, quiz_id: quizId, data: session });
  }

  for (const [quizId, result] of results) {
    await supabase.from('results').upsert({ user_id: userId, quiz_id: quizId, data: result });
  }

  const prefs = {
    bookmarks: local.bookmarks || [],
    questionBookmarks: local.questionBookmarks || {},
    cardOrder: local.cardOrder || [],
    folderOrder: local.folderOrder || [],
    folderCardOrder: local.folderCardOrder || {},
    theme: local.theme || 'light',
    recentQuizId: local.recentQuizId || null,
    ranOnboarding: local.ranOnboarding || false,
  };

  await supabase.from('user_prefs').upsert({ user_id: userId, data: prefs });

  localStorage.setItem('quizgive.migrated', 'true');
}
