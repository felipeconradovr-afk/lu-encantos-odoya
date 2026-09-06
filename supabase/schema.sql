-- Lu by Encantos Odoyá — schema oficial (fonte única: Supabase).
-- Rode no SQL Editor do projeto (sem CLI local). Idempotente.
create extension if not exists "pgcrypto";

-- Categorias ---------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists categories_position_idx on public.categories (position);
create index if not exists categories_active_idx on public.categories (active);

-- Produtos -----------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10, 2),
  category_id uuid references public.categories (id) on delete set null,
  materials text not null default '',
  size text not null default 'A combinar',
  colors text not null default '',
  status text not null default 'Sob encomenda'
    check (status in ('Disponível', 'Sob encomenda', 'Peça única', 'Esgotado')),
  production_time text not null default 'Prazo a combinar',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_code_format check (code ~ '^LU-[0-9]{3,}$')
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (active);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_sort_idx on public.products (sort_order);
create index if not exists products_status_idx on public.products (status);

-- Imagens ------------------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx
  on public.product_images (product_id, position);

-- Configurações do site ----------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- updated_at automático ----------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.site_settings;
create trigger settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- RLS ----------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.site_settings enable row level security;

-- Leitura pública: só o necessário para o catálogo.
drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories
  for select to anon, authenticated using (active = true);
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
  for select to anon, authenticated using (active = true);
drop policy if exists "public read product images" on public.product_images;
create policy "public read product images" on public.product_images
  for select to anon, authenticated using (true);
drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings" on public.site_settings
  for select to anon, authenticated using (true);

-- Escrita: apenas usuário autenticado (login do /admin).
drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories
  for all to authenticated using (true) with check (true);
drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products
  for all to authenticated using (true) with check (true);
drop policy if exists "admin manage product images" on public.product_images;
create policy "admin manage product images" on public.product_images
  for all to authenticated using (true) with check (true);
drop policy if exists "admin manage site settings" on public.site_settings;
create policy "admin manage site settings" on public.site_settings
  for all to authenticated using (true) with check (true);

-- Storage ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public view product images" on storage.objects;
create policy "public view product images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
