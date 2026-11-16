import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const maxDuration = 60;

function bersihkanCatatan(c) {
  if (!c || typeof c !== "object") return { error: "Format catatan tidak valid" };

  const kondisi = typeof c.kondisi === "string" ? c.kondisi.trim() : "";
  const cerita = typeof c.cerita === "string" ? c.cerita.trim() : "";
  const gejala = Array.isArray(c.gejala)
    ? c.gejala.filter((g) => typeof g === "string").slice(0, 30)
    : [];
  const iklim = Array.isArray(c.iklim)
    ? c.iklim.slice(0, 10).map(({ label, value, unit }) => ({
        label: String(label ?? ""),
        value: typeof value === "number" ? value : String(value ?? ""),
        unit: unit ? String(unit) : null,
      }))
    : [];

  const value = { kondisi };
  if (gejala.length) value.gejala = gejala;
  if (iklim.length) value.iklim = iklim;
  if (cerita) value.cerita = cerita;

  return { value };
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const { value: catatan, error } = bersihkanCatatan(body?.catatan);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const baseUrl = process.env.FASTAPI_BASE_URL;
    if (!baseUrl) throw new Error("FASTAPI_BASE_URL belum di-set");

    const upstream = await fetch(`${baseUrl}/refleksi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ catatan }),
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok || !data) {
      console.error("FastAPI error:", upstream.status, data);
      return NextResponse.json(
        { error: "Layanan refleksi AI sedang bermasalah." },
        { status: 502 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Refleksi API error:", err);
    const timeout = err?.name === "TimeoutError";
    return NextResponse.json(
      { error: timeout ? "Layanan AI terlalu lama merespons." : "Layanan refleksi AI belum dapat dihubungi." },
      { status: timeout ? 504 : 500 }
    );
  }
}