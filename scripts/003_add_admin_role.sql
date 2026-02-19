-- Add role column to profiles for admin access
alter table public.profiles
  add column if not exists role text default 'user';

-- Add is_banned column for user management
alter table public.profiles
  add column if not exists is_banned boolean default false;

-- Create an admin policy: admins can read all profiles
create policy "admin_select_all_profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create an admin policy: admins can update all profiles
create policy "admin_update_all_profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can read all licenses
create policy "admin_select_all_licenses"
  on public.licenses for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can update all licenses
create policy "admin_update_all_licenses"
  on public.licenses for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can read all activations
create policy "admin_select_all_activations"
  on public.activations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ==============================================
-- IMPORTANT: After running this migration, set yourself as admin:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
-- ==============================================
