-- Faskes mitra SYCLE (Master V2.1 6.4: "Faskes mitra dari tabel yang diisi tim").
-- BELUM DIJALANKAN di Supabase. Jalankan hanya setelah disetujui tim.
-- Sesuai FR-15/AC-26: tabel ini sengaja TIDAK punya kolom telepon, email, atau kontak lain.

create table if not exists public.healthcare_partners (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  facility_type text not null check (facility_type in ('hospital', 'puskesmas', 'clinic', 'midwife', 'doctor')),
  address       text,
  latitude      double precision not null check (latitude between -12 and 7),
  longitude     double precision not null check (longitude between 94 and 142),
  services      text[] not null default '{}',
  -- Rujukan ke objek OpenStreetMap (mis. "node/123"), agar faskes yang sama tidak tampil dua kali.
  osm_ref       text unique,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.healthcare_partners enable row level security;

-- Guest dan Member boleh membaca mitra yang aktif. Tidak ada kebijakan insert/update/delete:
-- data hanya diisi tim lewat dashboard Supabase (service role).
create policy "healthcare_partners_select_active"
  on public.healthcare_partners
  for select
  to anon, authenticated
  using (is_active = true);
