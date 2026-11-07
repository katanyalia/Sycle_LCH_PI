import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

const CONTEXT_LABEL = {
  menstruasi: "Menstruasi",
  kehamilan: "Hamil",
  menyusui: "Menyusui",
  lewati: "Catatan umum",
};

const ACTIVITY_LABEL = {
  dalam_ruangan: "Dalam Ruangan",
  luar_ruangan: "Luar Ruangan",
  perjalanan: "Perjalanan",
  berpindah_pindah: "Berpindah-pindah",
};

const COMFORT_LABEL = {
  sangat_nyaman: "Sangat nyaman",
  nyaman: "Nyaman",
  biasa_saja: "Biasa saja",
  kurang_nyaman: "Kurang nyaman",
  sangat_tidak_nyaman: "Sangat tidak nyaman",
  tidak_ingin_menjawab: "Tidak ingin menjawab",
};

function getJakartaDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
}

function toEntry(row) {
  const recordedAt = new Date(row.recorded_at);
  const { year, month, day } = getJakartaDateParts(recordedAt);

  return {
    id: row.id,
    recordedAt: row.recorded_at,

    // Digunakan untuk mencocokkan tanggal Check-In.
    dateKey: `${year}-${month}-${day}`,

    // Tetap tersedia untuk kebutuhan pengelompokan per bulan.
    monthKey: `${year}-${month}`,

    // Digunakan kalender untuk menandai tanggal yang memiliki catatan.
    dayKey: `${year}-${month}-${day}`,

    day,
    weekday: recordedAt.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
    }),
    date: recordedAt.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: recordedAt.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    }),
    condition: CONTEXT_LABEL[row.context] ?? row.context,
    comfort: COMFORT_LABEL[row.ht01_comfort] ?? "",
    activity: ACTIVITY_LABEL[row.ht04_activity_location] ?? "",
    location: "",
    story: row.story ?? "",
  };
}

// Catatan milik pengguna yang sedang login.
// RLS memastikan pengguna hanya dapat membaca catatannya sendiri.
export async function getMyTrackerEntries(limit = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tracker_records")
    .select(
      "id, recorded_at, context, ht01_comfort, ht04_activity_location, ht05_outdoor, story"
    )
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Gagal memuat catatan Tracker:", error.message);

    return {
      entries: [],
      error: "Catatan belum dapat dimuat. Coba muat ulang halaman.",
    };
  }

  console.info(
    "[tracker] memuat riwayat:",
    (data ?? []).length,
    "catatan"
  );

  return {
    entries: (data ?? []).map(toEntry),
    error: "",
  };
}

export async function getMyTrackerEntryDetail(recordId) {
  if (!recordId || typeof recordId !== "string") {
    return {
      ok: false,
      message: "ID Check-In tidak valid.",
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Silakan login untuk melihat detail Check-In.",
    };
  }

  try {
    const supabase = await createClient();

    // 1. Ambil jawaban utama dari tracker_records
    const {
      data: record,
      error: recordError,
    } = await supabase
      .from("tracker_records")
      .select(`
        id,
        recorded_at,
        context,
        ht01_comfort,
        ht02_other_text,
        ht04_activity_location,
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
      `)
      .eq("id", recordId)
      .maybeSingle();

    if (recordError || !record) {
      return {
        ok: false,
        message: "Detail Check-In tidak ditemukan.",
      };
    }

    // 2. Ambil jawaban pilihan dan tingkat gangguan
    const {
      data: items,
      error: itemsError,
    } = await supabase
      .from("tracker_record_items")
      .select("question_code, option_code, disruption_level")
      .eq("record_id", recordId)
      .order("question_code", { ascending: true })
      .order("option_code", { ascending: true });

    if (itemsError) {
      console.error("Gagal mengambil detail jawaban:", itemsError.message);

      return {
        ok: false,
        message: "Jawaban Check-In belum dapat dimuat.",
      };
    }

    // 3. Ambil snapshot lingkungan
    const {
      data: snapshot,
      error: snapshotError,
    } = await supabase
      .from("tracker_environment_snapshots")
      .select(`
        captured_at,
        location_label,
        location_code,
        lat,
        lon,
        indicators
      `)
      .eq("record_id", recordId)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (snapshotError) {
      console.error(
        "Gagal mengambil snapshot lingkungan:",
        snapshotError.message
      );
    }

    return {
      ok: true,
      record,
      items: items ?? [],
      snapshot: snapshot ?? null,
      snapshotWarning: snapshotError
        ? "Data lingkungan belum dapat dimuat."
        : "",
    };
  } catch (error) {
    console.error("getMyTrackerEntryDetail gagal:", error.message);

    return {
      ok: false,
      message: "Detail Check-In belum dapat dimuat. Silakan coba lagi.",
    };
  }
}