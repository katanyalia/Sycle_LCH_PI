/** @type {import('next').NextConfig} */
const nextConfig = {
  // Indikator dev Next.js disembunyikan agar tidak menutupi navigasi bawah ponsel saat review.
  devIndicators: false,
  // cacheComponents & partialPrefetching (bawaan create-next-app) sengaja tidak diaktifkan
  // agar perilaku data fetching & revalidatePath sama dengan materi mentor.
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
