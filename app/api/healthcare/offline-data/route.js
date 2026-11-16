import { NextResponse } from "next/server";
import snapshot from "@/data/healthcare/faskes-osm.json";

// Snapshot faskes OpenStreetMap (ODbL) untuk disimpan service worker, agar Healthcare tetap bisa
// menampilkan faskes terdekat saat offline. Data publik tanpa kontak (FR-15/AC-26), sekitar 420 KB terkompres.

export function GET() {
  return NextResponse.json(snapshot);
}
