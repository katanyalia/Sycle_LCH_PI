"use server";

import { createClient } from "@/lib/supabase/server";
import { buildTrackerPayload, sanitizeEnvironmentSnapshot, validateTrackerAnswers } from "@/lib/validations/trackerValidation";
import { saveTrackerRecord } from "@/lib/repositories/trackerRepository";

const MESSAGES = {
  not_ready: "Penyimpanan catatan belum siap di database (migration Health Tracker belum dijalankan).",
  forbidden: "Sesi tidak memiliki izin untuk menyimpan catatan ini. Silakan masuk kembali.",
  error: "Catatan belum berhasil disimpan. Jawabanmu masih ada; coba lagi.",
};

// WF-05 screen 50–51. Dipanggil hanya dari tombol "Ya, Simpan" pada dialog konfirmasi (tidak ada autosave).
// Hasil sukses hanya dikirim setelah database mengembalikan ID catatan.
export async function saveTrackerRecordAction({ answers, environment }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { ok: false, message: "Sesi login berakhir. Masuk kembali untuk menyimpan catatan." };

  const validation = validateTrackerAnswers(answers);
  if (!validation.ok) return { ok: false, message: "Ada jawaban yang belum sesuai. Periksa kembali catatanmu.", errors: validation.errors };

  const { record, items } = buildTrackerPayload(answers);
  const snapshot = sanitizeEnvironmentSnapshot(environment);
  const result = await saveTrackerRecord(supabase, { record, items, snapshot });
  if (!result.ok) return { ok: false, message: MESSAGES[result.reason] };

  return { ok: true, id: result.id, savedAt: new Date().toISOString(), withEnvironment: Boolean(snapshot) };
}
