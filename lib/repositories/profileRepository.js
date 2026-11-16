const MISSING_CODES = new Set(["42P01", "PGRST202", "PGRST205"]);

export async function getProfile(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      full_name,
      birth_date,
      domicile,
      occupation,
      created_at,
      updated_at
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (MISSING_CODES.has(error.code)) {
      return { ok: false, missingTable: true, profile: null };
    }

    if (error.code === "42501") {
      return { ok: false, reason: "forbidden", profile: null };
    }

    console.error("getProfile gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error", profile: null };
  }

  return {
    ok: true,
    missingTable: false,
    profile: data,
  };
}

export async function updateProfile(supabase, userId, displayName) {
  if (typeof displayName !== "string") {
    return { ok: false, reason: "invalid_name" };
  }

  const normalizedName = displayName.trim();

  if (normalizedName.length < 1 || normalizedName.length > 60) {
    return { ok: false, reason: "invalid_name" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        display_name: normalizedName,
      },
      { onConflict: "id" }
    )
    .select("id, display_name, created_at, updated_at")
    .single();

  if (error) {
    if (MISSING_CODES.has(error.code)) {
      return { ok: false, reason: "not_ready" };
    }

    if (error.code === "42501") {
      return { ok: false, reason: "forbidden" };
    }

    console.error("updateProfile gagal:", error.code ?? "unknown");
    return { ok: false, reason: "error" };
  }

  return { ok: true, profile: data };
}

export async function updateProfileDetails(supabase, userId, details) {
  const fullName = details.full_name?.trim() || null;
  const domicile = details.domicile?.trim() || null;
  const occupation = details.occupation?.trim() || null;
  const birthDate = details.birth_date || null;

  if (
    (fullName && fullName.length > 100) ||
    (domicile && domicile.length > 100) ||
    (occupation && occupation.length > 100)
  ) {
    return { ok: false, reason: "invalid_details" };
  }

  if (
    birthDate &&
    !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)
  ) {
    return { ok: false, reason: "invalid_birth_date" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      birth_date: birthDate,
      domicile,
      occupation,
    })
    .eq("id", userId)
    .select(`
      id,
      display_name,
      full_name,
      birth_date,
      domicile,
      occupation,
      updated_at
    `)
    .maybeSingle();

  if (error) {
    if (MISSING_CODES.has(error.code)) {
      return { ok: false, reason: "not_ready" };
    }

    if (error.code === "42501") {
      return { ok: false, reason: "forbidden" };
    }

    console.error(
      "updateProfileDetails gagal:",
      error.code ?? "unknown"
    );
    return { ok: false, reason: "error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, profile: data };
}