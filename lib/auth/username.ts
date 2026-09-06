// O /admin exibe só "Usuário/Senha". O Supabase Auth usa um e-mail
// técnico interno; a conversão acontece exclusivamente no servidor.
export function usernameToEmail(username: string) {
  const clean = username.trim().toLowerCase();
  const domain = process.env.ADMIN_EMAIL_DOMAIN || 'admin.local';
  return `${clean}@${domain}`;
}

export function isAllowedAdminUsername(username: string) {
  const allowed = (process.env.ADMIN_USERNAME || 'luencantosodoya')
    .split(',')
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(username.trim().toLowerCase());
}
