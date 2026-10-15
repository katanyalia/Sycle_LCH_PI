// Variabel lingkungan Supabase (Project URL + publishable key). Keduanya memang publik (NEXT_PUBLIC_);
// keamanan data dijaga oleh RLS. Kunci service role/secret TIDAK boleh memakai prefix NEXT_PUBLIC_.
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return { url, key, configured: Boolean(url && key) };
}
