import { BadgeCheck } from "lucide-react";
import { DraftBadge } from "@/components/content/DraftContent";

// Status konten selalu terlihat: draf berlabel (K-01) atau sudah ditinjau (T3-5).
export function ContentStatus({ item }) {
  if (item.status !== "approved") return <DraftBadge />;
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(item.approvedAt));
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1 text-xs font-semibold">
      <BadgeCheck className="size-3.5 text-primary-pressed" aria-hidden="true" />
      Sudah ditinjau · {date}
    </p>
  );
}
