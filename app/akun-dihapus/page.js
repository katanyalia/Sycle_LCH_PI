import Link from "next/link";
import { House } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Akun dihapus", robots: { index: false } };

// WF-10 screen 71 — hasil berhasil hapus akun. Ditampilkan hanya lewat redirect setelah server
// mengonfirmasi penghapusan (deleteAccountAction).
export default function AkunDihapusPage() {
  return (
    <PageShell eyebrow="Profil" title="Akunmu sudah dihapus.">
      <StatusMessage
        variant="success"
        title="Akun, profil, dan semua catatan Tracker telah dihapus."
        action={
          <Button asChild>
            <Link href="/">
              <House aria-hidden="true" />
              Kembali ke Beranda
            </Link>
          </Button>
        }
      >
        Kamu sudah keluar dari perangkat ini. Kamu tetap bisa memakai Beranda, Personalisasi, Info & Edukasi, dan Tanya
        SYCLE tanpa login.
      </StatusMessage>
    </PageShell>
  );
}
