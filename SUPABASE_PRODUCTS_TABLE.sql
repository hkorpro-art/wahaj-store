create table if not exists public.production_products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric not null,
  compare_at numeric,
  rating numeric not null default 5,
  reviews integer not null default 0,
  badges jsonb not null default '[]'::jsonb,
  status jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  stock integer not null default 0,
  inventory_status text not null default 'متوفر',
  description text not null default '',
  material text not null default '',
  tags jsonb not null default '[]'::jsonb,
  views integer not null default 0,
  sold integer not null default 0,
  visible boolean not null default true,
  discount_ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.production_products enable row level security;

drop policy if exists "Products are public to read" on public.production_products;
create policy "Products are public to read"
  on public.production_products
  for select
  using (true);
