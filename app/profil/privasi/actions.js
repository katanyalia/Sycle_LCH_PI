"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDeleteConfirmed } from "@/lib/validations/recordValidation";
import { deleteAllTrackerRecords } from "@/lib/repositories/trackerRepository";
import { deleteAuthUser } from "@/lib/repositories/accountRepository";

const NOT_CONFIRMED = { status: "error", message: "Ketik HAPUS (huruf kapital) untuk mengonfirmasi." };
const SESSION_ENDED = { status: "error", message: "Sesi login berakhir. Masuk kembali untuk melanjutkan." };

async function currentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub ?? null };
}

// WF-10 screen 71 — "Hapus semua catatan Tracker" (T7-3). Akun dan profil tetap ada.
export async function deleteAllTrackerRecordsAction(_prev, formData) {
  if (!isDeleteConfirmed(formData.get("konfirmasi"))) return NOT_CONFIRMED;
  const { supabase, userId } = await currentUser();
  if (!userId) return SESSION_ENDED;

  const result = await deleteAllTrackerRecords(supabase, userId);
  if (!result.ok) return { status: "error", message: "Catatan belum berhasil dihapus. Coba lagi." };

  revalidatePath("/health-tracker/riwayat");
  revalidatePath("/profil/privasi");
  return { status: "deleted", count: result.count };
}

// WF-10 screen 71 — "Hapus akun" (T7-1, T7-3). Hanya akun milik sesi yang sedang login (ID dari token
// terverifikasi, bukan dari formulir). Kunci rahasia dipakai di server saja.
export async function deleteAccountAction(_prev, formData) {
  if (!isDeleteConfirmed(formData.get("konfirmasi"))) return NOT_CONFIRMED;
  const { supabase, userId } = await currentUser();
  if (!userId) return SESSION_ENDED;

  const admin = createAdminClient();
  if (!admin) {
    return { status: "error", message: "Penghapusan akun belum dikonfigurasi di server. Akunmu tidak berubah." };
  }
  const result = await deleteAuthUser(admin, userId);
  if (!result.ok) return { status: "error", message: "Akun belum berhasil dihapus. Akun dan catatanmu tidak berubah; coba lagi." };

  // Akun sudah tidak ada: hapus cookie sesi di perangkat ini tanpa memanggil server Auth.
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/akun-dihapus");
}
