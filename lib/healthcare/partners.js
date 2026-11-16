// Faskes mitra SYCLE dari tabel yang diisi tim (Master V2.1 6.4).
// Bila tabel belum dibuat atau kosong, Healthcare tetap berjalan dengan data OSM saja.
import { createClient } from "@/lib/supabase/server";

export async function getPartnerFacilities() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("healthcare_partners")
      .select("id, name, facility_type, address, latitude, longitude, services, osm_ref")
      .eq("is_active", true);

    if (error || !Array.isArray(data)) return [];

    return data
      .filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude))
      .map((row) => ({
        id: `mitra-${row.id}`,
        osmRef: row.osm_ref ?? null,
        name: row.name,
        type: row.facility_type,
        address: row.address ?? null,
        services: Array.isArray(row.services) ? row.services : [],
        lat: row.latitude,
        lon: row.longitude,
      }));
  } catch {
    return [];
  }
}
