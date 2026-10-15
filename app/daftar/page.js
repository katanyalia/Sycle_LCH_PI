import { PageShell } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Daftar akun" };

// WF-09 screen 65. Autentikasi memakai Supabase Auth pada Tahap 5.
export default function Page() {
  return (
    <PageShell eyebrow="Akun" title="Buat akun untuk menggunakan Health Tracker.">
      <PlannedFeature stage={5} screens="65">
        Autentikasi belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
