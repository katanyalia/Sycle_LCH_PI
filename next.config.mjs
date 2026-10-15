/** @type {import('next').NextConfig} */
const nextConfig = {
  // Indikator dev Next.js disembunyikan agar tidak menutupi navigasi bawah ponsel saat review.
  devIndicators: false,
  // cacheComponents & partialPrefetching (bawaan create-next-app) sengaja tidak diaktifkan
  // agar perilaku data fetching & revalidatePath sama dengan materi mentor.
  // Tahap 8 (K-06): service worker selalu diperiksa ulang agar versi baru cepat terpasang.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
