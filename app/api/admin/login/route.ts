import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { usernameToEmail, isAllowedAdminUsername } from '@/lib/auth/username';

export async function POST(request: Request) {
  const { username, password } = (await request.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  if (!username || !password || !isAllowedAdminUsername(username)) {
    return NextResponse.json(
      { error: 'Usuário ou senha inválidos.' },
      { status: 401 },
    );
  }
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorado se a rota não puder escrever cookies.
          }
        },
      },
    },
  );
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (error) {
    return NextResponse.json(
      { error: 'Usuário ou senha inválidos.' },
      { status: 401 },
    );
  }
  return NextResponse.json({ ok: true });
}
