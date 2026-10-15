import { NextResponse } from "next/server";
import { validateLocationSearch } from "@/lib/validations/environmentValidation";
import { searchVillages } from "@/lib/repositories/regionRepository";

// GET /api/locations/search?q=kemayoran — cari kelurahan/desa (kode Kepmendagri 2022).
export async function GET(request) {
  try {
    const validation = validateLocationSearch(request.nextUrl.searchParams);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { total, items } = searchVillages(validation.value.query, 10);
    return NextResponse.json({ total, items });
  } catch (error) {
    console.error("GET /api/locations/search gagal:", error);
    return NextResponse.json({ error: "Pencarian lokasi belum dapat dilakukan." }, { status: 500 });
  }
}
