"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isRecordId } from "@/lib/validations/recordValidation";
import { deleteTrackerRecord } from "@/lib/repositories/trackerRepository";

// WF-06 screen 58. Dipanggil hanya dari tombol "Hapus Catatan" pada dialog konfirmasi.
// Sukses hanya dikirim setelah database mengonfirmasi baris terhapus.
export async function deleteTrackerRecordAction(id) {
  if (!isRecordId(id)) return { ok: false, message: "Catatan tidak ditemukan." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { ok: false, message: "Sesi login berakhir. Masuk kembali untuk menghapus catatan." };

  const result = await deleteTrackerRecord(supabase, id);
  if (!result.ok) {
    return {
      ok: false,
      message:
        result.reason === "not_found"
          ? "Catatan tidak ditemukan atau sudah dihapus."
          : "Catatan belum berhasil dihapus. Coba lagi.",
    };
  }
  revalidatePath("/health-tracker/riwayat");
  return { ok: true };
}
