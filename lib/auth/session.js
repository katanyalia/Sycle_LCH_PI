import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Membaca pengguna yang sedang login di server (Server Component). null bila Guest.
export async function getCurrentUser() {
  if (!getSupabaseEnv().configured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return {
    id: claims.sub,
    email: claims.email ?? null,
    displayName: claims.user_metadata?.display_name ?? null,
  };
}
