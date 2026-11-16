// Tahap 8 — Web App Manifest (PWA, K-06). Next.js menyajikannya di /manifest.webmanifest.
export default function manifest() {
  return {
    name: "Sycle V2 — Kenali Lingkunganmu, Proteksi Awalmu.",
    short_name: "SYCLE",
    description:
      "Sycle membantu perempuan memahami kondisi lingkungan, memperoleh edukasi kesehatan berbasis bukti, dan mencatat pengalaman tubuh secara sukarela.",
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFF8FB",
    theme_color: "#FFF8FB",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      // Versi maskable: logo diberi ruang tepi agar tidak terpotong saat Android memotong ikon (lingkaran/kotak).
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
