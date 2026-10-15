import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { EnvironmentHome } from "@/components/environment/EnvironmentHome";

// WF-01 — Beranda (Guest & Member). Data lingkungan diambil dari server (BMKG, ISPU, Open-Meteo);
// tidak ada angka contoh yang ditampilkan sebagai data real-time.
export default function BerandaPage() {
  return (
    <PageShell
      eyebrow="Beranda"
      title="Kenali lingkunganmu, proteksi awalmu."
      description="Lihat kondisi lingkungan di lokasi pilihanmu, pahami artinya, dan temukan langkah perlindungan yang sesuai dengan rencanamu."
      panel={
        <div className="space-y-4">
          <SupportPanel title="Mengapa lokasi dibutuhkan?">
            <p>Lokasi dipakai untuk menampilkan kondisi lingkungan di wilayah yang kamu pilih.</p>
            <p>Kamu tetap bisa memilih lokasi secara manual tanpa memberi izin lokasi otomatis.</p>
          </SupportPanel>
          <SupportPanel title="Sumber data">
            <p>Suhu & kelembapan: Sumber: BMKG (prakiraan). Cadangan: Open-Meteo (CC BY 4.0).</p>
            <p>Kualitas udara: KLH/BPLH — ISPU. Cadangan: US AQI dari Open-Meteo (CC BY 4.0).</p>
            <p>Indeks UV: Open-Meteo (CC BY 4.0). Heat Index: dihitung SYCLE (metode NWS/NOAA).</p>
            <p>Data stasiun dan model bukan ukuran paparan pribadimu.</p>
          </SupportPanel>
        </div>
      }
    >
      <EnvironmentHome />
    </PageShell>
  );
}
