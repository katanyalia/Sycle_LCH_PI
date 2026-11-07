"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteTrackerRecord } from "@/lib/repositories/trackerRepository";
import { getMyTrackerEntryDetail } from "@/lib/tracker/records";

export async function deleteTrackerHistory(recordId) {
  if (!recordId || typeof recordId !== "string") {
    return {
      ok: false,
      message: "ID riwayat tidak valid.",
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Silakan login untuk menghapus riwayat.",
    };
  }

  const supabase = await createClient();

  const result = await deleteTrackerRecord(supabase, recordId);

  if (!result.ok) {
    if (result.reason === "not_found") {
      return {
        ok: false,
        message: "Riwayat tidak ditemukan atau sudah dihapus.",
      };
    }

    return {
      ok: false,
      message: "Riwayat belum berhasil dihapus. Silakan coba lagi.",
    };
  }

  return { ok: true };
}

export async function getTrackerHistoryDetail(recordId) {
  const result = await getMyTrackerEntryDetail(recordId);

  return result;
}