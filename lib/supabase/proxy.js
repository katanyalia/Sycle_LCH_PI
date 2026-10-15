import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Menyegarkan sesi Supabase pada setiap permintaan halaman dan menulis cookie terbaru ke respons.
export async function updateSession(request) {
  let response = NextResponse.next({ request });
  const { url, key, configured } = getSupabaseEnv();
  if (!configured) return { response, claims: null };

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [header, value] of Object.entries(headers ?? {})) response.headers.set(header, value);
      },
    },
  });

  // getClaims() memverifikasi token (bukan sekadar membaca cookie).
  const { data } = await supabase.auth.getClaims();
  return { response, claims: data?.claims ?? null };
}
