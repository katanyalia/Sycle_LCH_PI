// Parameter teknis data lingkungan. Setiap angka punya dasar dari uji teknis
// (docs/UJI_TEKNIS_K02.md, docs/KEPUTUSAN_K22_K25.md) dan dapat ditinjau ulang.
export const ENVIRONMENT_CONFIG = {
  bmkg: {
    // Prakiraan per 3 jam, diperbarui 2x/hari; batas 60 permintaan/menit/IP.
    revalidateSeconds: 1800,
    // Latensi terukur < 0,2 dtk.
    timeoutMs: 5000,
    // Slot prakiraan dianggap mewakili "sekarang" bila selisihnya ≤ 90 menit (setengah interval 3 jam).
    maxSlotDistanceMinutes: 90,
  },
  openMeteo: {
    // Data "current" beresolusi 15 menit (cuaca) dan 1 jam (kualitas udara).
    revalidateSeconds: 900,
    // Latensi terukur ± 0,5 dtk.
    timeoutMs: 5000,
    // Nilai "current" dianggap terkini bila ≤ 90 menit dari sekarang.
    maxAgeMinutes: 90,
  },
  ispu: {
    // Satu daftar stasiun untuk semua pengguna; data PM2.5 diperbarui per jam.
    revalidateSeconds: 600,
    // Latensi terukur 2–4,4 dtk.
    timeoutMs: 10000,
    // K-24: stasiun hanya dipakai bila ≤ 25 km dan data ≤ 3 jam.
    maxDistanceKm: 25,
    maxAgeMinutes: 180,
  },
};
