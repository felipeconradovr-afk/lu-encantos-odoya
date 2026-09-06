'use client';
import { createClient } from '@/lib/supabase/client';

export async function fetchSiteSettings() {
  const supabase = createClient();
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw new Error(error.message);
  return new Map((data || []).map((s: { key: string; value: string }) => [s.key, s.value]));
}

export async function saveSiteSettings(values: { whatsapp: string; instagram: string; about: string }) {
  const supabase = createClient();
  const number = values.whatsapp.replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(number)) {
    throw new Error('Informe um WhatsApp válido com país e DDD.');
  }
  if (
    values.instagram &&
    !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/.test(values.instagram)
  ) {
    throw new Error('Use o endereço HTTPS do perfil oficial no Instagram.');
  }
  const { error } = await supabase.from('site_settings').upsert(
    [
      { key: 'whatsapp', value: number },
      { key: 'instagram', value: values.instagram },
      { key: 'about', value: values.about },
    ] as never,
  );
  if (error) throw new Error(error.message);
  return number;
}
