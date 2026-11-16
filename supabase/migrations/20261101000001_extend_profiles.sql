ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS domicile text,
ADD COLUMN IF NOT EXISTS occupation text;

COMMENT ON COLUMN public.profiles.full_name
IS 'Nama lengkap pengguna, bersifat opsional';

COMMENT ON COLUMN public.profiles.birth_date
IS 'Tanggal lahir pengguna, bersifat opsional';

COMMENT ON COLUMN public.profiles.domicile
IS 'Domisili kota atau kabupaten pengguna';

COMMENT ON COLUMN public.profiles.occupation
IS 'Pekerjaan pengguna';