"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateNewPassword } from "@/lib/validations/authValidation";
import { authErrorMessage } from "@/lib/auth/errors";

// Mengganti kata sandi memakai sesi pemulihan dari tautan email.
export async function updatePasswordAction(_prev, formData) {
  const validation = validateNewPassword(formData);
  if (!validation.ok) return { status: "error", errors: validation.errors };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { status: "error", message: "Sesi pemulihan tidak ditemukan atau sudah berakhir. Minta tautan baru." };

  const { error } = await supabase.auth.updateUser({ password: validation.values.password });
  if (error) return { status: "error", message: authErrorMessage(error) };
  redirect("/profil?kata-sandi=diperbarui");
}
