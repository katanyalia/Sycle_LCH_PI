"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateSignIn } from "@/lib/validations/authValidation";
import { authErrorMessage } from "@/lib/auth/errors";
import { safeNextPath } from "@/lib/auth/redirect";

// WF-09 screen 66 & 68.
export async function signInAction(_prev, formData) {
  const validation = validateSignIn(formData);
  const values = { email: validation.values.email };
  if (!validation.ok) return { status: "error", errors: validation.errors, values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validation.values);
  if (error) {
    return { status: "error", message: authErrorMessage(error), code: error.code ?? null, values };
  }
  redirect(safeNextPath(String(formData.get("next") ?? ""), "/profil"));
}
