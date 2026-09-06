import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { usernameToEmail } from '@/lib/auth/username';

export async function POST(request: Request) {
  const { username, currentPassword, newPassword } = (await request
    .json()
    .catch(() => ({}))) as {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  if (!username || !currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Preencha a senha atual e a nova senha.' },
      { status: 400 },
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'A nova senha precisa de pelo menos 8 caracteres.' },
      { status: 400 },
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
  // Revalida a senha atual antes de trocar: a antiga para de funcionar.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password: currentPassword,
  });
  if (signInError) {
    return NextResponse.json(
      { error: 'A senha atual está incorreta.' },
      { status: 401 },
    );
  }
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return NextResponse.json(
      { error: 'Não foi possível trocar a senha agora.' },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
