'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

let cached: Promise<{ email?: string } | null> | null = null;
function loadSession() {
  if (!cached) {
    cached = createClient()
      .auth.getSession()
      .then(({ data }) => data.session?.user ?? null)
      .catch(() => null);
  }
  return cached;
}

const initialSession: Promise<{ email?: string } | null> =
  typeof window !== 'undefined' && isSupabaseConfigured()
    ? loadSession()
    : Promise.resolve(null);

export function useAdminSession() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    void initialSession
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível verificar a sessão.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      cached = Promise.resolve(next);
      setUser(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured]);
  // Após carregamento inicial, valida via getUser() (cookie) para detectar
  // sessões criadas por login server-side (API route), que não preenchem o
  // localStorage automaticamente.
  const [cookieChecked, setCookieChecked] = useState(false);
  if (configured && !cookieChecked) {
    setCookieChecked(true);
    void createClient()
      .auth.getUser()
      .then(({ data }) => {
        const next = data.user ?? null;
        if (next && next.email) {
          setUser(next);
        }
      })
      .catch(() => {});
  }
  async function refresh() {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    setError('');
    try {
      // getUser() valida o JWT do cookie de sessão (server-side login).
      // getSession() só lê o localStorage, que fica vazio quando o login
      // é feito por uma API route do Next.
      const { data } = await createClient().auth.getUser();
      const next = data.user ?? null;
      cached = Promise.resolve(next);
      setUser(next);
    } catch {
      setError('Não foi possível verificar a sessão.');
    } finally {
      setLoading(false);
    }
  }
  return { user, loading, error, refresh };
}

export async function signOutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
