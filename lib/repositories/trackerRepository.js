// Akses tabel Health Tracker (migration 002, RLS owner-only). Satu-satunya lapisan yang menyentuh tabel ini.
const MISSING_CODES = new Set(["42P01", "PGRST202", "PGRST205", "42883"]);

// Simpan atomik: catatan + item + kondisi lingkungan dalam satu fungsi database.
export async function saveTrackerRecord(supabase, { record, items, snapshot }) {
  const { data, error } = await supabase.rpc("save_tracker_record", {
    p_record: record,
    p_items: items,
    p_snapshot: snapshot,
  });
  if (error) {
    if (MISSING_CODES.has(error.code)) return { ok: false, reason: "not_ready" };
    if (error.code === "42501") return { ok: false, reason: "forbidden" };
    console.error("saveTrackerRecord gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error" };
  }
  if (!data) return { ok: false, reason: "error" };
  return { ok: true, id: data };
}

// ---------- Tahap 7: Riwayat, detail, hapus (RLS: hanya baris milik pengguna yang login) ----------
export const RECORDS_PAGE_SIZE = 50;

// Daftar catatan terbaru (screen 55). `before` = kursor waktu untuk halaman berikutnya.
export async function listTrackerRecords(supabase, { before = null, limit = RECORDS_PAGE_SIZE } = {}) {
  let query = supabase
    .from("tracker_records")
    .select("id, recorded_at, context, tracker_environment_snapshots(location_label, location_code, lon)")
    .order("recorded_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  if (before) query = query.lt("recorded_at", before);

  const { data, error } = await query;
  if (error) {
    if (MISSING_CODES.has(error.code)) return { ok: false, reason: "not_ready" };
    console.error("listTrackerRecords gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error" };
  }
  return { ok: true, records: data.slice(0, limit), hasMore: data.length > limit };
}

export async function countTrackerRecords(supabase) {
  const { count, error } = await supabase.from("tracker_records").select("id", { count: "exact", head: true });
  if (error) {
    console.error("countTrackerRecords gagal:", error.code ?? "unknown");
    return { ok: false };
  }
  return { ok: true, count: count ?? 0 };
}

// Detail satu catatan (screen 56/57, PDF). Catatan milik orang lain tidak terlihat oleh RLS → not_found.
export async function getTrackerRecord(supabase, id) {
  const { data, error } = await supabase
    .from("tracker_records")
    .select("*, tracker_record_items(question_code, option_code, disruption_level), tracker_environment_snapshots(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (MISSING_CODES.has(error.code)) return { ok: false, reason: "not_ready" };
    console.error("getTrackerRecord gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error" };
  }
  if (!data) return { ok: false, reason: "not_found" };
  return { ok: true, record: data };
}

// Hapus satu catatan (screen 58). Item & kondisi lingkungan ikut terhapus (ON DELETE CASCADE).
// Berhasil hanya bila database mengembalikan baris yang benar-benar terhapus.
export async function deleteTrackerRecord(supabase, id) {
  const { data, error } = await supabase.from("tracker_records").delete().eq("id", id).select("id");
  if (error) {
    console.error("deleteTrackerRecord gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error" };
  }
  if (!data || data.length === 0) return { ok: false, reason: "not_found" };
  return { ok: true };
}

// Hapus semua catatan milik pengguna (screen 71, T7-3). Akun & profil tetap ada.
export async function deleteAllTrackerRecords(supabase, userId) {
  const { data, error } = await supabase.from("tracker_records").delete().eq("user_id", userId).select("id");
  if (error) {
    console.error("deleteAllTrackerRecords gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error" };
  }
  return { ok: true, count: data?.length ?? 0 };
}
