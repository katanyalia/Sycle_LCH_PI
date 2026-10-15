// Pemetaan error Supabase Auth ke pesan yang aman (WF-09 screen 68): tidak mengungkap apakah
// email tertentu terdaftar, dan tidak menampilkan detail teknis.
const MESSAGES = {
  invalid_credentials: "Email atau kata sandi belum sesuai. Periksa kembali, atau gunakan Lupa kata sandi.",
  email_not_confirmed: "Email belum diverifikasi. Buka tautan verifikasi di emailmu, atau kirim ulang tautannya.",
  weak_password: "Kata sandi terlalu lemah. Gunakan kombinasi huruf dan angka yang lebih panjang.",
  same_password: "Kata sandi baru harus berbeda dari kata sandi sebelumnya.",
  over_email_send_rate_limit: "Terlalu banyak email dikirim. Coba lagi beberapa saat lagi.",
  over_request_rate_limit: "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
  signup_disabled: "Pendaftaran akun sedang tidak tersedia.",
  session_not_found: "Sesi sudah berakhir. Silakan masuk kembali.",
  otp_expired: "Tautan sudah kedaluwarsa atau sudah dipakai. Minta tautan baru.",
};

export const GENERIC_AUTH_ERROR = "Permintaan belum berhasil. Coba lagi beberapa saat lagi.";

export function authErrorMessage(error) {
  if (!error) return null;
  return MESSAGES[error.code] ?? GENERIC_AUTH_ERROR;
}
