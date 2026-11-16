"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateProfile } from "@/lib/repositories/profileRepository";
import { updateProfileDetails } from "@/lib/repositories/profileRepository";

export async function saveProfile(displayName) {
  if (
    typeof displayName !== "string" ||
    displayName.trim().length < 1 ||
    displayName.trim().length > 60
  ) {
    return {
      ok: false,
      message: "Nama harus terdiri dari 1–60 karakter.",
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Sesi login berakhir. Silakan masuk kembali.",
    };
  }

  const supabase = await createClient();
  const normalizedName = displayName.trim();

  const result = await updateProfile(
    supabase,
    user.id,
    normalizedName
  );

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.reason === "forbidden"
          ? "Kamu tidak memiliki akses untuk mengubah profil ini."
          : "Nama profil gagal disimpan. Silakan coba kembali.",
    };
  }

  // Sinkronkan metadata agar Navbar yang membaca Auth Metadata
  // juga mendapatkan nama terbaru.
  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      display_name: normalizedName,
      full_name: normalizedName,
    },
  });

  if (metadataError) {
    console.error(
      "Sinkronisasi metadata profil gagal:",
      metadataError.message
    );
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return {
    ok: true,
    displayName: result.profile.display_name,
  };
}

export async function saveProfileDetails(details) {
  if (!details || typeof details !== "object") {
    return { ok: false, message: "Data profil tidak valid." };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Sesi login berakhir. Silakan masuk kembali.",
    };
  }

  const supabase = await createClient();

  const result = await updateProfileDetails(
    supabase,
    user.id,
    details
  );

  if (!result.ok) {
    return {
      ok: false,
      message: "Informasi profil gagal disimpan.",
    };
  }

  revalidatePath("/profile");

  return {
    ok: true,
    profile: result.profile,
  };
}