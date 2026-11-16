import { NextResponse } from "next/server";
import { matchVillageFromAddress } from "@/lib/repositories/regionRepository";

const getFirstValue = (...values) =>
  values.find((value) => typeof value === "string" && value.trim()) ?? "";

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));

  if (
    !params.has("lat") ||
    !params.has("lon") ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { message: "Koordinat tidak valid." },
      { status: 400 }
    );
  }

  const url = new URL(
    "https://nominatim.openstreetmap.org/reverse"
  );

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "14");
  url.searchParams.set("accept-language", "id");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SYCLE-Web-PWA/1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Nama wilayah gagal ditemukan." },
        { status: 502 }
      );
    }

    const result = await response.json();
    const address = result.address ?? {};

    const village = getFirstValue(
      address.village,
      address.suburb,
      address.neighbourhood,
      address.quarter,
      address.hamlet
    );

    const district = getFirstValue(
      address.city_district,
      address.district
    );

    const regency = getFirstValue(
      address.city,
      address.town,
      address.municipality,
      address.county
    );

    const province = getFirstValue(address.state);

    const location = [
      village,
      district,
      regency,
      province,
    ]
      .filter(Boolean)
      .filter((value, index, array) =>
        array.indexOf(value) === index
      )
      .join(", ");
    
    // Pencocokan wilayah menggunakan dataset lokal (kode desa BMKG).
    // OSM tidak konsisten antarkota, jadi beberapa kandidat dicoba sekaligus.
    const isUnitLabel = (value) => /^(RW|RT|Dusun|Lingkungan)\b/i.test(String(value ?? "").trim());
    const matchedRegion = matchVillageFromAddress({
      villageNames: [
        address.village,
        address.neighbourhood,
        address.quarter,
        address.suburb,
        address.hamlet,
      ].filter((value) => value && !isUnitLabel(value)),
      districtNames: [address.city_district, address.district, address.suburb, address.municipality],
      regencyNames: [address.city, address.town, address.municipality, address.county, address.city_district],
      provinceNames: [address.state],
    });

    return NextResponse.json({
      location: location || result.display_name || "",
      adm4: matchedRegion?.code ?? null,
      matched: Boolean(matchedRegion),
      region: matchedRegion
        ? {
            village: matchedRegion.village,
            district: matchedRegion.district,
            regency: matchedRegion.regency,
            province: matchedRegion.province,
            label: matchedRegion.label,
          }
        : null,
      address,
      attribution: "© OpenStreetMap contributors",
    });
  } catch (error) {
    console.error("Reverse geocoding gagal:", error);

    return NextResponse.json(
      { message: "Layanan reverse geocoding tidak dapat diakses." },
      { status: 502 }
    );
  }
}