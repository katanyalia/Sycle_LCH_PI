// Penghapusan akun (screen 71, T7-1). Memakai client admin (kunci rahasia, server saja).
// Menghapus baris auth.users; profiles dan tracker_records ikut terhapus lewat ON DELETE CASCADE
// (migration 001 & 002), lalu item & kondisi lingkungan ikut terhapus dari tracker_records.
export async function deleteAuthUser(adminClient, userId) {
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    console.error("deleteAuthUser gagal:", error.status ?? error.code ?? "unknown");
    return { ok: false };
  }
  return { ok: true };
}
