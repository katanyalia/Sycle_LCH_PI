-- =====================================================================================
-- SYCLE V2 — Uji RLS tabel profiles (jalankan di Supabase SQL Editor, seluruh isi sekaligus).
-- Membuat 2 pengguna uji SEMENTARA (tanpa kata sandi, tidak bisa login, email domain .test),
-- menguji akses sebagai Member A dan sebagai Guest, lalu MENGHAPUS kembali data uji.
-- Hasil ditampilkan sebagai tabel di akhir. Semua baris kolom "lulus" harus bernilai true.
-- =====================================================================================

create temp table if not exists rls_hasil (no int, uji text, hasil text, lulus boolean);
truncate rls_hasil;
grant all on rls_hasil to authenticated, anon;

-- Data uji sementara (trigger on_auth_user_created otomatis membuat baris profiles)
delete from auth.users where id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b');
insert into auth.users (id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('a0000000-0000-4000-8000-00000000000a', 'authenticated', 'authenticated', 'member-a@sycle-uji.test', '{"display_name":"Member A"}', now(), now()),
  ('b0000000-0000-4000-8000-00000000000b', 'authenticated', 'authenticated', 'member-b@sycle-uji.test', '{"display_name":"Member B"}', now(), now());

insert into rls_hasil
select 0, 'Trigger membuat profil otomatis untuk 2 akun baru', count(*)::text, count(*) = 2
from public.profiles where id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b');

-- ---------- Sebagai Member A ----------
set role authenticated;
set request.jwt.claims = '{"sub":"a0000000-0000-4000-8000-00000000000a","role":"authenticated"}';

insert into rls_hasil select 1, 'Member A hanya melihat 1 profil (miliknya)', count(*)::text, count(*) = 1 from public.profiles;
insert into rls_hasil select 2, 'Member A tidak melihat profil Member B', count(*)::text, count(*) = 0
  from public.profiles where id = 'b0000000-0000-4000-8000-00000000000b';

update public.profiles set display_name = 'Member A diubah' where id = 'a0000000-0000-4000-8000-00000000000a';
update public.profiles set display_name = 'DIBAJAK' where id = 'b0000000-0000-4000-8000-00000000000b';

do $$
begin
  insert into public.profiles (id, display_name) values ('b0000000-0000-4000-8000-00000000000b', 'DIBAJAK');
  insert into rls_hasil values (3, 'Member A membuat profil atas nama Member B', 'DIIZINKAN', false);
exception when others then
  insert into rls_hasil values (3, 'Member A membuat profil atas nama Member B', 'ditolak (' || sqlstate || ')', sqlstate = '42501');
end $$;

-- Tidak ada kebijakan DELETE: percobaan hapus tidak boleh menghapus baris apa pun (diperiksa di no. 4).
do $$
begin
  delete from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a';
exception when others then
  null; -- ditolak lebih awal oleh hak akses juga dianggap aman
end $$;

-- ---------- Sebagai Guest ----------
reset role;
set role anon;
set request.jwt.claims = '{"role":"anon"}';

do $$
declare n int;
begin
  select count(*) into n from public.profiles;
  insert into rls_hasil values (5, 'Guest membaca profiles', 'DIIZINKAN (' || n || ' baris)', false);
exception when others then
  insert into rls_hasil values (5, 'Guest membaca profiles', 'ditolak (' || sqlstate || ')', sqlstate = '42501');
end $$;

-- ---------- Pemeriksaan akhir (sebagai pemilik database) ----------
reset role;
reset request.jwt.claims;

insert into rls_hasil select 6, 'Member A berhasil mengubah namanya sendiri', display_name, display_name = 'Member A diubah'
  from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a';
insert into rls_hasil select 7, 'Nama Member B tidak berubah oleh Member A', display_name, display_name = 'Member B'
  from public.profiles where id = 'b0000000-0000-4000-8000-00000000000b';
insert into rls_hasil select 4, 'Member A tidak dapat menghapus profil (baris masih ada)', count(*)::text, count(*) = 1
  from public.profiles where id = 'a0000000-0000-4000-8000-00000000000a';
insert into rls_hasil select 8, 'RLS aktif di tabel profiles', relrowsecurity::text, relrowsecurity
  from pg_class where oid = 'public.profiles'::regclass;

-- Bersihkan data uji (profil ikut terhapus lewat ON DELETE CASCADE)
delete from auth.users where id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b');
insert into rls_hasil select 9, 'Data uji sudah dihapus', count(*)::text, count(*) = 0
  from public.profiles where id in ('a0000000-0000-4000-8000-00000000000a', 'b0000000-0000-4000-8000-00000000000b');

select no, uji, hasil, lulus from rls_hasil order by no;
