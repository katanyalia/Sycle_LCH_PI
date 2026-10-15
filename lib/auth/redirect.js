// Tujuan setelah login (WF-09: "kembali ke tujuan awal"). Hanya path internal yang diizinkan,
// agar parameter ?next= tidak bisa dipakai untuk mengalihkan ke situs lain (open redirect).
// /reset-password sengaja TIDAK termasuk: halaman itu tujuan sah tautan pemulihan kata sandi.
const AUTH_PAGES = ["/masuk", "/daftar", "/verifikasi-email", "/lupa-password", "/auth/"];

export function safeNextPath(next, fallback = "/profil") {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  if (/[\r\n\t]/.test(next)) return fallback;
  if (AUTH_PAGES.some((page) => next === page || next.startsWith(page.endsWith("/") ? page : `${page}?`) || next.startsWith(`${page}/`))) {
    return fallback;
  }
  return next;
}

// Halaman yang hanya untuk Member (diperiksa di proxy.js). /health-tracker sendiri menampilkan
// gerbang akses untuk Guest (screen 27); halaman Member lainnya mengalihkan ke /masuk.
export const MEMBER_ONLY_PREFIXES = ["/profil", "/health-tracker/riwayat"];

export function isMemberOnlyPath(pathname) {
  return MEMBER_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// Halaman yang tidak perlu dibuka lagi oleh Member yang sudah masuk.
export function isGuestOnlyPath(pathname) {
  return ["/masuk", "/daftar"].includes(pathname);
}
