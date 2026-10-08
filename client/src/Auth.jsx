import { useState } from 'react';
import { api } from './api.js';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: form });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">
          {mode === 'login' ? 'Log in to see your tasks.' : 'Start tracking your tasks in a minute.'}
        </p>
        {mode === 'register' && (
          <label>Name<input value={form.name} onChange={set('name')} required /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" minLength={6} value={form.password} onChange={set('password')} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
        <button type="button" className="link" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Already registered? Log in'}
        </button>
      </form>
    </main>
  );
}
