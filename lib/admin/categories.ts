'use client';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/catalog';

export async function createCategory(name: string) {
  const supabase = createClient();
  const clean = name.trim();
  if (!clean) throw new Error('Digite uma categoria nova.');
  const { data: existing } = await supabase
    .from('categories')
    .select('position')
    .order('position', { ascending: false })
    .limit(1);
  const position = (existing?.[0]?.position ?? 0) + 1;
  const { error } = await supabase.from('categories').insert({
    name: clean,
    slug: `${slugify(clean)}`,
    position,
    active: true,
  });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) throw new Error('Essa categoria já existe.');
    throw new Error(error.message);
  }
}

export async function renameCategory(id: string, name: string) {
  const supabase = createClient();
  const clean = name.trim();
  if (!clean) throw new Error('Digite o novo nome.');
  const { error } = await supabase
    .from('categories')
    .update({ name: clean, slug: slugify(clean) })
    .eq('id', id);
  if (error) {
    if (/duplicate|unique/i.test(error.message)) throw new Error('Já existe categoria com esse nome.');
    throw new Error(error.message);
  }
}

export async function setCategoryActive(id: string, active: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from('categories').update({ active }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);
  if ((count || 0) > 0) {
    throw new Error('Mova as peças dessa categoria antes de excluir.');
  }
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderCategories(idsInOrder: string[]) {
  const supabase = createClient();
  const updates = await Promise.all(
    idsInOrder.map((id, index) =>
      supabase.from('categories').update({ position: index + 1 }).eq('id', id),
    ),
  );
  const failed = updates.find((u) => u.error);
  if (failed?.error) throw new Error(failed.error.message);
}
