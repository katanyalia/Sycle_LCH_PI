"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { deleteTrackerRecordAction } from "@/app/health-tracker/riwayat/actions";

// WF-06 screen 58 — konfirmasi hapus satu catatan. Pindah ke Riwayat hanya setelah server mengonfirmasi.
export function DeleteRecordButton({ recordId, timeText }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTrackerRecordAction(recordId);
      if (result.ok) router.push("/health-tracker/riwayat?dihapus=1");
      else setError(result.message);
    });
  }

  return (
    <>
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" disabled={pending}>
            <Trash2 aria-hidden="true" />
            {pending ? "Menghapus…" : "Hapus Catatan"}
          </Button>
        }
        title="Hapus catatan ini?"
        description={`Catatan tanggal ${timeText} beserta jawaban dan kondisi lingkungannya akan dihapus permanen dari akunmu. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Catatan"
        destructive
        onConfirm={remove}
      />
      {error && (
        <StatusMessage variant="error" title="Catatan belum terhapus" className="basis-full">
          {error}
        </StatusMessage>
      )}
    </>
  );
}
