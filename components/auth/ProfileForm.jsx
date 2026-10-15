"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/auth/FormField";
import { updateProfileAction } from "@/app/profil/actions";

export function ProfileForm({ displayName }) {
  const [state, action, pending] = useActionState(updateProfileAction, { status: "idle" });
  return (
    <form action={action} className="space-y-3" noValidate>
      <FormError message={state.message} />
      {state.status === "saved" && (
        <p role="status" className="rounded-lg bg-sage px-3 py-2 text-sm">
          Nama tersimpan.
        </p>
      )}
      <FormField id="displayName" label="Nama panggilan" autoComplete="nickname" defaultValue={state.values?.displayName ?? displayName ?? ""} error={state.errors?.displayName} />
      <Button type="submit" disabled={pending}>
        <Save aria-hidden="true" />
        {pending ? "Menyimpan…" : "Simpan Nama"}
      </Button>
    </form>
  );
}
