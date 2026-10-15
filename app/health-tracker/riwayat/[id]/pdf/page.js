import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageShell, SupportPanel } from "@/components/layout/PageShell";
import { RecordDetail } from "@/components/history/RecordDetail";
import { RecordUnavailable } from "@/components/history/RecordUnavailable";
import { PdfDownloadButton } from "@/components/history/PdfDownloadButton";
import { Button } from "@/components/ui/button";
import { loadRecordView } from "@/lib/services/trackerRecordService";
import { RECORD_NOTES } from "@/lib/tracker/record";

export const metadata = { title: "Pratinjau PDF" };

// WF-06 screen 57 — pratinjau isi PDF lalu unduh file PDF (Route Handler memverifikasi pemilik).
export default async function PratinjauPdfPage({ params }) {
  const { id } = await params;
  const result = await loadRecordView(id);
  if (result.status === "guest") redirect(`/masuk?next=/health-tracker/riwayat/${encodeURIComponent(id)}/pdf`);

  return (
    <PageShell
      eyebrow="Health Tracker · Riwayat · PDF"
      title="Ringkasan catatan untuk dibawa atau dibagikan."
      panel={
        <SupportPanel title="Dokumen bukan diagnosis">
          <p>PDF hanya dibuat dari catatan yang sudah kamu simpan.</p>
          <p>Isi PDF sama dengan pratinjau ini, termasuk sumber dan waktu data lingkungan.</p>
          <p>Simpan atau bagikan PDF hanya kepada pihak yang kamu percaya.</p>
        </SupportPanel>
      }
    >
      {result.status !== "ok" ? (
        <RecordUnavailable reason={result.reason} />
      ) : (
        <>
          <p className="flex gap-2 rounded-xl border bg-blush p-4 text-sm font-semibold">
            <ShieldCheck className="size-5 shrink-0 text-primary-pressed" aria-hidden="true" />
            {RECORD_NOTES.nonDiagnostic}
          </p>
          <div className="rounded-2xl border-2 border-dashed border-border p-4 md:p-6" aria-label="Pratinjau isi PDF">
            <p className="mb-1 text-sm font-semibold text-primary">SYCLE V2</p>
            <h2 className="mb-4 text-xl font-bold">Catatan Health Tracker</h2>
            <RecordDetail view={result.view} />
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <Button asChild variant="ghost">
              <Link href={`/health-tracker/riwayat/${result.view.id}`}>
                <ArrowLeft aria-hidden="true" />
                Kembali
              </Link>
            </Button>
            <PdfDownloadButton recordId={result.view.id} />
          </div>
        </>
      )}
    </PageShell>
  );
}
