"use client";

import { PageShell } from "@/components/layout/PageShell";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { Button } from "@/components/ui/button";

// Pesan error ringkas tanpa detail teknis (Lampiran B wireframe).
export default function GlobalError({ reset }) {
  return (
    <PageShell title="Terjadi kendala">
      <StatusMessage
        variant="error"
        title="Halaman belum dapat ditampilkan."
        action={<Button onClick={() => reset()}>Coba Lagi</Button>}
      >
        Silakan coba lagi beberapa saat lagi.
      </StatusMessage>
    </PageShell>
  );
}
