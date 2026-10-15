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
