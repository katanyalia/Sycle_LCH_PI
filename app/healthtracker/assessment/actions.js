"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { saveHealthTracker } from "@/lib/repositories/trackerRepository";
import { mapHealthTrackerToTable } from "@/lib/healthtracker/trackerMapper";

// Waktu pencatatan dari perangkat hanya diterima bila masuk akal: tidak di masa depan
// dan tidak lebih dari 30 hari lalu. Selain itu dipakai waktu server.
const MAX_OFFLINE_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function validRecordedAt(value) {
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return null;
  const now = Date.now();
  if (time > now + 5 * 60 * 1000 || time < now - MAX_OFFLINE_AGE_MS) return null;
  return new Date(time).toISOString();
}

export async function saveHealthTrackerAssessment({
  condition,
  answers,
  scores,
  story = "",
  snapshot = null,
  aiNotice,
  generatedSummary = null,
  recordedAt = null,
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Sesi login berakhir. Silakan masuk kembali.",
    };
  }

  try {
    const payload = mapHealthTrackerToTable({
      condition,
      answers,
      scores,
      story,
      snapshot,
      aiNotice,
      generatedSummary,
    });

    // Catatan offline membawa waktu pencatatan aslinya (lihat lib/healthtracker/offlineQueue.js).
    const recordedAtIso = validRecordedAt(recordedAt);
    if (recordedAtIso) payload.health_tracker.recorded_at = recordedAtIso;

    const supabase = await createClient();
    const result = await saveHealthTracker(supabase, payload);

    if (!result.ok) {
      const messages = {
        not_ready: "Fitur penyimpanan belum siap. Silakan hubungi tim SYCLE.",
        forbidden: "Kamu tidak memiliki akses untuk menyimpan catatan ini.",
        error: "Catatan gagal disimpan. Silakan coba kembali.",
      };

      return {
        ok: false,
        message: messages[result.reason] ?? messages.error,
      };
    }

    revalidatePath("/healthtracker");
    revalidatePath("/healthtracker/history");
    revalidatePath("/healthtracker/summary");

    return {
      ok: true,
      id: result.id,
      message: "Check-in berhasil disimpan.",
    };
  } catch (error) {
    console.error(
      "saveHealthTrackerAssessment gagal:",
      error.message
    );

    return {
      ok: false,
      message: "Data check-in tidak valid atau gagal disimpan.",
    };
  }
}