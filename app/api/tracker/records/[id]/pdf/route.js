import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { isRecordId } from "@/lib/validations/recordValidation";
import { getTrackerRecord } from "@/lib/repositories/trackerRepository";
import { buildTrackerRecordPdf } from "@/lib/services/trackerPdfService";

// GET /api/tracker/records/[id]/pdf — unduh PDF satu catatan tersimpan (screen 57, K-05, T7-2).
// Kepemilikan diverifikasi di server: sesi wajib + RLS hanya mengembalikan catatan milik pengguna.
// Catatan orang lain dan ID yang tidak ada mendapat respons yang sama (404), tanpa membocorkan keberadaannya.
export async function GET(_request, { params }) {
  try {
    if (!getSupabaseEnv().configured) return NextResponse.json({ error: "Layanan belum tersedia." }, { status: 500 });

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) return NextResponse.json({ error: "Masuk terlebih dahulu untuk mengunduh PDF." }, { status: 401 });

    const { id } = await params;
    if (!isRecordId(id)) return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });

    const result = await getTrackerRecord(supabase, id);
    if (!result.ok) {
      if (result.reason === "not_found") return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
      return NextResponse.json({ error: "PDF belum berhasil dibuat. Coba lagi." }, { status: 500 });
    }

    const { bytes, filename } = buildTrackerRecordPdf(result.record);
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("PDF catatan gagal:", error?.name ?? "unknown");
    return NextResponse.json({ error: "PDF belum berhasil dibuat. Coba lagi." }, { status: 500 });
  }
}
