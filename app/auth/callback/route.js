import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Tautan dari email Supabase (mis. reset password) kembali ke sini membawa ?code=.
// Kode ditukar menjadi sesi login, lalu pengguna diarahkan ke halaman tujuan.
function getSafeNextPath(path) {
  if (typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) {
    return path;
  }
  return "/";
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/reset-password?status=link-invalid`);
}
