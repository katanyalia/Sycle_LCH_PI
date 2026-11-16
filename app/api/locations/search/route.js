import { NextResponse } from "next/server";
import { validateLocationSearch } from "@/lib/validations/environmentValidation";
import { searchVillages } from "@/lib/repositories/regionRepository";

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export async function GET(request) {
  try {
    const validation = validateLocationSearch(
      request.nextUrl.searchParams
    );

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const query = validation.value.query.trim();

    // Uluwatu merupakan nama kawasan, bukan nama desa
    // administratif. Arahkan pencarian ke Desa Pecatu.
    const searchQuery =
      normalize(query) === "uluwatu"
        ? "Pecatu Kuta Selatan Badung Bali"
        : query;

    const { total, items } = searchVillages(searchQuery, 10);

    return NextResponse.json({
      total,
      items: items.map((item) => ({
        code: item.code,
        name: item.village,
        village: item.village,
        district: item.district,
        regency: item.regency,
        province: item.province,
        label: item.label,
        full_path: [
          item.province,
          item.regency,
          item.district,
          item.village,
        ].join(" > "),
      })),
    });
  } catch (error) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }

    console.error("GET /api/locations/search gagal:", error);

    return NextResponse.json(
      { error: "Pencarian wilayah gagal dilakukan." },
      { status: 500 }
    );
  }
}