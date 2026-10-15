import { PageShell } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Panduan perlindungan umum" };

// WF-01 screen 10. Isi panduan menunggu evidence (K-01): tidak ada panduan yang ditulis di sini.
export default function PanduanUmumPage() {
  return (
    <PageShell eyebrow="Beranda" title="Langkah sederhana yang dapat kamu pertimbangkan.">
      <PlannedFeature stage={3} screens="10">
        Panduan perlindungan terkait panas, kualitas udara, dan UV akan ditampilkan dari sumber yang
        sudah ditinjau, atau sebagai konten draf berlabel.
      </PlannedFeature>
    </PageShell>
  );
}
