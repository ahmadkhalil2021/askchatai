import { useState } from 'react';
import { register, login } from './api';

export default function LoginPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'register' ? register : login;
      const user = await fn(email, password);
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page">
      <form id="login-form" onSubmit={submit}>
        <div id="login-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
            <path d="M8 9h8"/>
            <path d="M8 13h5"/>
            <path d="M12 17a2 2 0 0 0 2-2V9a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z"/>
          </svg>
          <span>AskChatAI</span>
        </div>
        <h2>{mode === 'login' ? 'Anmelden' : 'Registrieren'}</h2>
        {error && <div className="login-error">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Anmelden' : 'Registrieren'}
        </button>
        <p className="login-switch">
          {mode === 'login' ? 'Kein Account? ' : 'Bereits registriert? '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Registrieren' : 'Anmelden'}
          </button>
        </p>
      </form>
    </div>
  );
}
