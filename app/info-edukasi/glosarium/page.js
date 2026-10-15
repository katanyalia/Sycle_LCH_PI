import { PageShell } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Glosarium" };

// WF-08 screen 64.
export default function GlosariumPage() {
  return (
    <PageShell eyebrow="Info & Edukasi · Glosarium" title="Arti istilah yang digunakan SYCLE.">
      <PlannedFeature stage={3} screens="64">
        Daftar istilah (Heat Index, ISPU, US AQI, UV, dan lainnya) belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
