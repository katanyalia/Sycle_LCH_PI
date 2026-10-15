-- =====================================================================================
-- SYCLE V2 — Migration 001: tabel profiles + RLS (owner-only)
-- Tahap 5 (Autentikasi & Profil). Belum dijalankan — tunggu persetujuan pemilik proyek.
--
-- Cara menjalankan (setelah disetujui): Supabase Dashboard → SQL Editor → New query →
-- tempel seluruh isi file ini → Run. Aman dijalankan ulang (idempotent).
--
-- Prinsip (Master Draft 6.4, CLAUDE.md §7):
--   * Identitas akun ada di auth.users (dikelola Supabase Auth).
--   * profiles hanya menyimpan nama tampilan; tidak ada data kesehatan di sini.
--   * RLS wajib aktif: setiap Member hanya dapat membaca & mengubah profilnya sendiri.
--   * Tidak ada kebijakan DELETE untuk pengguna: profil terhapus otomatis (ON DELETE CASCADE)
--     saat akun dihapus melalui fitur penghapusan akun (Tahap 7, server-side).
-- =====================================================================================

-- 1) Tabel
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    check (char_length(btrim(display_name)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'SYCLE V2: profil Member (nama tampilan). Owner-only via RLS.';

-- 2) Row Level Security
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Guest (anon) tidak punya akses sama sekali.
revoke all on table public.profiles from anon;
grant select, insert, update on table public.profiles to authenticated;

-- 3) updated_at otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 4) Profil dibuat otomatis saat akun baru terdaftar.
--    Nama diambil dari metadata pendaftaran (display_name), dipotong maks. 60 karakter.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 'Pengguna SYCLE'), 60)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Fungsi trigger tidak boleh dipanggil langsung lewat API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Isi profil untuk akun yang sudah terdaftar sebelum migration ini (bila ada).
insert into public.profiles (id, display_name)
select
  u.id,
  left(coalesce(nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''), 'Pengguna SYCLE'), 60)
from auth.users u
on conflict (id) do nothing;

-- -------------------------------------------------------------------------------------
-- ROLLBACK (jalankan manual hanya bila perlu membatalkan migration ini):
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop function if exists public.handle_new_user();
--   drop table if exists public.profiles;
--   drop function if exists public.set_updated_at();
-- -------------------------------------------------------------------------------------
