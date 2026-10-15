import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminEnv } from "@/lib/supabase/env";

// Client Supabase dengan kunci rahasia. HANYA dipanggil dari Server Action di server; melewati RLS,
// jadi dipakai sesempit mungkin (saat ini hanya untuk menghapus akun milik pengguna yang sedang login).
// Mengembalikan null bila kunci belum diisi di .env.local / Vercel.
export function createAdminClient() {
  if (typeof window !== "undefined") throw new Error("createAdminClient hanya boleh dipakai di server");
  const { url, secretKey, configured } = getSupabaseAdminEnv();
  if (!configured) return null;
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
