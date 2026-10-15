import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/feedback/StatusMessage";

// Catatan tidak ada / milik akun lain / gagal dimuat. Pesan sama untuk "tidak ada" dan "milik orang lain"
// agar keberadaan catatan orang lain tidak terungkap (AC-18).
export function RecordUnavailable({ reason }) {
  const notFound = reason === "not_found";
  return (
    <StatusMessage
      variant={notFound ? "empty" : "error"}
      title={notFound ? "Catatan tidak ditemukan" : "Catatan belum dapat dimuat"}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/health-tracker/riwayat">
            <ArrowLeft aria-hidden="true" />
            Kembali ke Riwayat
          </Link>
        </Button>
      }
    >
      {notFound
        ? "Catatan ini tidak ada atau sudah dihapus."
        : "Terjadi gangguan saat mengambil catatan. Catatanmu tidak berubah; coba lagi."}
    </StatusMessage>
  );
}
