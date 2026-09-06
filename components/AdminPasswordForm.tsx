'use client';
import { useState, type SyntheticEvent } from 'react';

export function AdminPasswordForm({ username }: { username: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  async function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setState('error');
      setMessage('A confirmação não confere com a nova senha.');
      return;
    }
    setState('saving');
    setMessage('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState('error');
        setMessage(data.error || 'Não foi possível trocar a senha.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setState('saved');
      setMessage('Senha trocada. A antiga já parou de funcionar.');
    } catch {
      setState('error');
      setMessage('Não foi possível trocar a senha agora.');
    }
  }
  return (
    <form className="admin-narrow" onSubmit={submit}>
      <h2>
        Trocar a<br />
        sua <em>senha.</em>
      </h2>
      <div className="field">
        <label htmlFor="senha-atual">Senha atual</label>
        <input
          id="senha-atual"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="senha-nova">Nova senha (mín. 8 caracteres)</label>
        <input
          id="senha-nova"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="senha-confirmar">Confirmar nova senha</label>
        <input
          id="senha-confirmar"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {message && (
        <p role={state === 'error' ? 'alert' : 'status'} className={state === 'error' ? 'form-error' : 'form-feedback'}>
          {message}
        </p>
      )}
      <button className="button" type="submit" disabled={state === 'saving'}>
        {state === 'saving' ? 'Salvando…' : 'Salvar nova senha'}
      </button>
    </form>
  );
}
