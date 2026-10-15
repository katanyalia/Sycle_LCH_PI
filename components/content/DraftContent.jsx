import { FileWarning } from "lucide-react";
import { SHOW_DRAFT_CONTENT } from "@/lib/config";

// Pembungkus untuk konten kesehatan yang BELUM ditinjau (K-01).
// Bila sakelar dimatikan, konten tidak dirender sama sekali.
export function DraftContent({ children }) {
  if (!SHOW_DRAFT_CONTENT) return null;

  return (
    <div className="rounded-xl border border-dashed border-input bg-card p-4">
      <DraftBadge />
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function DraftBadge() {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-xs font-semibold text-primary-pressed">
      <FileWarning className="size-3.5" aria-hidden="true" />
      Konten draf — belum ditinjau
    </p>
  );
}
