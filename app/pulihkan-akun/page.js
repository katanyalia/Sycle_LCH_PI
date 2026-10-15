import { PageShell } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Pemulihan akses akun" };

// WF-09 screen 67. Autentikasi memakai Supabase Auth pada Tahap 5.
export default function Page() {
  return (
    <PageShell eyebrow="Akun" title="Pulihkan akses ke akunmu.">
      <PlannedFeature stage={5} screens="67">
        Autentikasi belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
