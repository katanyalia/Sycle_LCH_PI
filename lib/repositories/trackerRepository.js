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

export async function listTrackerRecords(
  supabase,
  { before = null, limit = RECORDS_PAGE_SIZE } = {}
) {
  let query = supabase
    .from("tracker_records")
    .select(
      "id, recorded_at, context, tracker_environment_snapshots(location_label, location_code, lon)"
    )
    .order("recorded_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (before?.recorded_at && before?.id) {
    query = query.or(
      `recorded_at.lt.${before.recorded_at},and(recorded_at.eq.${before.recorded_at},id.lt.${before.id})`
    );
  }

  const { data, error } = await query;

  if (error) {
    if (MISSING_CODES.has(error.code)) {
      return { ok: false, reason: "not_ready" };
    }

    console.error("listTrackerRecords gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error" };
  }

  return {
    ok: true,
    records: data.slice(0, limit),
    hasMore: data.length > limit,
  };
}

export async function countTrackerRecords(supabase) {
  const { count, error } = await supabase.from("tracker_records").select("id", { count: "exact", head: true });
  if (error) {
    console.error("countTrackerRecords gagal:", error.code ?? "unknown");
    return { ok: false };
  }
  return { ok: true, count: count ?? 0 };
}

/// Detail satu catatan untuk kebutuhan PDF.
// Menggunakan struktur tabel Health Tracker terbaru.
export async function getTrackerRecord(supabase, id) {
  // 1. Ambil catatan utama.
  const { data: record, error: recordError } = await supabase
    .from("health_tracker")
    .select("id, user_id, recorded_at, context, story, refleksi_ai, ringkasan_checkin")
    .eq("id", id)
    .maybeSingle();

  if (recordError) {
    if (MISSING_CODES.has(recordError.code)) {
      return { ok: false, reason: "not_ready" };
    }

    console.error("getTrackerRecord gagal:", recordError.message);
    return { ok: false, reason: "error" };
  }

  if (!record) {
    return { ok: false, reason: "not_found" };
  }

  // 2. Ambil jawaban.
  const { data: answers, error: answerError } = await supabase
    .from("tracker_answer")
    .select("health_tracker_id, code_question, answer, scale")
    .eq("health_tracker_id", id)
    .order("code_question", { ascending: true });

  if (answerError) {
    console.error("Gagal mengambil jawaban PDF:", answerError.message);
    return { ok: false, reason: "error" };
  }

  // 3. Ambil snapshot lingkungan.
  const { data: snapshot, error: snapshotError } = await supabase
    .from("tracker_lingkungan_snapshots")
    .select("id, location_label, location_code, lat, lon, indicators")
    .eq("id", id)
    .maybeSingle();

  if (snapshotError) {
    console.error("Gagal mengambil snapshot PDF:", snapshotError.message);
  }

  // 4. Susun data dalam format yang digunakan pembentuk PDF.
  return {
    ok: true,
    record: {
      ...record,
      answers: answers ?? [],
      tracker_environment_snapshots: snapshot
        ? {
            ...snapshot,
            captured_at: snapshot.captured_at ?? record.recorded_at,
          }
        : null,
    },
  };
}

// Hapus satu catatan Health Tracker.
// Jawaban dan snapshot ikut terhapus melalui ON DELETE CASCADE.
export async function deleteTrackerRecord(supabase, id) {
  const { data, error } = await supabase
    .from("health_tracker")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("deleteTrackerRecord gagal:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    return { ok: false, reason: "error" };
  }

  if (!data || data.length === 0) {
    return { ok: false, reason: "not_found" };
  }

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
// Simpan atomik: Health Tracker + answer + kondisi lingkungan dalam satu fungsi database.
export async function saveHealthTracker(supabase, payload) {
  const { data, error } = await supabase.rpc("insert_health_tracker_bundle", 
    {
        p_payload: payload
      }
  );
  if (error) {
    if (MISSING_CODES.has(error.code)) return { ok: false, reason: "not_ready" };
    if (error.code === "42501") return { ok: false, reason: "forbidden" };
    console.error("saveHealthTracker gagal:", error.code ?? "unknown",error);
    return { ok: false, reason: "error" };
  }
  if (!data) return { ok: false, reason: "error" };
  return { ok: true, id: data };
}
