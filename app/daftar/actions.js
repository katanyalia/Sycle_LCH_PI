"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateSignUp } from "@/lib/validations/authValidation";
import { authErrorMessage } from "@/lib/auth/errors";
import { getOrigin } from "@/lib/auth/origin";
import { safeNextPath } from "@/lib/auth/redirect";

// WF-09 screen 65. Pendaftaran TIDAK digabung dengan persetujuan AI #3 (CLAUDE.md §7).
export async function signUpAction(_prev, formData) {
  const validation = validateSignUp(formData);
  const { password, ...safeValues } = validation.values;
  if (!validation.ok) return { status: "error", errors: validation.errors, values: safeValues };

  const next = safeNextPath(String(formData.get("next") ?? ""), "/health-tracker");
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: validation.values.email,
    password,
    options: {
      data: { display_name: validation.values.displayName },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { status: "error", message: authErrorMessage(error), values: safeValues };

  // Konfirmasi email nonaktif → sesi langsung ada.
  if (data.session) redirect(next);

  // Konfirmasi email aktif. Pesan sama untuk email baru maupun yang sudah terdaftar
  // (Supabase tidak mengirim error untuk email terdaftar) — tidak membocorkan keberadaan akun.
  return { status: "verify", email: validation.values.email };
}
