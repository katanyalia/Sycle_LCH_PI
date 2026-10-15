-- =====================================================================================
-- SYCLE V2 — Uji RLS & aturan data Health Tracker (jalankan SETELAH migration 002, seluruh isi sekaligus).
-- Membuat 2 pengguna uji SEMENTARA (tanpa kata sandi, email domain .test), menguji akses Member A,
-- Member B, dan Guest, lalu MENGHAPUS kembali semua data uji. Semua baris kolom "lulus" harus true.
-- =====================================================================================

create temp table if not exists rls_hasil (no int, uji text, hasil text, lulus boolean);
truncate rls_hasil;
grant all on rls_hasil to authenticated, anon;
create temp table if not exists rls_ctx (k text primary key, v uuid);
truncate rls_ctx;
grant all on rls_ctx to authenticated, anon;

delete from auth.users where id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b');
insert into auth.users (id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('a0000000-0000-4000-8000-00000000000a', 'authenticated', 'authenticated', 'member-a@sycle-uji.test', '{"display_name":"Member A"}', now(), now()),
  ('b0000000-0000-4000-8000-00000000000b', 'authenticated', 'authenticated', 'member-b@sycle-uji.test', '{"display_name":"Member B"}', now(), now());

-- ---------- Member A menyimpan catatan lewat fungsi atomik ----------
set role authenticated;
set request.jwt.claims = '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}';

do $$
declare rid uuid;
begin
  rid := public.save_tracker_record(
    '{"context":"menstruasi","ht01_comfort":"kurang_nyaman","hm01_menstruating":"ya","hm02_day":"hari_2","hm04_pain":"ya","hm05_pain_disruption":2,"story":"uji"}'::jsonb,
    '[{"question_code":"HT-02","option_code":"lelah","disruption_level":2},{"question_code":"HT-02","option_code":"pusing","disruption_level":null}]'::jsonb,
    '{"captured_at":"2026-10-15T12:00:00Z","location_label":"Uji","location_code":"31.71.03.1001","lat":-6.16472,"lon":106.84538,"indicators":{"temperature":{"value":30}}}'::jsonb
  );
  insert into rls_ctx values ('a_record', rid);
  insert into rls_hasil values (1, 'Member A menyimpan catatan (atomik)', 'id dibuat', rid is not null);
exception when others then
  insert into rls_hasil values (1, 'Member A menyimpan catatan (atomik)', 'gagal (' || sqlstate || ': ' || sqlerrm || ')', false);
end $$;

insert into rls_hasil select 2, 'Member A melihat catatannya + 2 item + data lingkungan',
  (select count(*) from public.tracker_records)::text || ' / ' || (select count(*) from public.tracker_record_items)::text || ' / ' || (select count(*) from public.tracker_environment_snapshots)::text,
  (select count(*) from public.tracker_records) = 1 and (select count(*) from public.tracker_record_items) = 2 and (select count(*) from public.tracker_environment_snapshots) = 1;

insert into rls_hasil select 3, 'Skala dilewati tersimpan NULL, bukan 0',
  coalesce(disruption_level::text, 'NULL'), disruption_level is null
  from public.tracker_record_items where option_code = 'pusing';

do $$
begin
  update public.tracker_records set story = 'diubah';
  insert into rls_hasil values (4, 'Member A tidak dapat mengubah catatan tersimpan', 'DIIZINKAN', false);
exception when others then
  insert into rls_hasil values (4, 'Member A tidak dapat mengubah catatan tersimpan', 'ditolak (' || sqlstate || ')', sqlstate = '42501');
end $$;

do $$
begin
  perform public.save_tracker_record('{"context":"lewati","hm02_day":"hari_1"}'::jsonb, '[]'::jsonb, null);
  insert into rls_hasil values (5, 'Jawaban cabang tidak sesuai konteks ditolak database', 'DIIZINKAN', false);
exception when others then
  insert into rls_hasil values (5, 'Jawaban cabang tidak sesuai konteks ditolak database', 'ditolak (' || sqlstate || ')', sqlstate = '23514');
end $$;

do $$
begin
  perform public.save_tracker_record('{"context":"lewati"}'::jsonb, '[{"question_code":"HT-02","option_code":"tidak_ada_gejala","disruption_level":3}]'::jsonb, null);
  insert into rls_hasil values (6, 'Skala untuk opsi "Tidak ada gejala" ditolak database', 'DIIZINKAN', false);
exception when others then
  insert into rls_hasil values (6, 'Skala untuk opsi "Tidak ada gejala" ditolak database', 'ditolak (' || sqlstate || ')', sqlstate = '23514');
end $$;

-- ---------- Member B ----------
reset role;
set role authenticated;
set request.jwt.claims = '{"sub":"b0000000-0000-4000-8000-00000000000b","role":"authenticated"}';

insert into rls_hasil select 7, 'Member B tidak melihat catatan/item/lingkungan Member A',
  (select count(*) from public.tracker_records)::text || ' / ' || (select count(*) from public.tracker_record_items)::text || ' / ' || (select count(*) from public.tracker_environment_snapshots)::text,
  (select count(*) from public.tracker_records) = 0 and (select count(*) from public.tracker_record_items) = 0 and (select count(*) from public.tracker_environment_snapshots) = 0;

do $$
declare rid uuid := (select v from rls_ctx where k = 'a_record');
begin
  insert into public.tracker_record_items (record_id, question_code, option_code) values (rid, 'HT-02', 'mual');
  insert into rls_hasil values (8, 'Member B menambah item ke catatan Member A', 'DIIZINKAN', false);
exception when others then
  insert into rls_hasil values (8, 'Member B menambah item ke catatan Member A', 'ditolak (' || sqlstate || ')', sqlstate = '42501');
end $$;

do $$
begin
  insert into public.tracker_records (user_id, context) values ('a0000000-0000-4000-8000-00000000000a', 'lewati');
  insert into rls_hasil values (9, 'Member B membuat catatan atas nama Member A', 'DIIZINKAN', false);
exception when others then
  insert into rls_hasil values (9, 'Member B membuat catatan atas nama Member A', 'ditolak (' || sqlstate || ')', sqlstate = '42501');
end $$;

delete from public.tracker_records where id = (select v from rls_ctx where k = 'a_record');

-- ---------- Guest ----------
reset role;
set role anon;
set request.jwt.claims = '{"role":"anon"}';

do $$
declare n int;
begin
  select count(*) into n from public.tracker_records;
  insert into rls_hasil values (10, 'Guest membaca catatan', 'DIIZINKAN (' || n || ')', false);
exception when others then
  insert into rls_hasil values (10, 'Guest membaca catatan', 'ditolak (' || sqlstate || ')', sqlstate = '42501');
end $$;

do $$
begin
  perform public.save_tracker_record('{"context":"lewati"}'::jsonb, '[]'::jsonb, null);
  insert into rls_hasil values (11, 'Guest memanggil fungsi simpan', 'DIIZINKAN', false);
exception when others then
  insert into rls_hasil values (11, 'Guest memanggil fungsi simpan', 'ditolak (' || sqlstate || ')', sqlstate = '42501');
end $$;

-- ---------- Pemeriksaan akhir (pemilik database) ----------
reset role;
reset request.jwt.claims;

insert into rls_hasil select 12, 'Catatan Member A tetap ada setelah Member B mencoba menghapus', count(*)::text, count(*) = 1
  from public.tracker_records where id = (select v from rls_ctx where k = 'a_record');
insert into rls_hasil select 13, 'Koordinat tersimpan dibulatkan 2 desimal (K-08)', lat::text || ', ' || lon::text, lat = -6.16 and lon = 106.85
  from public.tracker_environment_snapshots where record_id = (select v from rls_ctx where k = 'a_record');
insert into rls_hasil select 14, 'RLS aktif di 3 tabel Tracker', count(*)::text, count(*) = 3
  from pg_class where oid in ('public.tracker_records'::regclass, 'public.tracker_record_items'::regclass, 'public.tracker_environment_snapshots'::regclass) and relrowsecurity;

delete from auth.users where id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b');
insert into rls_hasil select 15, 'Data uji sudah dihapus (CASCADE)', count(*)::text, count(*) = 0
  from public.tracker_records where user_id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b');

select no, uji, hasil, lulus from rls_hasil order by no;
