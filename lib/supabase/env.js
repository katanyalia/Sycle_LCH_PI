// Variabel lingkungan Supabase (Project URL + publishable key). Keduanya memang publik (NEXT_PUBLIC_);
// keamanan data dijaga oleh RLS. Kunci service role/secret TIDAK boleh memakai prefix NEXT_PUBLIC_.
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return { url, key, configured: Boolean(url && key) };
}

// Kunci rahasia (secret key) khusus server — hanya untuk menghapus akun (Tahap 7, T7-1).
// Tanpa prefix NEXT_PUBLIC_, sehingga Next.js tidak pernah mengirimkannya ke browser.
export function getSupabaseAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  return { url, secretKey, configured: Boolean(url && secretKey) };
}
