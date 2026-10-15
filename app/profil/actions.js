"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateProfile } from "@/lib/validations/authValidation";
import { updateDisplayName } from "@/lib/repositories/profileRepository";

export async function updateProfileAction(_prev, formData) {
  const validation = validateProfile(formData);
  if (!validation.ok) return { status: "error", errors: validation.errors, values: validation.values };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/masuk?next=/profil");

  const result = await updateDisplayName(supabase, data.claims.sub, validation.values.displayName);
  if (!result.ok) return { status: "error", message: result.message, values: validation.values };

  // Nama juga disimpan di metadata akun agar header langsung menampilkan nama terbaru.
  await supabase.auth.updateUser({ data: { display_name: validation.values.displayName } });
  revalidatePath("/", "layout");
  return { status: "saved", values: validation.values };
}

// WF-10 screen 72. Logout memanggil signOut(), bukan sekadar pindah halaman.
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
