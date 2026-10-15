const mockSupabase = { auth: { getClaims: jest.fn() }, rpc: jest.fn() };
jest.mock("@/lib/supabase/server", () => ({ createClient: async () => mockSupabase }));

const { saveTrackerRecordAction } = require("@/app/health-tracker/actions");

const ANSWERS = { KONTEKS: "lewati", "HT-01": "nyaman", "HT-02": ["lelah"], "HT-03": { lelah: 1 }, "HT-04": "tidak" };

beforeEach(() => jest.clearAllMocks());

describe("Simpan Catatan (screen 50–51)", () => {
  test("Guest / sesi berakhir → tidak menyimpan", async () => {
    mockSupabase.auth.getClaims.mockResolvedValue({ data: null });
    const r = await saveTrackerRecordAction({ answers: ANSWERS });
    expect(r.ok).toBe(false);
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  test("jawaban tidak valid → tidak menyimpan", async () => {
    mockSupabase.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });
    const r = await saveTrackerRecordAction({ answers: { ...ANSWERS, "HM-01": "ya" } });
    expect(r.ok).toBe(false);
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  test("berhasil hanya setelah database mengembalikan ID (AC-12)", async () => {
    mockSupabase.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });
    mockSupabase.rpc.mockResolvedValue({ data: "rec-1", error: null });
    const r = await saveTrackerRecordAction({ answers: ANSWERS, environment: null });
    expect(r).toMatchObject({ ok: true, id: "rec-1", withEnvironment: false });
    const [fn, args] = mockSupabase.rpc.mock.calls[0];
    expect(fn).toBe("save_tracker_record");
    expect(args.p_record).not.toHaveProperty("user_id"); // pemilik ditentukan database (auth.uid())
    expect(args.p_items).toEqual([{ question_code: "HT-02", option_code: "lelah", disruption_level: 1 }]);
  });

  test("database gagal → pesan jelas, tidak mengklaim tersimpan", async () => {
    mockSupabase.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202" } });
    const r = await saveTrackerRecordAction({ answers: ANSWERS });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/migration Health Tracker/);
  });
});
