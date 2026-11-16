import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { findArticlesForQuestion } from "@/data/education";

// Batas Tanya Sycle untuk Guest (belum login), dihitung per perangkat per hari.
// Member tidak dibatasi oleh aturan ini.
const GUEST_DAILY_LIMIT = 3;
const GUEST_COOKIE = "sycle_guest_tanya";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Cookie hanya berisi tanggal dan jumlah pertanyaan, bukan isi pertanyaan.
async function readGuestUsage() {
  const store = await cookies();
  try {
    const parsed = JSON.parse(store.get(GUEST_COOKIE)?.value ?? "{}");
    if (parsed.date === todayKey() && Number.isInteger(parsed.count)) {
      return parsed.count;
    }
  } catch {
    // Cookie rusak dianggap belum ada pemakaian.
  }
  return 0;
}

export async function POST(request) {
  try {
    const { message } = await request.json();
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Pertanyaan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const guestUsed = user ? 0 : await readGuestUsage();

    if (!user && guestUsed >= GUEST_DAILY_LIMIT) {
      return NextResponse.json(
        {
          needsAccount: true,
          limit: GUEST_DAILY_LIMIT,
          error: `Kamu sudah memakai ${GUEST_DAILY_LIMIT} pertanyaan gratis hari ini. Masuk atau daftar untuk terus bertanya ke Tanya Sycle.`,
        },
        { status: 403 }
      );
    }

    const baseUrl = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";
    const upstream = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });

    const answer = await upstream.json();
    // Arahkan ke materi Info & Edukasi yang relevan (Master V2.1: fallback Tanya SYCLE → arah ke materi edukasi).
    const data = upstream.ok
      ? { ...answer, relatedArticles: findArticlesForQuestion(message) }
      : answer;

    if (user || !upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    // Guest: hitung pertanyaan yang berhasil dijawab.
    const used = guestUsed + 1;
    const response = NextResponse.json(
      { ...data, guestRemaining: Math.max(GUEST_DAILY_LIMIT - used, 0) },
      { status: upstream.status }
    );
    response.cookies.set(GUEST_COOKIE, JSON.stringify({ date: todayKey(), count: used }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Layanan chatbot belum dapat dihubungi." },
      { status: 500 }
    );
  }
}
