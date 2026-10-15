import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

// Tujuan tautan di email Supabase (verifikasi pendaftaran & pemulihan kata sandi).
// Mendukung dua format:
//   ?code=...                      (templat email bawaan Supabase, alur PKCE — buka di browser yang sama)
//   ?token_hash=...&type=...       (templat email yang disesuaikan — bisa dibuka di perangkat mana pun)
export async function GET(request) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), "/health-tracker");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  try {
    const supabase = await createClient();
    let error = null;
    if (code) {
      ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (tokenHash && ["signup", "email", "recovery", "email_change"].includes(type)) {
      ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
    } else {
      error = { code: "missing_params" };
    }
    if (!error) return NextResponse.redirect(new URL(next, origin));
    console.error("Konfirmasi email gagal:", error.code ?? "unknown");
  } catch (err) {
    console.error("Konfirmasi email gagal:", err?.name ?? "error");
  }
  return NextResponse.redirect(new URL("/masuk?tautan=tidak-valid", origin));
}
