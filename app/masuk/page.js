import { PageShell } from "@/components/layout/PageShell";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";

export const metadata = { title: "Login" };

// WF-09 screen 66, 68. Autentikasi memakai Supabase Auth pada Tahap 5.
export default function Page() {
  return (
    <PageShell eyebrow="Akun" title="Masuk ke akun SYCLE.">
      <PlannedFeature stage={5} screens="66, 68">
        Autentikasi belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
