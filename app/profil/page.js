import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { PlannedFeature } from "@/components/feedback/PlannedFeature";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Profil" };

// WF-10 screen 69–72 (Member). Selama autentikasi belum ada (Tahap 5), Guest melihat
// keadaan "access restriction" dengan jalan masuk ke Login/Daftar — penting di ponsel,
// karena tautan Masuk di header hanya muncul mulai lebar tablet.
export default function ProfilPage() {
  return (
    <PageShell eyebrow="Profil" title="Kelola akun dan pengaturanmu.">
      <StatusMessage
        variant="restricted"
        title="Profil tersedia untuk Member"
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/masuk?next=/profil">
                <LogIn aria-hidden="true" />
                Masuk
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/daftar?next=/profil">
                <UserPlus aria-hidden="true" />
                Daftar
              </Link>
            </Button>
          </div>
        }
      >
        Masuk untuk mengelola akun, privasi, dan data milikmu.
      </StatusMessage>
      <PlannedFeature stage="5 dan 7" screens="69–72">
        Profil, privasi dan pengelolaan data, penghapusan data/akun, serta logout belum aktif.
      </PlannedFeature>
    </PageShell>
  );
}
