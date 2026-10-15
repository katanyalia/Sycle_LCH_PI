import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Skeleton } from "@/components/ui/skeleton";

// State loading Riwayat (screen 55).
export default function RiwayatLoading() {
  return (
    <PageShell eyebrow="Health Tracker · Riwayat" title="Catatan yang pernah kamu simpan.">
      <StatusMessage variant="loading" title="Memuat catatanmu…" />
      <div className="space-y-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </PageShell>
  );
}
