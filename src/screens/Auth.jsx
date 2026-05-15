import { useState } from 'react';
import { signUpUser, signInUser } from '../lib/supabase.js';
import { QGLogo } from '../components/Shell.jsx';

export function QGAuthScreen() {
  const [tab, setTab] = useState('login');

  return (
    <div className="qg-auth-wrap">
      <div className="qg-auth-card qg-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <QGLogo size={32} />
        </div>
        <div className="qg-auth-tabs">
          <button
            className={`qg-auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log in
          </button>
          <button
            className={`qg-auth-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign up
          </button>
        </div>
        {tab === 'login' ? <LoginForm /> : <SignupForm onSuccess={() => setTab('login')} />}
      </div>
    </div>
  );
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) return setError('Enter a username.');
    if (!password) return setError('Enter a password.');
    setLoading(true);
    const { error } = await signInUser({ username: username.trim(), password });
    setLoading(false);
    if (error) setError(error);
    // on success Supabase auth listener in store triggers re-render
  };

  return (
    <form onSubmit={submit}>
      <label className="qg-h3" style={{ display: 'block', marginBottom: 6 }}>Username</label>
      <input
        className="qg-input"
        style={{ width: '100%', marginBottom: 12 }}
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoFocus
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="your_username"
      />
      <label className="qg-h3" style={{ display: 'block', marginBottom: 6 }}>Password</label>
      <input
        className="qg-input"
        style={{ width: '100%', marginBottom: 16 }}
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      {error && <p className="qg-auth-error">{error}</p>}
      <button className="qg-btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[a-z0-9_]{3,24}$/i.test(username.trim())) {
      return setError('Username must be 3–24 characters: letters, numbers, underscores only.');
    }
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    const { error } = await signUpUser({ username: username.trim(), password });
    setLoading(false);
    if (error) setError(error);
    // on success auth listener triggers re-render automatically
  };

  return (
    <form onSubmit={submit}>
      <label className="qg-h3" style={{ display: 'block', marginBottom: 6 }}>Username</label>
      <input
        className="qg-input"
        style={{ width: '100%', marginBottom: 4 }}
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoFocus
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="your_username"
        maxLength={24}
      />
      <p className="qg-muted" style={{ fontSize: 11, marginTop: 2, marginBottom: 12 }}>
        3–24 chars, letters/numbers/underscores
      </p>
      <label className="qg-h3" style={{ display: 'block', marginBottom: 6 }}>Password</label>
      <input
        className="qg-input"
        style={{ width: '100%', marginBottom: 12 }}
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="min 8 characters"
      />
      <label className="qg-h3" style={{ display: 'block', marginBottom: 6 }}>Confirm password</label>
      <input
        className="qg-input"
        style={{ width: '100%', marginBottom: 16 }}
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="••••••••"
      />
      {error && <p className="qg-auth-error">{error}</p>}
      <button className="qg-btn primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
