import { NextResponse } from "next/server";
import { educationArticles } from "@/data/education";

// Daftar halaman publik yang disimpan service worker (public/sw.js) agar bisa dibuka offline.
// Dibuat dari data yang sama dengan halaman Info & Edukasi, jadi artikel baru otomatis ikut.
// Tidak memuat data pengguna; Health Tracker, Profil, dan halaman akun sengaja tidak termasuk.

const CORE_PAGES = [
  "/",
  "/generalguidance",
  "/healthcare",
  "/healthtracker/assessment", // formulir check-in statis; catatan offline disimpan di IndexedDB
  "/assessment", // Kenali Aktivitasmu → Personalisasi → Panduan Personal (satu halaman, tanpa data server)
  "/education",
  "/education/glossary",
  "/education/guidance",
  "/education/references",
];

export function GET() {
  const articlePages = educationArticles
    .filter((article) => article.status === "published" && article.slug)
    .map((article) => `/education/${article.slug}`);

  return NextResponse.json({ pages: [...CORE_PAGES, ...articlePages] });
}
