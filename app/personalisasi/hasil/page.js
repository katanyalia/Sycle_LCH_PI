import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { PersonalizationResult } from "@/components/personalization/PersonalizationResult";

export const metadata = { title: "Panduan personal" };

// WF-03 screen 24–26.
export default function HasilPersonalisasiPage() {
  return (
    <PageShell
      eyebrow="Beranda · Personalisasi · Hasil"
      title="Panduan perlindungan untuk rencana aktivitasmu."
      panel={
        <SupportPanel title="Cara panduan disusun">
          <p>SYCLE memilih 3–5 langkah dari daftar panduan berdasarkan jawabanmu dan data lingkungan yang valid.</p>
          <p>Saat ini panduan disusun tanpa AI.</p>
          <p>Panduan berlabel draf belum ditinjau dan hanya untuk demonstrasi.</p>
        </SupportPanel>
      }
    >
      <PersonalizationResult />
    </PageShell>
  );
}
