import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, NotebookPen, Plus } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { RecordList } from "@/components/history/RecordList";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { listTrackerRecords } from "@/lib/repositories/trackerRepository";
import { parseCursor } from "@/lib/validations/recordValidation";
import { buildRecordCard } from "@/lib/tracker/record";

export const metadata = { title: "Riwayat catatan" };

const panel = (
  <SupportPanel title="Privasi Riwayat">
    <p>Catatan hanya muncul setelah kamu memilih Simpan Catatan.</p>
    <p>Hanya kamu yang dapat melihat catatanmu.</p>
    <p>
      <Link href="/profil/privasi" className="font-semibold text-primary-pressed hover:underline">
        Privasi dan pengelolaan data
      </Link>
    </p>
  </SupportPanel>
);

// WF-06 screen 54 (belum ada catatan) & 55 (daftar). 50 catatan per halaman, terbaru di atas (T7-5).
export default async function RiwayatPage({ searchParams }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/masuk?next=/health-tracker/riwayat");

  const { sebelum, dihapus } = await searchParams;
  const before = parseCursor(sebelum);
  const result = await listTrackerRecords(supabase, { before });

  return (
    <PageShell eyebrow="Health Tracker · Riwayat" title="Catatan yang pernah kamu simpan." panel={panel}>
      {dihapus === "1" && <StatusMessage variant="success" title="Catatan berhasil dihapus." />}

      {!result.ok ? (
        <StatusMessage
          variant="error"
          title="Riwayat belum dapat dimuat"
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/health-tracker/riwayat">Coba Lagi</Link>
            </Button>
          }
        >
          {result.reason === "not_ready"
            ? "Penyimpanan catatan belum siap di database."
            : "Terjadi gangguan saat mengambil catatanmu. Catatanmu tidak berubah."}
        </StatusMessage>
      ) : result.records.length === 0 && !before ? (
        <StatusMessage
          variant="empty"
          title="Belum ada catatan tersimpan."
          action={
            <Button asChild>
              <Link href="/health-tracker">
                <Plus aria-hidden="true" />
                Buat Catatan
              </Link>
            </Button>
          }
        >
          Catatan hanya muncul di sini setelah kamu memilih Simpan Catatan. Kamu bebas mencatat kapan saja.
        </StatusMessage>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {before ? "Catatan sebelumnya" : "Catatan terbaru"} · urut dari yang paling baru
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/health-tracker">
                <NotebookPen aria-hidden="true" />
                Buat Catatan Baru
              </Link>
            </Button>
          </div>
          {result.records.length > 0 ? (
            <RecordList cards={result.records.map(buildRecordCard)} />
          ) : (
            <StatusMessage variant="empty" title="Tidak ada catatan yang lebih lama." />
          )}
          <nav aria-label="Halaman Riwayat" className="flex flex-wrap gap-2">
            {before && (
              <Button asChild variant="ghost">
                <Link href="/health-tracker/riwayat">
                  <ArrowLeft aria-hidden="true" />
                  Kembali ke Catatan Terbaru
                </Link>
              </Button>
            )}
            {result.hasMore && (
              <Button asChild variant="outline">
                <Link href={`/health-tracker/riwayat?sebelum=${encodeURIComponent(result.records.at(-1).recorded_at)}`}>
                  Lihat Catatan Sebelumnya
                  <ChevronRight aria-hidden="true" />
                </Link>
              </Button>
            )}
          </nav>
        </>
      )}
    </PageShell>
  );
}
