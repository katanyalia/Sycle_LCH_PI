import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Tanya SYCLE" };

// WF-07 screen 59. AI #4 belum diintegrasikan (menunggu K-04 & evidence).
export default function TanyaSyclePage() {
  return (
    <PageShell
      eyebrow="Beranda · Tanya SYCLE"
      title="Tanyakan hal umum tentang lingkungan dan kesehatan perempuan."
      panel={
        <SupportPanel title="Tentang Tanya SYCLE">
          <p>Tanya SYCLE bukan tenaga kesehatan dan tidak memberikan diagnosis.</p>
          <p>Tanya SYCLE tidak membaca catatan Health Tracker-mu.</p>
        </SupportPanel>
      }
    >
      <PlannedFeature stage={9} screens="59–61">
        Fitur tanya jawab memerlukan sumber yang disetujui dan keputusan penyedia AI.
      </PlannedFeature>
    </PageShell>
  );
}
