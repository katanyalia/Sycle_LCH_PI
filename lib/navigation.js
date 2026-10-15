import { BookOpen, House, NotebookPen, UserRound } from "lucide-react";

// Empat menu utama LOCKED (Master Draft 1.4). Jangan menambah menu utama baru.
// Ikon sesuai Lampiran D wireframe; label teks selalu ditampilkan.
export const MAIN_NAV = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/health-tracker", label: "Health Tracker", icon: NotebookPen },
  { href: "/info-edukasi", label: "Info & Edukasi", icon: BookOpen },
  { href: "/profil", label: "Profil", icon: UserRound },
];

// Menu aktif juga untuk sub-halaman, mis. /health-tracker/riwayat → Health Tracker.
// Personalisasi, Panduan, dan Tanya SYCLE berada di bawah Beranda (Master Draft 8.1.2).
const SECTION_PREFIXES = {
  "/": ["/", "/personalisasi", "/panduan-umum", "/lingkungan", "/tanya-sycle"],
  "/health-tracker": ["/health-tracker"],
  "/info-edukasi": ["/info-edukasi"],
  "/profil": ["/profil", "/masuk", "/daftar", "/pulihkan-akun"],
};

export function isNavItemActive(href, pathname) {
  return SECTION_PREFIXES[href].some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
