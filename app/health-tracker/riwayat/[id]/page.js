import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { RecordDetail } from "@/components/history/RecordDetail";
import { RecordUnavailable } from "@/components/history/RecordUnavailable";
import { DeleteRecordButton } from "@/components/history/DeleteRecordButton";
import { Button } from "@/components/ui/button";
import { loadRecordView } from "@/lib/services/trackerRecordService";

export const metadata = { title: "Detail catatan" };

// WF-06 screen 56 — detail catatan tersimpan: Kembali | Unduh PDF | Hapus Catatan.
export default async function DetailCatatanPage({ params }) {
  const { id } = await params;
  const result = await loadRecordView(id);
  if (result.status === "guest") redirect(`/masuk?next=/health-tracker/riwayat/${encodeURIComponent(id)}`);

  return (
    <PageShell
      eyebrow="Health Tracker · Riwayat"
      title="Detail catatan pengalaman tubuh."
      panel={
        <SupportPanel title="Data milik akunmu">
          <p>Catatan ini hanya dapat dilihat olehmu.</p>
          <p>Catatan tersimpan tidak dapat diubah. Kamu dapat mengunduhnya sebagai PDF atau menghapusnya.</p>
        </SupportPanel>
      }
    >
      {result.status !== "ok" ? (
        <RecordUnavailable reason={result.reason} />
      ) : (
        <>
          <RecordDetail view={result.view} />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost">
              <Link href="/health-tracker/riwayat">
                <ArrowLeft aria-hidden="true" />
                Kembali
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/health-tracker/riwayat/${result.view.id}/pdf`}>
                <FileText aria-hidden="true" />
                Unduh PDF
              </Link>
            </Button>
            <DeleteRecordButton recordId={result.view.id} timeText={result.view.timeText} />
          </div>
        </>
      )}
    </PageShell>
  );
}
