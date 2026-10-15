"use server";

import { createClient } from "@/lib/supabase/server";
import { validateEmailOnly } from "@/lib/validations/authValidation";
import { authErrorMessage } from "@/lib/auth/errors";
import { getOrigin } from "@/lib/auth/origin";

// WF-09 screen 67. Status pengiriman tidak mengungkap apakah email terdaftar.
export async function requestPasswordResetAction(_prev, formData) {
  const validation = validateEmailOnly(formData);
  if (!validation.ok) return { status: "error", errors: validation.errors, values: validation.values };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(validation.values.email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  if (error && error.code?.includes("rate_limit")) return { status: "error", message: authErrorMessage(error), values: validation.values };
  return { status: "sent", values: validation.values };
}
