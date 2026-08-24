-- =========================================
-- IMTEYAZ CATALOG — Database Setup
-- इसे Supabase Dashboard → SQL Editor में
-- पूरा paste करके एक बार Run करें
-- =========================================

-- 1. Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tags text default '',              -- comma-separated: "साड़ी, लाल, ऑफर"
  price text default '',
  size text default '',
  note text default '',
  images text[] default '{}',        -- कई image URLs (multi-angle)
  videos text[] default '{}',        -- कई short video URLs
  created_at timestamptz default now()
);

-- 2. Row Level Security चालू करें
alter table public.products enable row level security;

-- 3. सबको (customer + admin दोनों) पढ़ने की इजाज़त
drop policy if exists "Anyone can read products" on public.products;
create policy "Anyone can read products"
  on public.products for select
  to anon
  using (true);

-- 4. सबको जोड़ने/बदलने/हटाने की इजाज़त
-- (अभी के लिए सादा रखा है ताकि admin.html आसानी से काम करे;
--  आगे चाहें तो password-protected admin बनाकर इसे सख़्त कर सकते हैं)
drop policy if exists "Anyone can manage products" on public.products;
create policy "Anyone can manage products"
  on public.products for all
  to anon
  using (true)
  with check (true);

-- 5. Storage Bucket — images/videos रखने के लिए
insert into storage.buckets (id, name, public)
values ('catalog-media', 'catalog-media', true)
on conflict (id) do nothing;

-- 6. Storage पर पढ़ने/लिखने की इजाज़त
drop policy if exists "Public read catalog-media" on storage.objects;
create policy "Public read catalog-media"
  on storage.objects for select
  to anon
  using (bucket_id = 'catalog-media');

drop policy if exists "Public upload catalog-media" on storage.objects;
create policy "Public upload catalog-media"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'catalog-media');

drop policy if exists "Public delete catalog-media" on storage.objects;
create policy "Public delete catalog-media"
  on storage.objects for delete
  to anon
  using (bucket_id = 'catalog-media');
