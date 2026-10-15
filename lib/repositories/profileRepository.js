// Akses tabel public.profiles (RLS owner-only). Satu-satunya lapisan yang menyentuh tabel ini.
const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"]);

export async function getProfile(supabase, userId) {
  const { data, error } = await supabase.from("profiles").select("display_name, created_at").eq("id", userId).maybeSingle();
  if (error) {
    if (MISSING_TABLE_CODES.has(error.code)) return { ok: false, missingTable: true };
    console.error("getProfile gagal:", error.code);
    return { ok: false, missingTable: false };
  }
  return { ok: true, profile: data };
}

export async function updateDisplayName(supabase, userId, displayName) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, display_name: displayName }, { onConflict: "id" });
  if (error) {
    if (MISSING_TABLE_CODES.has(error.code)) {
      return { ok: false, message: "Tabel profil belum dibuat di database. Jalankan migration profiles terlebih dahulu." };
    }
    console.error("updateDisplayName gagal:", error.code);
    return { ok: false, message: "Profil belum berhasil disimpan. Coba lagi." };
  }
  return { ok: true };
}
