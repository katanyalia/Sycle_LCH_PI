"use server";

import { createClient } from "@/lib/supabase/server";
import { validateEmailOnly } from "@/lib/validations/authValidation";
import { authErrorMessage } from "@/lib/auth/errors";
import { getOrigin } from "@/lib/auth/origin";

// Kirim ulang tautan verifikasi. Pesan sukses selalu sama (tidak membocorkan keberadaan akun).
export async function resendVerificationAction(_prev, formData) {
  const validation = validateEmailOnly(formData);
  if (!validation.ok) return { status: "error", errors: validation.errors, values: validation.values };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: validation.values.email,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/health-tracker` },
  });
  if (error && error.code?.includes("rate_limit")) return { status: "error", message: authErrorMessage(error), values: validation.values };
  return { status: "sent", values: validation.values };
}
