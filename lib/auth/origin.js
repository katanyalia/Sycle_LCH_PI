import { headers } from "next/headers";

// Alamat situs saat ini (untuk tautan di email Supabase). Harus terdaftar di
// Supabase → Authentication → URL Configuration → Redirect URLs.
export async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
