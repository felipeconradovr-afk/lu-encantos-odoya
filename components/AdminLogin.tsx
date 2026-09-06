'use client';
import { useState, type SyntheticEvent } from 'react';

export function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState('luencantosodoya');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [message, setMessage] = useState('');
  async function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('saving');
    setMessage('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(data.error || 'Usuário ou senha inválidos.');
        setStatus('error');
        return;
      }
      setPassword('');
      onLoggedIn();
    } catch {
      setMessage('Não foi possível entrar agora. Tente de novo.');
      setStatus('error');
    }
  }
  return (
    <section className="section admin-login">
      <p className="eyebrow">Área da Lu</p>
      <h1>
        Um cantinho
        <br />
        para seus <em>encantos.</em>
      </h1>
      <div className="login-box">
        <h2>Entrar no painel</h2>
        <p>
          Acesso reservado à Lu e às pessoas autorizadas. O catálogo público
          continua aberto para todo mundo.
        </p>
        <form className="admin-narrow" onSubmit={submit}>
          <div className="field">
            <label htmlFor="admin-username">Usuário</label>
            <input
              id="admin-username"
              autoComplete="username"
              required
              maxLength={60}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="admin-password">Senha</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && (
            <p role="alert" className="form-error">
              {message}
            </p>
          )}
          <button className="button" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Entrando…' : 'Entrar ↗'}
          </button>
        </form>
        <p className="demo-note">
          Sem conta pública, sem cadastro: só quem tem a senha entra.
        </p>
      </div>
    </section>
  );
}
