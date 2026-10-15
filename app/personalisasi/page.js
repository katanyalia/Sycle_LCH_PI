import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { PersonalizationFlow } from "@/components/personalization/PersonalizationFlow";

export const metadata = { title: "Personalisasi" };

// WF-02 screen 13–23. Guest & Member, tanpa login. Jawaban hanya di memori (K-07).
export default function PersonalisasiPage() {
  return (
    <PageShell
      eyebrow="Beranda · Personalisasi"
      title="Dapatkan panduan berdasarkan rencana aktivitasmu."
      panel={
        <SupportPanel title="Privasi jawaban">
          <p>Jawabanmu tidak otomatis disimpan dan tidak menjadi riwayat.</p>
          <p>Jawaban hilang bila halaman ditutup atau dimuat ulang.</p>
          <p>Personalisasi bukan pemeriksaan kesehatan atau penilaian risiko medis.</p>
        </SupportPanel>
      }
    >
      <PersonalizationFlow />
    </PageShell>
  );
}
