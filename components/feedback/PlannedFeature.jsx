import { StatusMessage } from "@/components/feedback/StatusMessage";

// Penanda halaman kerangka Tahap 1. Tidak menampilkan data atau klaim apa pun.
export function PlannedFeature({ stage, screens, children }) {
  return (
    <StatusMessage variant="info" title={`Kerangka halaman — dibangun pada Tahap ${stage}`}>
      {children}
      {screens && <p className="mt-1 text-muted-foreground">Acuan wireframe: screen {screens}.</p>}
    </StatusMessage>
  );
}
