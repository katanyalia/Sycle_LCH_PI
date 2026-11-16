begin;

-- =========================================================
-- SYCLE HEALTH TRACKER: UPDATE BANK PERTANYAAN V2.1
-- Migration: 20261101000002
-- =========================================================

-- =========================================================
-- 1. TAMBAHKAN KOLOM BARU PADA TRACKER_RECORDS
-- =========================================================

alter table public.tracker_records
  add column if not exists ht04_activity_location text,
  add column if not exists ht05_outdoor text,
  add column if not exists hm06_toilet_access text,
  add column if not exists hs04_other_text text;

-- =========================================================
-- 2. VALIDASI NILAI KOLOM BARU
-- =========================================================

alter table public.tracker_records
  drop constraint if exists tracker_ht04_activity_location_check,
  drop constraint if exists tracker_ht05_outdoor_check,
  drop constraint if exists tracker_hm06_toilet_access_check,
  drop constraint if exists tracker_hs04_other_text_check;

alter table public.tracker_records
  add constraint tracker_ht04_activity_location_check
    check (
      ht04_activity_location in (
        'dalam_ruangan',
        'luar_ruangan',
        'perjalanan',
        'berpindah_pindah'
      )
    ),

  add constraint tracker_ht05_outdoor_check
    check (
      ht05_outdoor in (
        'tidak',
        'kurang_30',
        '30_60',
        '1_2_jam',
        'lebih_2_jam',
        'tidak_yakin'
      )
    ),

  add constraint tracker_hm06_toilet_access_check
    check (
      hm06_toilet_access in (
        'mudah',
        'cukup',
        'sulit',
        'tidak_ingin_menjawab'
      )
    ),

  add constraint tracker_hs04_other_text_check
    check (
      char_length(hs04_other_text) <= 200
    );


-- =========================================================
-- 3. MIGRASIKAN DURASI OUTDOOR LAMA KE HT-05
-- =========================================================

update public.tracker_records
set ht05_outdoor = ht04_outdoor
where ht05_outdoor is null
  and ht04_outdoor is not null;


-- =========================================================
-- 4. PERLUAS PILIHAN JAWABAN TRACKER_RECORD_ITEMS
-- =========================================================

alter table public.tracker_record_items
  drop constraint if exists tracker_item_option_valid,
  drop constraint if exists tracker_item_scale_allowed;


-- Validasi pilihan jawaban HT-02, HK-01, dan HS-04

alter table public.tracker_record_items
  add constraint tracker_item_option_valid
  check (
    (
      question_code = 'HT-02'
      and option_code in (
        'lelah',
        'pusing',
        'sakit_kepala',
        'mual',
        'kram_otot',
        'merasa_kepanasan',
        'batuk_tenggorokan_gatal',
        'mata_perih',
        'lainnya',
        'tidak_ada_gejala',
        'tidak_ada_yang_ingin_dicatat'
      )
    )
    or (
      question_code = 'HK-01'
      and option_code in (
        'tidak_ada',
        'sulit_istirahat',
        'sulit_tempat_sejuk',
        'sulit_air_minum',
        'aktivitas_berat',
        'lainnya'
      )
    )
    or (
      question_code = 'HS-04'
      and option_code in (
        'lingkungan_panas',
        'bayi_menyusu_lebih_sering',
        'sulit_istirahat',
        'sulit_tempat_nyaman',
        'akses_air_terbatas',
        'lainnya',
        'tidak_ada'
      )
    )
  );


-- =========================================================
-- 5. VALIDASI SKALA GANGGUAN
-- =========================================================

alter table public.tracker_record_items
  add constraint tracker_item_scale_allowed
  check (
    (
      question_code = 'HT-02'
      and (
        disruption_level is null
        or option_code not in (
          'tidak_ada_gejala',
          'tidak_ada_yang_ingin_dicatat'
        )
      )
    )
    or (
      question_code = 'HK-01'
      and (
        disruption_level is null
        or option_code <> 'tidak_ada'
      )
    )
    or (
      question_code = 'HS-04'
      and disruption_level is null
    )
  );


-- =========================================================
-- 6. VALIDASI KOLOM TAMBAHAN SESUAI CABANG KONDISI
-- =========================================================

alter table public.tracker_records
  drop constraint if exists tracker_hm06_branch,
  drop constraint if exists tracker_hs04_text_branch;

alter table public.tracker_records
  add constraint tracker_hm06_branch
    check (
      context = 'menstruasi'
      or hm06_toilet_access is null
    ),

  add constraint tracker_hs04_text_branch
    check (
      context = 'menyusui'
      or hs04_other_text is null
    );


-- =========================================================
-- 7. VALIDASI EKSKLUSIVITAS PILIHAN "TIDAK ADA"
-- HT-02, HK-01, HS-04
-- =========================================================

create or replace function
public.enforce_tracker_item_exclusive_options()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_none_option boolean := false;
  has_conflicting_option boolean := false;

begin

  -- Pastikan record induk dimiliki oleh pengguna aktif
  -- sekaligus mengunci record agar perubahan item
  -- pada record yang sama diproses secara berurutan.

  perform 1
  from public.tracker_records
  where id = new.record_id
    and user_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'tracker_record_not_found'
      using errcode = '23503';
  end if;


  -- Identifikasi pilihan yang bersifat eksklusif

  is_none_option :=
    (
      new.question_code = 'HT-02'
      and new.option_code in (
        'tidak_ada_gejala',
        'tidak_ada_yang_ingin_dicatat'
      )
    )
    or (
      new.question_code = 'HK-01'
      and new.option_code = 'tidak_ada'
    )
    or (
      new.question_code = 'HS-04'
      and new.option_code = 'tidak_ada'
    );


  -- Periksa apakah sudah ada pilihan lain
  -- yang bertentangan dalam pertanyaan yang sama.

  select exists (
    select 1
    from public.tracker_record_items existing
    where existing.record_id = new.record_id
      and existing.question_code = new.question_code
      and existing.id <> new.id
      and (
        is_none_option
        or (
          new.question_code = 'HT-02'
          and existing.option_code in (
            'tidak_ada_gejala',
            'tidak_ada_yang_ingin_dicatat'
          )
        )
        or (
          new.question_code in ('HK-01', 'HS-04')
          and existing.option_code = 'tidak_ada'
        )
      )
  )
  into has_conflicting_option;


  if has_conflicting_option then
    raise exception
      'Pilihan Tidak ada tidak boleh digabung dengan pilihan lainnya.'
      using errcode = '23514';
  end if;

  return new;

end;
$$;


-- Pasang trigger

drop trigger if exists tracker_item_exclusive_options
on public.tracker_record_items;

create trigger tracker_item_exclusive_options
before insert or update
on public.tracker_record_items
for each row
execute function
public.enforce_tracker_item_exclusive_options();


-- =========================================================
-- 8. PERBARUI FUNGSI PENYIMPANAN ATOMIK
-- =========================================================

create or replace function public.save_tracker_record(
  p_record jsonb,
  p_items jsonb,
  p_snapshot jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_id uuid;

begin

  -- Pastikan pengguna sudah login

  if (select auth.uid()) is null then
    raise exception 'not_authenticated'
      using errcode = '42501';
  end if;


  -- Simpan record utama

  insert into public.tracker_records (
    context,
    ht01_comfort,
    ht02_other_text,
    ht04_activity_location,
    ht04_outdoor,
    ht05_outdoor,
    hm01_menstruating,
    hm02_day,
    hm03_flow,
    hm04_pain,
    hm05_pain_disruption,
    hm06_toilet_access,
    hk01_other_text,
    hs01_breastfeeding,
    hs02_discomfort,
    hs03_disruption,
    hs04_other_text,
    story
  )
  select
    r.context,
    r.ht01_comfort,
    r.ht02_other_text,
    r.ht04_activity_location,
    r.ht04_outdoor,
    coalesce(r.ht05_outdoor, r.ht04_outdoor),
    r.hm01_menstruating,
    r.hm02_day,
    r.hm03_flow,
    r.hm04_pain,
    r.hm05_pain_disruption,
    r.hm06_toilet_access,
    r.hk01_other_text,
    r.hs01_breastfeeding,
    r.hs02_discomfort,
    r.hs03_disruption,
    r.hs04_other_text,
    r.story
  from jsonb_populate_record(
    null::public.tracker_records,
    p_record
  ) r
  returning id into new_id;


  -- =======================================================
  -- VALIDASI EKSKLUSIVITAS DALAM SATU PAYLOAD
  -- =======================================================

  if exists (
    select 1
    from jsonb_to_recordset(
      coalesce(p_items, '[]'::jsonb)
    ) as i(
      question_code text,
      option_code text,
      disruption_level smallint
    )
    where (
      (
        i.question_code = 'HT-02'
        and i.option_code in (
          'tidak_ada_gejala',
          'tidak_ada_yang_ingin_dicatat'
        )
      )
      or (
        i.question_code in ('HK-01', 'HS-04')
        and i.option_code = 'tidak_ada'
      )
    )
    and exists (
      select 1
      from jsonb_to_recordset(
        coalesce(p_items, '[]'::jsonb)
      ) as j(
        question_code text,
        option_code text,
        disruption_level smallint
      )
      where j.question_code = i.question_code
        and j.option_code <> i.option_code
    )
  ) then

    raise exception
      'Pilihan Tidak ada tidak boleh digabung dengan pilihan lainnya.'
      using errcode = '23514';

  end if;


  -- Simpan item jawaban

  insert into public.tracker_record_items (
    record_id,
    question_code,
    option_code,
    disruption_level
  )
  select
    new_id,
    i.question_code,
    i.option_code,
    i.disruption_level
  from jsonb_to_recordset(
    coalesce(p_items, '[]'::jsonb)
  ) as i(
    question_code text,
    option_code text,
    disruption_level smallint
  );


  -- =======================================================
  -- SIMPAN SNAPSHOT LINGKUNGAN
  -- =======================================================

  if p_snapshot is not null
    and jsonb_typeof(p_snapshot) = 'object'
  then

    insert into public.tracker_environment_snapshots (
      record_id,
      captured_at,
      location_label,
      location_code,
      lat,
      lon,
      indicators
    )
    select
      new_id,
      s.captured_at,
      s.location_label,
      s.location_code,
      round(s.lat, 2),
      round(s.lon, 2),
      s.indicators
    from jsonb_to_record(p_snapshot) as s(
      captured_at timestamptz,
      location_label text,
      location_code text,
      lat numeric,
      lon numeric,
      indicators jsonb
    );

  end if;


  return new_id;

end;
$$;


-- =========================================================
-- 9. ATUR HAK AKSES FUNGSI RPC
-- =========================================================

revoke execute on function
  public.save_tracker_record(jsonb, jsonb, jsonb)
  from public, anon;

grant execute on function
  public.save_tracker_record(jsonb, jsonb, jsonb)
  to authenticated;


-- =========================================================
-- SELESAI
-- =========================================================

commit;