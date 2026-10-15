"use client";

import { useActionState, useState } from "react";
import { ShieldAlert, Trash2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormError, FormField } from "@/components/auth/FormField";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { deleteAccountAction, deleteAllTrackerRecordsAction } from "@/app/profil/privasi/actions";

const WORD = "HAPUS";

// WF-10 screen 71 — dua tindakan terpisah (T7-3), masing-masing dengan cakupan yang dijelaskan dan
// konfirmasi mengetik HAPUS (T7-4). Tidak ada penghapusan tanpa konfirmasi eksplisit.
export function DataDeletion({ recordCount }) {
  const [deletedCount, setDeletedCount] = useState(null);
  const countText = recordCount === null ? "semua catatan" : `${recordCount} catatan`;

  return (
    <div className="space-y-4">
      {deletedCount !== null && (
        <StatusMessage variant="success" title="Catatan Tracker berhasil dihapus">
          {deletedCount} catatan dihapus dari akunmu. Akun dan profilmu tetap ada.
        </StatusMessage>
      )}

      <div className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <Trash2 className="size-5 text-primary-pressed" aria-hidden="true" />
          Hapus semua catatan Tracker
        </h3>
        <p className="text-sm text-muted-foreground">
          Menghapus {countText} beserta jawaban dan kondisi lingkungannya. Akun dan profilmu tetap ada, dan kamu tetap
          bisa membuat catatan baru.
        </p>
        <TypedDeleteDialog
          triggerLabel="Hapus Semua Catatan"
          triggerIcon={Trash2}
          disabled={recordCount === 0}
          title="Hapus semua catatan Tracker?"
          scope={[
            `${countText[0].toUpperCase()}${countText.slice(1)} tersimpan akan dihapus permanen, termasuk jawaban, skala, cerita, dan kondisi lingkungan.`,
            "PDF yang sudah kamu unduh sebelumnya tidak ikut terhapus dari perangkatmu.",
            "Akun, nama profil, dan email tetap ada.",
          ]}
          confirmLabel="Konfirmasi Hapus"
          action={deleteAllTrackerRecordsAction}
          onDone={(state) => setDeletedCount(state.count)}
        />
        {recordCount === 0 && <p className="text-sm text-muted-foreground">Belum ada catatan tersimpan untuk dihapus.</p>}
      </div>

      <div className="space-y-3 rounded-xl border border-destructive/30 bg-card p-4 md:p-6">
        <h3 className="flex items-center gap-2 font-semibold">
          <UserX className="size-5 text-destructive" aria-hidden="true" />
          Hapus akun
        </h3>
        <p className="text-sm text-muted-foreground">
          Menghapus akun SYCLE-mu beserta profil dan semua catatan Tracker. Setelah itu kamu tetap bisa memakai fitur Guest
          tanpa login.
        </p>
        <TypedDeleteDialog
          triggerLabel="Hapus Akun"
          triggerIcon={UserX}
          title="Hapus akun SYCLE?"
          scope={[
            "Akun (email dan kata sandi) dihapus permanen; kamu tidak bisa masuk lagi dengan akun ini.",
            "Profil dan semua catatan Tracker beserta kondisi lingkungannya ikut terhapus.",
            "Kamu akan keluar dari perangkat ini. Tindakan ini tidak dapat dibatalkan.",
          ]}
          confirmLabel="Hapus Akun"
          action={deleteAccountAction}
        />
      </div>
    </div>
  );
}

function TypedDeleteDialog({ triggerLabel, triggerIcon: Icon, disabled, title, scope, confirmLabel, action, onDone }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  async function submit(prev, formData) {
    const result = await action(prev, formData);
    if (result?.status === "deleted") {
      setOpen(false);
      setTyped("");
      onDone?.(result);
    }
    return result;
  }
  const [state, formAction, pending] = useActionState(submit, { status: "idle" });

  function changeOpen(next) {
    if (pending) return;
    setOpen(next);
    if (!next) setTyped("");
  }

  return (
    <AlertDialog open={open} onOpenChange={changeOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" disabled={disabled}>
          <Icon aria-hidden="true" />
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-destructive" aria-hidden="true" />
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="list-disc space-y-1 pl-5 text-left">
                {scope.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <FormField
            id="konfirmasi"
            label={`Ketik ${WORD} untuk mengonfirmasi`}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            disabled={pending}
          />
          {state.status === "error" && open && <FormError message={state.message} />}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
            <Button type="submit" disabled={typed.trim() !== WORD || pending} className="bg-destructive text-white hover:bg-destructive/90">
              <Trash2 aria-hidden="true" />
              {pending ? "Menghapus…" : confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
