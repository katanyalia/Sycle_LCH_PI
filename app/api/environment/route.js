import { NextResponse } from "next/server";
import { validateEnvironmentQuery } from "@/lib/validations/environmentValidation";
import { getEnvironmentSnapshot } from "@/lib/services/environmentService";

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;

    if (!searchParams.has("lat") && searchParams.has("latitude")) {
      searchParams.set("lat", searchParams.get("latitude"));
    }

    if (!searchParams.has("lon") && searchParams.has("longitude")) {
      searchParams.set("lon", searchParams.get("longitude"));
    }

    const validation = validateEnvironmentQuery(searchParams);

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const snapshot = await getEnvironmentSnapshot(validation.value);

    if (snapshot.error === "not_found") {
      return NextResponse.json(
        { error: "Wilayah tidak ditemukan. Periksa pilihan desa atau kelurahan." },
        { status: 404 }
      );
    }

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }

    console.error("GET /api/environment gagal:", error);

    return NextResponse.json(
      { error: "Data lingkungan belum dapat diambil." },
      { status: 500 }
    );
  }
}