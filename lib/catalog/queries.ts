'use client';
import { createClient } from '@/lib/supabase/client';
import { publicImageUrl } from '@/lib/supabase/env';
import {


  initialSettings,
  type Product,
  type Settings,
} from '@/lib/catalog';
import type { ProductRow } from '@/lib/database.types';

export type CatalogSnapshot = {
  products: Product[];
  categories: string[];
  settings: Settings;
  fromDatabase: boolean;
};

function mapRows(rows: ProductRow[]): { products: Product[]; categories: string[] } {
  const categoryById = new Map<string, string>();
  const products: Product[] = rows.map((row, index) => {
    const category = ((row as unknown as { category?: { name?: string } }).category?.name
      || '') as string;
    if (row.category_id && category && !categoryById.has(row.category_id)) {
      categoryById.set(row.category_id, category);
    }
    const images = (
      (row as unknown as { images?: { storage_path: string; position: number }[] }).images || []
    )
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((img) => publicImageUrl(img.storage_path));
    return {
      code: row.code,
      slug: row.slug,
      name: row.name,
      category,
      description: row.description,
      materials: row.materials,
      size: row.size,
      colors: row.colors,
      price: row.price === null ? null : Number(row.price),
      status: row.status,
      leadTime: row.production_time,
      images,
      featured: row.featured,
      active: row.active,
      order: row.sort_order || index + 1,
      additional:
        'Peça artesanal: cores e acabamentos podem variar. Confirme medidas, materiais, valor e envio antes de fechar o pedido.',
    };
  });
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  return { products, categories };
}

export async function fetchCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    const supabase = createClient();
    const [productsRes, categoriesRes, settingsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(name), images:product_images(storage_path,position)')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').eq('active', true).order('position'),
      supabase.from('site_settings').select('*'),
    ]);
    if (productsRes.error || !productsRes.data) throw new Error("Não foi possível carregar o catálogo.");
    const rows = productsRes.data as unknown as ProductRow[];

    const { products } = mapRows(rows);
    const categories = !categoriesRes.error && categoriesRes.data?.length
      ? (categoriesRes.data as { name: string }[]).map((c) => c.name)
      : [...new Set(products.map((p) => p.category).filter(Boolean))];
    const settingsMap = new Map(
      (!settingsRes.error ? settingsRes.data || [] : []).map((s: { key: string; value: string }) => [s.key, s.value]),
    );
    return {
      products,
      categories,
      settings: {
        whatsapp: settingsMap.get('whatsapp') || initialSettings.whatsapp,
        instagram: settingsMap.get('instagram') || '',
        headline: initialSettings.headline,
        about: settingsMap.get('about') || initialSettings.about,
      },
      fromDatabase: true,
    };
  } catch {
    throw new Error("Não foi possível carregar o catálogo.");
  }
}
