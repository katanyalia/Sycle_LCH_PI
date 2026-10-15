// Uji Riwayat, PDF, dan penghapusan (Tahap 7) dengan tiruan Supabase — tanpa akun sungguhan.
const RECORD_ID = "11111111-1111-4111-8111-111111111111";

// Query builder tiruan: semua metode berantai, hasil diambil saat di-await.
function query(result) {
  const q = {};
  for (const m of ["select", "eq", "order", "limit", "lt", "delete", "maybeSingle"]) q[m] = jest.fn(() => q);
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
}

const mockSupabase = { auth: { getClaims: jest.fn(), signOut: jest.fn() }, from: jest.fn() };
const mockAdmin = { auth: { admin: { deleteUser: jest.fn() } } };
let mockAdminConfigured = true;

class RedirectSignal extends Error {
  constructor(url) {
    super(`REDIRECT ${url}`);
    this.url = url;
  }
}

jest.mock("@/lib/supabase/server", () => ({ createClient: async () => mockSupabase }));
jest.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => (mockAdminConfigured ? mockAdmin : null) }));
jest.mock("@/lib/supabase/env", () => ({ getSupabaseEnv: () => ({ configured: true }) }));
jest.mock("next/navigation", () => ({
  redirect: (url) => {
    throw new RedirectSignal(url);
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const { deleteTrackerRecordAction } = require("@/app/health-tracker/riwayat/actions");
const { deleteAllTrackerRecordsAction, deleteAccountAction } = require("@/app/profil/privasi/actions");
const { GET: pdfGET } = require("@/app/api/tracker/records/[id]/pdf/route");
const { listTrackerRecords } = require("@/lib/repositories/trackerRepository");

const member = () => mockSupabase.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "user-a" } } });
const guest = () => mockSupabase.auth.getClaims.mockResolvedValue({ data: null });
const form = (konfirmasi) => {
  const data = new FormData();
  if (konfirmasi !== undefined) data.set("konfirmasi", konfirmasi);
  return data;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAdminConfigured = true;
});

describe("Riwayat — daftar 50 per halaman (T7-5)", () => {
  test("mengambil 51 baris untuk tahu ada halaman berikutnya; kursor memakai recorded_at", async () => {
    const rows = Array.from({ length: 51 }, (_, i) => ({ id: `r${i}`, recorded_at: `2026-10-${String(30 - (i % 28)).padStart(2, "0")}T00:00:00Z` }));
    const q = query({ data: rows, error: null });
    mockSupabase.from.mockReturnValue(q);
    const r = await listTrackerRecords(mockSupabase, { before: "2026-10-31T00:00:00.000Z" });
    expect(r.records).toHaveLength(50);
    expect(r.hasMore).toBe(true);
    expect(q.limit).toHaveBeenCalledWith(51);
    expect(q.lt).toHaveBeenCalledWith("recorded_at", "2026-10-31T00:00:00.000Z");
    expect(q.select.mock.calls[0][0]).not.toMatch(/story|ht02|items/); // kartu tanpa gejala & cerita
  });
});

describe("Hapus satu catatan (screen 58, AC-19)", () => {
  test("ID tidak valid atau Guest → tidak menghapus", async () => {
    expect((await deleteTrackerRecordAction("bukan-uuid")).ok).toBe(false);
    guest();
    expect((await deleteTrackerRecordAction(RECORD_ID)).ok).toBe(false);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  test("catatan orang lain / tidak ada (RLS: 0 baris) → gagal, tidak mengklaim terhapus", async () => {
    member();
    mockSupabase.from.mockReturnValue(query({ data: [], error: null }));
    const r = await deleteTrackerRecordAction(RECORD_ID);
    expect(r).toEqual({ ok: false, message: "Catatan tidak ditemukan atau sudah dihapus." });
  });

  test("berhasil hanya bila database mengembalikan baris terhapus", async () => {
    member();
    const q = query({ data: [{ id: RECORD_ID }], error: null });
    mockSupabase.from.mockReturnValue(q);
    expect(await deleteTrackerRecordAction(RECORD_ID)).toEqual({ ok: true });
    expect(q.eq).toHaveBeenCalledWith("id", RECORD_ID);
  });
});

describe("Hapus semua catatan (T7-3, T7-4)", () => {
  test("tanpa mengetik HAPUS → ditolak sebelum menyentuh database", async () => {
    for (const typed of [undefined, "", "hapus", "HAPUS SEMUA"]) {
      expect((await deleteAllTrackerRecordsAction(null, form(typed))).status).toBe("error");
    }
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  test("HAPUS → hanya catatan milik pengguna yang login", async () => {
    member();
    const q = query({ data: [{ id: "a" }, { id: "b" }], error: null });
    mockSupabase.from.mockReturnValue(q);
    expect(await deleteAllTrackerRecordsAction(null, form(" HAPUS "))).toEqual({ status: "deleted", count: 2 });
    expect(q.eq).toHaveBeenCalledWith("user_id", "user-a");
  });
});

describe("Hapus akun (T7-1)", () => {
  test("tanpa HAPUS atau tanpa sesi → akun tidak dihapus", async () => {
    expect((await deleteAccountAction(null, form("hapus"))).status).toBe("error");
    guest();
    expect((await deleteAccountAction(null, form("HAPUS"))).status).toBe("error");
    expect(mockAdmin.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  test("kunci rahasia belum diisi → pesan jelas, akun tidak berubah", async () => {
    member();
    mockAdminConfigured = false;
    const r = await deleteAccountAction(null, form("HAPUS"));
    expect(r.message).toMatch(/belum dikonfigurasi/);
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });

  test("gagal di server → tidak logout, tidak mengklaim terhapus", async () => {
    member();
    mockAdmin.auth.admin.deleteUser.mockResolvedValue({ error: { status: 500 } });
    expect((await deleteAccountAction(null, form("HAPUS"))).status).toBe("error");
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });

  test("berhasil → menghapus akun dari token (bukan dari formulir), logout lokal, ke /akun-dihapus", async () => {
    member();
    mockAdmin.auth.admin.deleteUser.mockResolvedValue({ error: null });
    const data = form("HAPUS");
    data.set("userId", "user-b"); // upaya menyisipkan ID lain diabaikan
    await expect(deleteAccountAction(null, data)).rejects.toMatchObject({ url: "/akun-dihapus" });
    expect(mockAdmin.auth.admin.deleteUser).toHaveBeenCalledWith("user-a");
    expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});

describe("Route Handler PDF (AC-13, AC-18)", () => {
  const call = (id) => pdfGET(new Request(`http://localhost/api/tracker/records/${id}/pdf`), { params: Promise.resolve({ id }) });

  test("Guest → 401", async () => {
    guest();
    expect((await call(RECORD_ID)).status).toBe(401);
  });

  test("ID tidak valid, tidak ada, atau milik orang lain → 404 yang sama", async () => {
    member();
    expect((await call("../etc")).status).toBe(404);
    mockSupabase.from.mockReturnValue(query({ data: null, error: null }));
    const res = await call(RECORD_ID);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Catatan tidak ditemukan." });
  });

  test("gangguan database → 500 tanpa detail teknis", async () => {
    member();
    mockSupabase.from.mockReturnValue(query({ data: null, error: { code: "XX000", message: "rahasia internal" } }));
    const res = await call(RECORD_ID);
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toMatch(/rahasia|XX000/);
  });

  test("pemilik → file PDF berisi catatan, lingkungan + sumber + waktu, dan keterangan non-diagnostik", async () => {
    member();
    mockSupabase.from.mockReturnValue(
      query({
        data: {
          id: RECORD_ID,
          recorded_at: "2026-10-15T05:30:00Z",
          context: "lewati",
          ht01_comfort: "nyaman",
          story: "Cerita uji",
          tracker_record_items: [{ question_code: "HT-02", option_code: "pusing", disruption_level: 3 }],
          tracker_environment_snapshots: {
            captured_at: "2026-10-15T05:00:00Z",
            location_label: "Gambir, Jakarta Pusat",
            location_code: "31.71.01.1001",
            indicators: { airQuality: { label: "Kualitas udara", value: 85, unit: "ISPU", standard: "ISPU", category: "Sedang", source: "KLH/BPLH — ISPU", dataType: "pengamatan", timeUtc: "2026-10-15T04:00:00Z", isFallback: false } },
          },
        },
        error: null,
      })
    );
    const res = await call(RECORD_ID);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="catatan-sycle-2026-10-15.pdf"');
    expect(res.headers.get("Cache-Control")).toBe("private, no-store");
    const text = Buffer.from(await res.arrayBuffer()).toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    for (const part of ["Catatan Health Tracker", "Cerita uji", "Pusing: 3", "Gambir, Jakarta Pusat", "Sumber: KLH/BPLH \x97 ISPU", "bukan hasil diagnosis"]) {
      expect(text).toContain(part);
    }
  });
});
