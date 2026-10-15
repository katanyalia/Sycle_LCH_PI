-- =====================================================================================
-- SYCLE V2 — Migration 002: Health Tracker (catatan tersimpan) + RLS owner-only
-- Tahap 6. DRAF — belum dijalankan; tunggu persetujuan pemilik proyek.
--
-- Prinsip (Master Draft Tahap 3 & 6.4, CLAUDE.md §6–7):
--   * Catatan hanya dibuat oleh tindakan eksplisit "Simpan Catatan" (tidak ada autosave).
--   * Kode jawaban persis Master Draft Tahap 3; jawaban cabang hanya boleh ada sesuai konteks.
--   * Skala gangguan 0–4 per item; dilewati = NULL (bukan 0); tidak ada kolom skor total.
--   * Kondisi lingkungan saat pencatatan disimpan terpisah; lokasi = nama wilayah + koordinat 2 desimal (K-08).
--   * RLS: Member hanya dapat melihat, membuat, dan menghapus catatan miliknya. Guest tidak punya akses.
--     Tidak ada UPDATE setelah disimpan ("Ubah Catatan" hanya sebelum menyimpan).
--   * Simpan bersifat atomik lewat fungsi save_tracker_record (catatan + item + lingkungan sekaligus).
--   * Tidak ada kolom AI di migration ini (AI #3 di Tahap 9, migration terpisah).
-- Bergantung pada auth.users (Supabase Auth). Tidak mengubah tabel profiles dari Migration 001.
-- Catatan: aturan opsi eksklusif (mis. "Tidak ada gejala" tidak boleh digabung) divalidasi di server aplikasi.
-- Aturan cabang memakai IS NOT DISTINCT FROM agar nilai NULL tidak lolos pemeriksaan.
-- =====================================================================================

-- 1) Catatan utama ---------------------------------------------------------------------
create table if not exists public.tracker_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  context text not null check (context in ('menstruasi', 'kehamilan', 'menyusui', 'lewati')),

  -- Pertanyaan umum
  ht01_comfort text check (ht01_comfort in ('sangat_nyaman', 'nyaman', 'biasa_saja', 'kurang_nyaman', 'sangat_tidak_nyaman', 'tidak_ingin_menjawab')),
  ht02_other_text text check (char_length(ht02_other_text) <= 200),
  ht04_outdoor text check (ht04_outdoor in ('tidak', 'kurang_30', '30_60', '1_2_jam', 'lebih_2_jam', 'tidak_yakin')),

  -- Cabang Menstruasi
  hm01_menstruating text check (hm01_menstruating in ('ya', 'tidak', 'tidak_yakin', 'tidak_ingin_menjawab')),
  hm02_day text check (hm02_day in ('hari_1', 'hari_2', 'hari_3', 'hari_4', 'hari_5', 'hari_6', 'hari_7', 'lebih_7', 'tidak_yakin')),
  hm03_flow text check (hm03_flow in ('sedikit', 'sedang', 'banyak', 'tidak_ingin_menjawab')),
  hm04_pain text check (hm04_pain in ('ya', 'tidak', 'tidak_ingin_menjawab')),
  hm05_pain_disruption smallint check (hm05_pain_disruption between 0 and 4),

  -- Cabang Kehamilan
  hk01_other_text text check (char_length(hk01_other_text) <= 200),

  -- Cabang Menyusui
  hs01_breastfeeding text check (hs01_breastfeeding in ('ya', 'tidak', 'tidak_ingin_menjawab')),
  hs02_discomfort text check (hs02_discomfort in ('ya', 'tidak', 'tidak_ingin_menjawab')),
  hs03_disruption smallint check (hs03_disruption between 0 and 4),

  -- Cerita tambahan (opsional)
  story text check (char_length(story) <= 2000),

  created_at timestamptz not null default now(),

  -- Konsistensi percabangan (Master Draft 3.4–3.7)
  constraint tracker_branch_menstruasi check (
    context = 'menstruasi'
    or (hm01_menstruating is null and hm02_day is null and hm03_flow is null and hm04_pain is null and hm05_pain_disruption is null)
  ),
  constraint tracker_hm02_hm03_need_hm01_ya check (hm01_menstruating is not distinct from 'ya' or (hm02_day is null and hm03_flow is null)),
  constraint tracker_hm05_needs_hm04_ya check (hm04_pain is not distinct from 'ya' or hm05_pain_disruption is null),
  constraint tracker_branch_kehamilan check (context = 'kehamilan' or hk01_other_text is null),
  constraint tracker_branch_menyusui check (
    context = 'menyusui' or (hs01_breastfeeding is null and hs02_discomfort is null and hs03_disruption is null)
  ),
  constraint tracker_hs02_needs_hs01_ya check (hs01_breastfeeding is not distinct from 'ya' or hs02_discomfort is null),
  constraint tracker_hs03_needs_hs02_ya check (hs02_discomfort is not distinct from 'ya' or hs03_disruption is null)
);

create index if not exists tracker_records_user_recorded_idx on public.tracker_records (user_id, recorded_at desc);
comment on table public.tracker_records is 'SYCLE V2: catatan Health Tracker yang disimpan eksplisit. Owner-only via RLS.';

-- 2) Jawaban pilihan ganda + skala per item (HT-02/HT-03, HK-01/HK-02, HS-04) ----------
create table if not exists public.tracker_record_items (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.tracker_records (id) on delete cascade,
  question_code text not null check (question_code in ('HT-02', 'HK-01', 'HS-04')),
  option_code text not null,
  disruption_level smallint check (disruption_level between 0 and 4),
  unique (record_id, question_code, option_code),
  constraint tracker_item_option_valid check (
    (question_code = 'HT-02' and option_code in ('lelah', 'pusing', 'sakit_kepala', 'mual', 'merasa_kepanasan', 'lainnya', 'tidak_ada_gejala'))
    or (question_code = 'HK-01' and option_code in ('tidak_ada', 'sulit_istirahat', 'sulit_tempat_sejuk', 'aktivitas_berat', 'lainnya'))
    or (question_code = 'HS-04' and option_code in ('lingkungan_panas', 'sulit_istirahat', 'sulit_tempat_nyaman', 'akses_air_terbatas', 'lainnya', 'tidak_ada'))
  ),
  -- Skala hanya untuk gejala/hambatan yang dipilih; tidak untuk opsi eksklusif dan tidak untuk HS-04.
  constraint tracker_item_scale_allowed check (
    disruption_level is null
    or (question_code = 'HT-02' and option_code <> 'tidak_ada_gejala')
    or (question_code = 'HK-01' and option_code <> 'tidak_ada')
  )
);

create index if not exists tracker_record_items_record_idx on public.tracker_record_items (record_id);

-- 3) Kondisi lingkungan saat pencatatan (Master Draft 3.9, K-08) -------------------------
create table if not exists public.tracker_environment_snapshots (
  record_id uuid primary key references public.tracker_records (id) on delete cascade,
  captured_at timestamptz not null,
  location_label text not null check (char_length(location_label) <= 200),
  location_code text check (location_code ~ '^\d{2}\.\d{2}\.\d{2}\.\d{4}$'),
  lat numeric(5, 2) check (lat between -12 and 7),
  lon numeric(6, 2) check (lon between 94 and 142),
  -- Ringkasan indikator yang valid saat itu (nilai, satuan, standar, kategori, sumber, jenis data, waktu, cadangan).
  indicators jsonb not null check (jsonb_typeof(indicators) = 'object')
);

-- 4) Row Level Security ----------------------------------------------------------------
alter table public.tracker_records enable row level security;
alter table public.tracker_record_items enable row level security;
alter table public.tracker_environment_snapshots enable row level security;

-- tracker_records: lihat / buat / hapus milik sendiri. Tidak ada UPDATE.
drop policy if exists "tracker_records_select_own" on public.tracker_records;
create policy "tracker_records_select_own" on public.tracker_records
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "tracker_records_insert_own" on public.tracker_records;
create policy "tracker_records_insert_own" on public.tracker_records
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "tracker_records_delete_own" on public.tracker_records;
create policy "tracker_records_delete_own" on public.tracker_records
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Tabel turunan: akses hanya bila catatan induknya milik pengguna.
drop policy if exists "tracker_items_select_own" on public.tracker_record_items;
create policy "tracker_items_select_own" on public.tracker_record_items
  for select to authenticated using (
    exists (select 1 from public.tracker_records r where r.id = record_id and r.user_id = (select auth.uid()))
  );

drop policy if exists "tracker_items_insert_own" on public.tracker_record_items;
create policy "tracker_items_insert_own" on public.tracker_record_items
  for insert to authenticated with check (
    exists (select 1 from public.tracker_records r where r.id = record_id and r.user_id = (select auth.uid()))
  );

drop policy if exists "tracker_snapshots_select_own" on public.tracker_environment_snapshots;
create policy "tracker_snapshots_select_own" on public.tracker_environment_snapshots
  for select to authenticated using (
    exists (select 1 from public.tracker_records r where r.id = record_id and r.user_id = (select auth.uid()))
  );

drop policy if exists "tracker_snapshots_insert_own" on public.tracker_environment_snapshots;
create policy "tracker_snapshots_insert_own" on public.tracker_environment_snapshots
  for insert to authenticated with check (
    exists (select 1 from public.tracker_records r where r.id = record_id and r.user_id = (select auth.uid()))
  );

-- Hak akses tabel: Guest tidak punya akses; Member tanpa UPDATE. Baris turunan terhapus lewat CASCADE.
revoke all on table public.tracker_records, public.tracker_record_items, public.tracker_environment_snapshots from anon;
revoke update on table public.tracker_records, public.tracker_record_items, public.tracker_environment_snapshots from authenticated;
revoke delete on table public.tracker_record_items, public.tracker_environment_snapshots from authenticated;
grant select, insert, delete on table public.tracker_records to authenticated;
grant select, insert on table public.tracker_record_items, public.tracker_environment_snapshots to authenticated;

-- 5) Simpan atomik --------------------------------------------------------------------
-- SECURITY INVOKER: berjalan sebagai pengguna yang login, sehingga semua kebijakan RLS di atas tetap berlaku.
-- p_record: kolom tracker_records (tanpa id/user_id); p_items: array {question_code, option_code, disruption_level};
-- p_snapshot: objek tracker_environment_snapshots (tanpa record_id) atau null.
create or replace function public.save_tracker_record(p_record jsonb, p_items jsonb, p_snapshot jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  insert into public.tracker_records (
    context, ht01_comfort, ht02_other_text, ht04_outdoor,
    hm01_menstruating, hm02_day, hm03_flow, hm04_pain, hm05_pain_disruption,
    hk01_other_text, hs01_breastfeeding, hs02_discomfort, hs03_disruption, story
  )
  select
    r.context, r.ht01_comfort, r.ht02_other_text, r.ht04_outdoor,
    r.hm01_menstruating, r.hm02_day, r.hm03_flow, r.hm04_pain, r.hm05_pain_disruption,
    r.hk01_other_text, r.hs01_breastfeeding, r.hs02_discomfort, r.hs03_disruption, r.story
  from jsonb_populate_record(null::public.tracker_records, p_record) r
  returning id into new_id;

  insert into public.tracker_record_items (record_id, question_code, option_code, disruption_level)
  select new_id, i.question_code, i.option_code, i.disruption_level
  from jsonb_to_recordset(coalesce(p_items, '[]'::jsonb)) as i(question_code text, option_code text, disruption_level smallint);

  if p_snapshot is not null and jsonb_typeof(p_snapshot) = 'object' then
    insert into public.tracker_environment_snapshots (record_id, captured_at, location_label, location_code, lat, lon, indicators)
    select new_id, s.captured_at, s.location_label, s.location_code, round(s.lat, 2), round(s.lon, 2), s.indicators
    from jsonb_to_record(p_snapshot) as s(captured_at timestamptz, location_label text, location_code text, lat numeric, lon numeric, indicators jsonb);
  end if;

  return new_id;
end;
$$;

revoke execute on function public.save_tracker_record(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_tracker_record(jsonb, jsonb, jsonb) to authenticated;

-- -------------------------------------------------------------------------------------
-- ROLLBACK (manual, hanya bila perlu):
--   drop function if exists public.save_tracker_record(jsonb, jsonb, jsonb);
--   drop table if exists public.tracker_environment_snapshots;
--   drop table if exists public.tracker_record_items;
--   drop table if exists public.tracker_records;
-- -------------------------------------------------------------------------------------
