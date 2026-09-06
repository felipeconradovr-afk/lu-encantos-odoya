export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function publicImageUrl(storagePath: string) {
  return `${supabaseUrl().replace(/\/$/, '')}/storage/v1/object/public/product-images/${storagePath.replace(/^\//, '')}`;
}
