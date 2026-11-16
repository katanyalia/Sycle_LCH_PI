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

function toEntry(row, answers = [], snapshot = null) {
  const recordedAt = new Date(row.recorded_at);
  const { year, month, day } = getJakartaDateParts(recordedAt);

  const getAnswers = (code) =>
    answers
      .filter((item) => item.code_question === code)
      .map((item) => item.answer)
      .filter((value) => value !== null && value !== "");

  const comfortValue = getAnswers("HT-01")[0] ?? "";
  const activityValue = getAnswers("HT-04")[0] ?? "";

  return {
    id: row.id,
    recordedAt: row.recorded_at,
    dateKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
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
    comfort: COMFORT_LABEL[comfortValue] ?? comfortValue,
    activity: ACTIVITY_LABEL[activityValue] ?? activityValue,
    location: snapshot?.location_label ?? "",
    story: row.story ?? "",
  };
}

// Mengambil riwayat Check-In milik pengguna yang sedang login.
export async function getMyTrackerEntries(limit = 50) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      entries: [],
      error: "Silakan login untuk melihat riwayat Check-In.",
    };
  }

  // 1. Ambil data utama Check-In.
  const { data: records, error: recordError } = await supabase
    .from("health_tracker")
    .select("id, recorded_at, context, story")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (recordError) {
    console.error("Gagal memuat health_tracker:", recordError.message);

    return {
      entries: [],
      error: "Catatan belum dapat dimuat. Coba muat ulang halaman.",
    };
  }

  if (!records?.length) {
    return {
      entries: [],
      error: "",
    };
  }

  const recordIds = records.map((record) => record.id);
  const normalizedIds = recordIds.map(String);

  // 2. Ambil jawaban dari tracker_answer.
  // Kolom yang benar adalah answer_value, bukan answer.
  const { data: answers, error: answerError } = await supabase
    .from("tracker_answer")
    .select("health_tracker_id, code_question, answer, scale")
    .in("health_tracker_id", recordIds);

  if (answerError) {
    console.error("Gagal memuat tracker_answer:", answerError.message);

    return {
      entries: [],
      error: "Jawaban Check-In belum dapat dimuat.",
    };
  }

  // 3. Ambil snapshot lingkungan.
  const { data: snapshots, error: snapshotError } = await supabase
    .from("tracker_lingkungan_snapshots")
    .select("id, location_label")
    .in("id", recordIds);

  if (snapshotError) {
    console.error(
      "Gagal memuat snapshot lingkungan:",
      snapshotError.message
    );
  }

  // 4. Kelompokkan jawaban berdasarkan ID Check-In.
  const answersByRecord = new Map();

  for (const answer of answers ?? []) {
    const key = String(answer.health_tracker_id);
    const current = answersByRecord.get(key) ?? [];

    current.push(answer);
    answersByRecord.set(key, current);
  }

  // 5. Kelompokkan snapshot berdasarkan ID Check-In.
  const snapshotsByRecord = new Map(
    (snapshots ?? []).map((snapshot) => [
      String(snapshot.id),
      snapshot,
    ])
  );

  // 6. Mapping data untuk dashboard dan kalender.
  const entries = records.map((record) => {
    const key = String(record.id);

    return toEntry(
      record,
      answersByRecord.get(key) ?? [],
      snapshotsByRecord.get(key) ?? null
    );
  });

  return {
    entries,
    error: "",
  };
}

// Mengambil detail satu Check-In milik pengguna yang sedang login.
export async function getMyTrackerEntryDetail(recordId) {
  const normalizedId = String(recordId ?? "").trim();

  if (
    !normalizedId ||
    normalizedId === "undefined" ||
    normalizedId === "null"
  ) {
    return {
      ok: false,
      message: "ID Check-In tidak valid.",
    };
  }

  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        ok: false,
        message: "Silakan login untuk melihat detail Check-In.",
      };
    }

    const supabase = await createClient();

    // 1. Ambil Check-In dari tabel health_tracker.
    // Filter user_id untuk memastikan kepemilikan data.
    const { data: record, error: recordError } = await supabase
      .from("health_tracker")
      .select(`
        id,
        user_id,
        recorded_at,
        context,
        story,
        refleksi_ai,
        ringkasan_checkin
      `)
      .eq("id", normalizedId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (recordError) {
      console.error(
        "Gagal mengambil detail health_tracker:",
        recordError.message
      );

      return {
        ok: false,
        message: "Detail Check-In belum dapat dimuat.",
      };
    }

    if (!record) {
      return {
        ok: false,
        message: "Detail Check-In tidak ditemukan.",
      };
    }

    // 2. Ambil semua jawaban Check-In.
    const { data: answers, error: answerError } = await supabase
      .from("tracker_answer")
      .select(`
        health_tracker_id,
        code_question,
        answer,
        scale
      `)
      .eq("health_tracker_id", normalizedId)
      .order("code_question", { ascending: true });

    if (answerError) {
      console.error(
        "Gagal mengambil jawaban Check-In:",
        answerError.message
      );

      return {
        ok: false,
        message: "Jawaban Check-In belum dapat dimuat.",
      };
    }

    // 3. Ambil snapshot lingkungan.
    // Berdasarkan struktur saat ini, id snapshot sama dengan
    // id pada health_tracker.
    const { data: snapshot, error: snapshotError } = await supabase
      .from("tracker_lingkungan_snapshots")
      .select(`
        id,
        location_label,
        location_code,
        lat,
        lon,
        indicators
      `)
      .eq("id", normalizedId)
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
      answers: answers ?? [],
      snapshot: snapshot ?? null,
      snapshotWarning: snapshotError
        ? "Data lingkungan belum dapat dimuat."
        : "",
    };
  } catch (error) {
    console.error(
      "getMyTrackerEntryDetail gagal:",
      error.message
    );

    return {
      ok: false,
      message: "Detail Check-In belum dapat dimuat. Silakan coba lagi.",
    };
  }
}