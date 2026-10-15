import { NextRequest, NextResponse } from "next/server";

const mockClaims = { current: null };
jest.mock("@/lib/supabase/proxy", () => ({
  updateSession: async (request) => ({ response: NextResponse.next({ request }), claims: mockClaims.current }),
}));

const { proxy } = require("@/proxy");
const req = (path) => new NextRequest(`http://localhost:3005${path}`);

describe("proxy.js — akses halaman Member", () => {
  test("Guest ke /profil → /masuk dengan tujuan awal", async () => {
    mockClaims.current = null;
    const res = await proxy(req("/profil"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3005/masuk?next=%2Fprofil");
  });

  test("Guest ke /health-tracker/riwayat → /masuk", async () => {
    mockClaims.current = null;
    const res = await proxy(req("/health-tracker/riwayat"));
    expect(res.headers.get("location")).toContain("/masuk?next=%2Fhealth-tracker%2Friwayat");
  });

  test("Guest tetap bisa membuka halaman umum & gerbang Health Tracker", async () => {
    mockClaims.current = null;
    for (const path of ["/", "/personalisasi", "/info-edukasi", "/health-tracker", "/masuk"]) {
      expect((await proxy(req(path))).headers.get("location")).toBeNull();
    }
  });

  test("Member ke /masuk atau /daftar → /profil; Member ke /profil diizinkan", async () => {
    mockClaims.current = { sub: "u1" };
    expect((await proxy(req("/masuk"))).headers.get("location")).toBe("http://localhost:3005/profil");
    expect((await proxy(req("/daftar"))).headers.get("location")).toBe("http://localhost:3005/profil");
    expect((await proxy(req("/profil"))).headers.get("location")).toBeNull();
  });
});
