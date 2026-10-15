// Validasi input Riwayat & penghapusan data (Tahap 7). Klien tidak dipercaya.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isRecordId = (value) => typeof value === "string" && UUID.test(value);

// Kursor "Lihat catatan sebelumnya": waktu ISO dari catatan terakhir di halaman sebelumnya.
export function parseCursor(value) {
  if (typeof value !== "string" || value.length > 40) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// T7-4: penghapusan massal hanya bila pengguna mengetik HAPUS (huruf kapital).
export const DELETE_CONFIRMATION_WORD = "HAPUS";
export const isDeleteConfirmed = (value) => typeof value === "string" && value.trim() === DELETE_CONFIRMATION_WORD;
