import { PageShell } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Riwayat catatan" };

// WF-06 screen 54–58. Riwayat hanya berisi catatan yang disimpan secara eksplisit.
export default function RiwayatPage() {
  return (
    <PageShell eyebrow="Health Tracker · Riwayat" title="Catatan yang pernah kamu simpan.">
      <PlannedFeature stage={7} screens="54–58">
        Daftar catatan, detail, PDF, dan penghapusan catatan belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
