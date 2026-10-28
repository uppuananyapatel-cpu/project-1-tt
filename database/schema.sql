-- Travel Tourism database schema (Supabase PostgreSQL)
-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country text not null,
  category text not null check (category in ('Mountains', 'Beach', 'Culture', 'Nature')),
  description text not null check (char_length(description) between 10 and 220),
  long_description text not null,
  price_from integer not null check (price_from >= 0),
  duration_days integer not null default 3 check (duration_days between 1 and 60),
  is_active boolean not null default true,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_email text not null check (char_length(customer_email) <= 254),
  destination_id uuid not null references public.destinations(id) on delete restrict,
  travel_date date not null check (travel_date >= current_date),
  travellers integer not null check (travellers between 1 and 10),
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists destinations_active_order_idx
  on public.destinations (is_active, display_order, name);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_destination_date_idx on public.bookings (destination_id, travel_date);

-- Public clients must not access tables directly. The Express server uses its
-- server-side secret key and validates every request. Never expose that key.
alter table public.destinations enable row level security;
alter table public.bookings enable row level security;

-- No anon/authenticated policies are intentionally created. Direct client access
-- is denied by RLS; the server-side service key bypasses RLS and must stay secret.

insert into public.destinations
  (name, slug, country, category, description, long_description, price_from, duration_days, display_order)
values
  ('Munnar', 'munnar', 'Kerala, India', 'Mountains',
   'Misty tea gardens, winding roads, and cool mountain mornings.',
   'Escape into rolling tea plantations, misty viewpoints, and quiet nature trails in the Western Ghats. This sample estimate is an inspiration price, not a live quote.',
   8500, 3, 1),
  ('Goa', 'goa', 'India', 'Beach',
   'Golden beaches, coastal cafés, and relaxed sunset strolls.',
   'Spend your days exploring sandy shores, colourful markets, Portuguese-influenced streets, and coastal food spots. This sample estimate is an inspiration price, not a live quote.',
   9500, 4, 2),
  ('Jaipur', 'jaipur', 'Rajasthan, India', 'Culture',
   'Historic forts, rose-coloured streets, and artisan markets.',
   'Discover grand forts, palace courtyards, traditional crafts, and the vivid colours of Rajasthan. This sample estimate is an inspiration price, not a live quote.',
   7800, 3, 3),
  ('Manali', 'manali', 'Himachal Pradesh, India', 'Mountains',
   'Pine forests, Himalayan views, and riverside escapes.',
   'Enjoy mountain scenery, local cafés, forest walks, and nearby valley villages. Weather and road conditions can change by season. This sample estimate is an inspiration price, not a live quote.',
   11000, 4, 4),
  ('Hampi', 'hampi', 'Karnataka, India', 'Culture',
   'Ancient stone temples, boulder landscapes, and rich history.',
   'Explore the remarkable ruins and temple complexes of the Vijayanagara Empire among a dramatic landscape of giant boulders. This sample estimate is an inspiration price, not a live quote.',
   6200, 2, 5),
  ('Andaman Islands', 'andaman-islands', 'India', 'Beach',
   'Clear blue water, quiet coves, and island adventures.',
   'Find tropical shorelines, marine life, and peaceful island scenery. Travel and ferry schedules need to be checked before booking. This sample estimate is an inspiration price, not a live quote.',
   18500, 5, 6)
on conflict (slug) do nothing;
