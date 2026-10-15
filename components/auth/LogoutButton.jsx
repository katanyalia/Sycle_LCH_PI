"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { signOutAction } from "@/app/profil/actions";

// WF-10 screen 72 — konfirmasi logout.
export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" disabled={pending}>
          <LogOut aria-hidden="true" />
          {pending ? "Keluar…" : "Logout"}
        </Button>
      }
      title="Keluar dari akun SYCLE?"
      description="Tindakan keluar mengakhiri sesi login. Data yang sudah tersimpan tetap mengikuti akunmu. Catatan Health Tracker yang belum disimpan tidak akan disimpan otomatis."
      confirmLabel="Logout"
      onConfirm={() => startTransition(() => signOutAction())}
    />
  );
}
