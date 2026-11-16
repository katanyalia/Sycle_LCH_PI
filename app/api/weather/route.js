import { NextResponse } from "next/server";

export async function GET(request) {
  const adm4 = request.nextUrl.searchParams.get("adm4")?.trim();

  if (!adm4 || !/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(adm4)) {
    return NextResponse.json(
      { message: "Kode wilayah kelurahan (adm4) tidak valid." },
      { status: 400 }
    );
  }

  const url = new URL(
    "https://api.bmkg.go.id/publik/prakiraan-cuaca"
  );
  url.searchParams.set("adm4", adm4);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Data prakiraan cuaca BMKG gagal diambil." },
        { status: response.status }
      );
    }

    const result = await response.json();
    const location = result.lokasi;
    const forecasts = (result.data ?? []).flatMap(
        (group) => (group.cuaca ?? []).flat()
    );

    if (!location || forecasts.length === 0) {
      return NextResponse.json(
        { message: "Prakiraan cuaca belum tersedia untuk wilayah ini." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      location: {
        adm4: location.adm4,
        province: location.provinsi,
        city: location.kotkab,
        district: location.kecamatan,
        village: location.desa,
        latitude: Number(location.lat ?? location.latitude),
        longitude: Number(location.lon ?? location.longitude),
      },
      forecasts: forecasts.map((item) => ({
        time: item.local_datetime,
        temperature: item.t,
        condition: item.weather_desc,
        humidity: item.hu,
        rainfall: item.tp,
        icon: item.image,
      })),
      source: "BMKG",
    });
  } catch {
    return NextResponse.json(
      { message: "Layanan prakiraan cuaca BMKG tidak dapat diakses." },
      { status: 502 }
    );
  }
}