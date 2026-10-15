import { NextResponse } from "next/server";
import { validateQuestion } from "@/lib/validations/askValidation";
import { answerQuestion } from "@/lib/services/askService";
import { getGlossary, getVisibleArticles, referencesFor } from "@/lib/content";

// POST /api/tanya-sycle — Tanya SYCLE tanpa AI (E-2, screen 59–61). Publik (Guest & Member), tanpa login.
// Tidak membaca data Health Tracker, tidak menyimpan, dan tidak mencatat isi pertanyaan di log.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const validation = validateQuestion(body?.question);
    if (!validation.ok) return NextResponse.json({ error: validation.message }, { status: 400 });

    const result = answerQuestion(validation.question, {
      articles: getVisibleArticles(),
      glossary: getGlossary(),
      references: referencesFor,
    });
    return NextResponse.json(result, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Tanya SYCLE gagal:", error?.name ?? "unknown");
    return NextResponse.json({ error: "Tanya SYCLE sedang mengalami gangguan. Coba lagi." }, { status: 500 });
  }
}
