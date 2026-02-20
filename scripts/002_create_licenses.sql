-- ============================================
-- LICENSE KEYS TABLE
-- Stores license keys generated after Stripe payment
-- ============================================
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  license_key text unique not null,
  product_id text not null,
  stripe_payment_intent_id text unique,
  max_activations int default 1,
  is_revoked boolean default false,
  last_force_takeover_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- MACHINE ACTIVATIONS TABLE
-- Stores machine_id bindings per license
-- ============================================
create table if not exists public.activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id) on delete cascade,
  machine_id text not null,
  machine_label text,
  activated_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  unique(license_id, machine_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.licenses enable row level security;
alter table public.activations enable row level security;

-- Users can only read their own licenses
create policy "licenses_select_own"
  on public.licenses for select
  using (auth.uid() = user_id);

-- Users can read activations for their own licenses
create policy "activations_select_own"
  on public.activations for select
  using (
    license_id in (
      select id from public.licenses where user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES for fast lookups
-- ============================================
create index if not exists idx_licenses_key on public.licenses(license_key);
create index if not exists idx_licenses_user on public.licenses(user_id);
create index if not exists idx_activations_license on public.activations(license_id);
