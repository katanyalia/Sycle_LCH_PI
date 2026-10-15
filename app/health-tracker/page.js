import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Health Tracker" };

// WF-04 screen 27 — Gerbang akses. Autentikasi sungguhan dibangun pada Tahap 5.
export default function HealthTrackerPage() {
  return (
    <PageShell eyebrow="Health Tracker" title="Catat pengalaman tubuhmu secara sukarela.">
      <StatusMessage
        variant="restricted"
        title="Health Tracker tersedia untuk Member"
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/masuk?next=/health-tracker">
                <LogIn aria-hidden="true" />
                Login
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/daftar?next=/health-tracker">
                <UserPlus aria-hidden="true" />
                Daftar
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        }
      >
        Login untuk mencatat pengalaman tubuh. Belum punya akun? Daftar.
      </StatusMessage>
      <PlannedFeature stage="5–6" screens="27–53">
        Login, formulir pencatatan, ringkasan, dan penyimpanan catatan belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
