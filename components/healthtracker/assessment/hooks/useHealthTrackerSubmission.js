"use client";

import { saveHealthTrackerAssessment } from "@/app/healthtracker/assessment/actions";
import { createClient } from "@/lib/supabase/client";
import {
  isOfflineError,
  isServerUnreachable,
  lastTrackerUser,
  queueTrackerRecord,
} from "@/lib/healthtracker/offlineQueue";

// Saat offline, catatan disimpan dulu di perangkat dan dikirim otomatis saat online.
async function saveOnDevice(input) {
  const supabase = createClient();
  let userId = null;
  try {
    const { data } = await supabase.auth.getSession(); // dibaca dari perangkat
    userId = data.session?.user?.id ?? null;
  } catch {
    userId = null;
  }
  // Token login yang kedaluwarsa tidak bisa diperbarui tanpa internet: pakai akun terakhir di perangkat ini.
  userId = userId ?? lastTrackerUser();

  if (!userId) {
    return {
      ok: false,
      message: "Kamu sedang offline dan belum masuk. Masuk saat online agar catatanmu bisa disimpan.",
    };
  }

  await queueTrackerRecord(userId, input);
  return { ok: true };
}

export default function useHealthTrackerSubmission({
  condition,
  answers,
  scores,
  story,
  snapshot,
  aiNotice,
  generatedSummary,
  router,
  setError,
  setSaving,
}) {
  async function handleSubmit() {
    setSaving(true);
    setError("");

    const input = {
      condition,
      answers,
      scores,
      story,
      snapshot: snapshot ?? null,
      aiNotice,
      generatedSummary,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new TypeError("offline");
      }

      const result = await saveHealthTrackerAssessment(input);

      if (!result?.ok) {
        setError(
          result?.message ?? "Check-in gagal disimpan."
        );
        return;
      }

      router.push("/healthtracker/history");
    } catch (error) {
      if (isOfflineError(error) || (await isServerUnreachable())) {
        try {
          const queued = await saveOnDevice(input);

          if (!queued.ok) {
            setError(queued.message);
            return;
          }

          // Beranda tersedia offline; pemberitahuan "belum tersinkron" tampil dari TrackerOfflineSync.
          router.push("/");
        } catch {
          setError("Catatan belum bisa disimpan di perangkat ini. Sambungkan internet, lalu coba lagi.");
        }
        return;
      }

      console.error("Gagal menyimpan Health Tracker:", error);
      setError("Terjadi kesalahan saat menyimpan check-in.");
    } finally {
      setSaving(false);
    }
  }

  return { handleSubmit };
}