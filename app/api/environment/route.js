import { NextResponse } from "next/server";
import { validateEnvironmentQuery } from "@/lib/validations/environmentValidation";
import { getEnvironmentSnapshot } from "@/lib/services/environmentService";

// GET /api/environment?adm4=31.71.03.1001            → lokasi desa/kelurahan (BMKG utama)
// GET /api/environment?adm4=…&lat=…&lon=…             → koordinat desa dari permintaan sebelumnya (cadangan bila BMKG gagal)
// GET /api/environment?lat=-6.2&lon=106.8              → lokasi perangkat (dibulatkan 2 desimal)
export async function GET(request) {
  try {
    const validation = validateEnvironmentQuery(request.nextUrl.searchParams);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const snapshot = await getEnvironmentSnapshot(validation.value);
    if (snapshot.error === "not_found") {
      return NextResponse.json({ error: "Wilayah tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/environment gagal:", error);
    return NextResponse.json({ error: "Data lingkungan belum dapat diambil." }, { status: 500 });
  }
}
