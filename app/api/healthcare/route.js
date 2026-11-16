import { NextResponse } from "next/server";
import { validateEnvironmentQuery } from "@/lib/validations/environmentValidation";
import { getNearbyFacilities } from "@/lib/services/healthcareService";

// GET /api/healthcare?adm4=XX.XX.XX.XXXX  atau  ?lat=..&lon=..
export async function GET(request) {
  const validation = validateEnvironmentQuery(request.nextUrl.searchParams);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await getNearbyFacilities(validation.value);

    if (result.error === "not_found") {
      return NextResponse.json({ error: "Kode wilayah tidak ditemukan." }, { status: 404 });
    }
    if (result.error === "no_coordinates") {
      return NextResponse.json(
        { error: "Titik lokasi desa belum tersedia. Coba gunakan lokasi perangkat." },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") throw error;
    console.error("GET /api/healthcare gagal:", error);
    return NextResponse.json(
      { error: "Data fasilitas kesehatan belum dapat dimuat." },
      { status: 500 }
    );
  }
}
