'use client';
import { createClient } from '@/lib/supabase/client';
import { publicImageUrl } from '@/lib/supabase/env';
import { slugify, type Product, type ProductStatus } from '@/lib/catalog';
import type { ProductImageRow, ProductRow } from '@/lib/database.types';

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  position: number;
  active: boolean;
  count: number;
};

export function supabaseImageUrl(storagePath: string) {
  return publicImageUrl(storagePath);
}

function mapProduct(
  row: ProductRow & {
    category?: { name?: string } | null;
    images?: Pick<ProductImageRow, 'id' | 'storage_path' | 'position' | 'is_primary'>[];
  },
  index: number,
): Product & { dbId: string } {
  const images = (row.images || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => publicImageUrl(img.storage_path));
  return {
    dbId: row.id,
    code: row.code,
    slug: row.slug,
    name: row.name,
    category: row.category?.name || '',
    description: row.description,
    materials: row.materials,
    size: row.size,
    colors: row.colors,
    price: row.price === null ? null : Number(row.price),
    status: row.status as ProductStatus,
    leadTime: row.production_time,
    images,
    featured: row.featured,
    active: row.active,
    order: row.sort_order || index + 1,
    additional:
      'Peça artesanal: cores e acabamentos podem variar. Confirme medidas, materiais, valor e envio antes de fechar o pedido.',
  };
}

export async function fetchAdminCatalog() {
  const supabase = createClient();
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(name), images:product_images(id,storage_path,position,is_primary)')
      .order('sort_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*, products(count)')
      .order('position', { ascending: true }),
  ]);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (categoriesRes.error) throw new Error(categoriesRes.error.message);
  const products = ((productsRes.data || []) as unknown as Parameters<typeof mapProduct>[0][]).map(mapProduct);
  const categories: AdminCategory[] = ((categoriesRes.data || []) as unknown as {
    id: string;
    name: string;
    slug: string;
    position: number;
    active: boolean;
    products?: { count: number }[];
  }[]).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
    active: c.active,
    count: c.products?.[0]?.count ?? 0,
  }));
  return { products, categories };
}

export type ProductInput = {
  code: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  categoryId: string | null;
  materials: string;
  size: string;
  colors: string;
  status: ProductStatus;
  productionTime: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export function validateProductInput(input: ProductInput) {
  const code = input.code.trim().toUpperCase();
  const slug = slugify(input.slug || input.name);
  if (!input.name.trim() || !/^LU-\d{3,}$/.test(code) || !slug) {
    return { error: 'Confira nome, código LU-001 e endereço da peça.' };
  }
  if (input.price !== null && (!Number.isFinite(input.price) || input.price < 0)) {
    return { error: 'Confira o preço: use vazio para “sob consulta”.' };
  }
  return { code, slug };
}

export async function saveProduct(input: ProductInput, id?: string) {
  const supabase = createClient();
  const payload = {
    code: input.code,
    name: input.name.trim(),
    slug: input.slug,
    description: input.description,
    price: input.price,
    category_id: input.categoryId,
    materials: input.materials,
    size: input.size,
    colors: input.colors,
    status: input.status,
    production_time: input.productionTime,
    featured: input.featured,
    active: input.active,
    sort_order: input.sortOrder,
  };
  const query = id
    ? supabase.from('products').update(payload).eq('id', id).select('id')
    : supabase.from('products').insert(payload).select('id');
  const { data, error } = await query;
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      throw new Error('Já existe uma peça com esse código ou endereço.');
    }
    throw new Error(error.message);
  }
  return data?.[0]?.id as string | undefined;
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { data: images } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('product_id', id);
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  if (images?.length) {
    await supabase.storage
      .from('product-images')
      .remove(images.map((img) => img.storage_path));
  }
}

export async function setProductActive(id: string, active: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from('products').update({ active }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setProductFeatured(id: string, featured: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from('products').update({ featured }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderProducts(idsInOrder: string[]) {
  const supabase = createClient();
  const updates = await Promise.all(
    idsInOrder.map((id, index) =>
      supabase.from('products').update({ sort_order: index + 1 }).eq('id', id),
    ),
  );
  const failed = updates.find((u) => u.error);
  if (failed?.error) throw new Error(failed.error.message);
}

export async function duplicateProduct(id: string) {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from('products')
    .select('*, images:product_images(storage_path,position,is_primary)')
    .eq('id', id)
    .single();
  if (error || !row) throw new Error(error?.message || 'Peça não encontrada.');
  const base = row as unknown as ProductRow & {
    images: { storage_path: string; position: number; is_primary: boolean }[];
  };
  const { data: codes } = await supabase.from('products').select('code');
  const max = Math.max(
    0,
    ...((codes || []).map((c: { code: string }) => Number(String(c.code).replace('LU-', '')) || 0)),
  );
  const code = `LU-${String(max + 1).padStart(3, '0')}`;
  const slugBase = slugify(`${base.name} copia`);
  const { data: created, error: createError } = await supabase
    .from('products')
    .insert({
      code,
      name: `${base.name} (cópia)`,
      slug: `${slugBase}-${code.toLowerCase()}`,
      description: base.description,
      price: base.price,
      category_id: base.category_id,
      materials: base.materials,
      size: base.size,
      colors: base.colors,
      status: base.status,
      production_time: base.production_time,
      featured: false,
      active: false,
      sort_order: base.sort_order + 1,
    })
    .select('id')
    .single();
  if (createError || !created) {
    throw new Error(createError?.message || 'Não foi possível duplicar.');
  }
  const newId = (created as { id: string }).id;
  if (base.images?.length) {
    const copies = base.images.map((img, index) => {
      const ext = img.storage_path.split('.').pop() || 'webp';
      return {
        product_id: newId,
        storage_path: `${newId}/copia-${Date.now()}-${index}.${ext}`,
        position: img.position,
        is_primary: img.is_primary,
      };
    });
    // Copia os arquivos no Storage para a cópia ser independente.
    for (let i = 0; i < base.images.length; i += 1) {
      const { data: file } = await supabase.storage
        .from('product-images')
        .download(base.images[i].storage_path);
      if (file) {
        await supabase.storage.from('product-images').upload(copies[i].storage_path, file, {
          contentType: file.type || 'image/webp',
          upsert: true,
        });
      }
    }
    await supabase.from('product_images').insert(copies);
  }
  return { id: newId, code };
}

export async function uploadProductImages(productId: string, files: File[]) {
  const supabase = createClient();
  if (files.length > 6) throw new Error('Use até 6 fotos por peça.');
  for (const file of files) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      throw new Error('Envie JPG, PNG ou WebP de até 3 MB por imagem.');
    }
  }
  const { data: existing } = await supabase
    .from('product_images')
    .select('position')
    .eq('product_id', productId)
    .order('position', { ascending: false })
    .limit(1);
  let position = (existing?.[0]?.position ?? -1) + 1;
  const uploaded: { storage_path: string; position: number; is_primary: boolean }[] = [];
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const storagePath = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    const assigned = position++;
    uploaded.push({ storage_path: storagePath, position: assigned, is_primary: assigned === 0 });
  }
  const { error: insertError } = await supabase.from('product_images').insert(
    uploaded.map((img) => ({ ...img, product_id: productId })),
  );
  if (insertError) throw new Error(insertError.message);
  return uploaded.map((img) => publicImageUrl(img.storage_path));
}

export async function removeProductImage(productId: string, imageUrl: string) {
  const supabase = createClient();
  const storagePath = imageUrl.split('/product-images/')[1];
  if (!storagePath) throw new Error('Imagem inválida.');
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)
    .eq('storage_path', storagePath);
  if (error) throw new Error(error.message);
  await supabase.storage.from('product-images').remove([storagePath]);
}

export async function setPrimaryImage(productId: string, imageUrl: string) {
  const supabase = createClient();
  const storagePath = imageUrl.split('/product-images/')[1];
  if (!storagePath) throw new Error('Imagem inválida.');
  const { data: images } = await supabase
    .from('product_images')
    .select('id,storage_path')
    .eq('product_id', productId);
  if (!images) return;
  await Promise.all(
    images.map((img) =>
      supabase
        .from('product_images')
        .update({ is_primary: img.storage_path === storagePath })
        .eq('id', img.id),
    ),
  );
}
