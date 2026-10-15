import Link from "next/link";
import { History, LogIn, UserPlus } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Health Tracker" };

// WF-04: Guest → screen 27 (gerbang akses). Member → formulir pencatatan (Tahap 6).
export default async function HealthTrackerPage() {
  const user = await getCurrentUser();

  if (!user) {
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
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Health Tracker"
      title={`Halo${user.displayName ? `, ${user.displayName}` : ""}. Catat pengalaman tubuhmu secara sukarela.`}
    >
      <PlannedFeature stage={6} screens="28–53">
        Formulir pencatatan, ringkasan, dan penyimpanan catatan belum aktif.
      </PlannedFeature>
      <Button asChild variant="outline">
        <Link href="/health-tracker/riwayat">
          <History aria-hidden="true" />
          Riwayat catatan
        </Link>
      </Button>
    </PageShell>
  );
}
