import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isGuestOnlyPath, isMemberOnlyPath } from "@/lib/auth/redirect";

// Next.js 16: proxy.js (pengganti middleware.js).
// 1) Menyegarkan sesi Supabase.  2) Guest yang membuka halaman Member → /masuk?next=<tujuan>
//    (WF-09: kembali ke tujuan awal).  3) Member yang membuka /masuk atau /daftar → /profil.
// Pemeriksaan ini "optimistis"; halaman & Server Action tetap memeriksa sesi di server, dan RLS
// menjaga data di database.
export async function proxy(request) {
  const { response, claims } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!claims && isMemberOnlyPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withCookies(NextResponse.redirect(url), response);
  }
  if (claims && isGuestOnlyPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/profil";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }
  return response;
}

// Pertahankan cookie sesi yang baru disegarkan saat mengalihkan.
function withCookies(redirect, response) {
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.jpg|brand/|api/).*)"],
};
