// Uji Server Action & rute autentikasi dengan tiruan Supabase (tanpa membuat akun di layanan eksternal).
import { NextRequest } from "next/server";

const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    resend: jest.fn(),
    getClaims: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(),
    exchangeCodeForSession: jest.fn(),
    verifyOtp: jest.fn(),
  },
  from: jest.fn(),
};

class RedirectSignal extends Error {
  constructor(url) {
    super(`REDIRECT ${url}`);
    this.url = url;
  }
}

jest.mock("@/lib/supabase/server", () => ({ createClient: async () => mockSupabase }));
jest.mock("@/lib/auth/origin", () => ({ getOrigin: async () => "http://localhost:3005" }));
jest.mock("next/navigation", () => ({
  redirect: (url) => {
    throw new RedirectSignal(url);
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const { signUpAction } = require("@/app/daftar/actions");
const { signInAction } = require("@/app/masuk/actions");
const { requestPasswordResetAction } = require("@/app/lupa-password/actions");
const { updatePasswordAction } = require("@/app/reset-password/actions");
const { updateProfileAction, signOutAction } = require("@/app/profil/actions");
const { GET: confirmGET } = require("@/app/auth/confirm/route");

const form = (obj) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(obj)) data.set(key, value);
  return data;
};

async function expectRedirect(promise) {
  try {
    await promise;
  } catch (error) {
    if (error instanceof RedirectSignal) return error.url;
    throw error;
  }
  throw new Error("Tidak ada redirect");
}

const SIGNUP = { displayName: "Uji", email: "uji@contoh.test", password: "rahasia123", confirmPassword: "rahasia123", acknowledged: "on" };

beforeEach(() => jest.clearAllMocks());

describe("Daftar (screen 65)", () => {
  test("input tidak valid → tidak memanggil Supabase, kata sandi tidak dikembalikan", async () => {
    const state = await signUpAction(null, form({ ...SIGNUP, acknowledged: "" }));
    expect(state.status).toBe("error");
    expect(state.errors.acknowledged).toBeDefined();
    expect(state.values.password).toBeUndefined();
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  test("valid + konfirmasi email aktif → layar verifikasi; metadata nama & tautan konfirmasi benar", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: null }, error: null });
    const state = await signUpAction(null, form({ ...SIGNUP, next: "/health-tracker" }));
    expect(state).toEqual({ status: "verify", email: "uji@contoh.test" });
    const args = mockSupabase.auth.signUp.mock.calls[0][0];
    expect(args.options.data).toEqual({ display_name: "Uji" });
    expect(args.options.emailRedirectTo).toBe("http://localhost:3005/auth/confirm?next=%2Fhealth-tracker");
  });

  test("konfirmasi email nonaktif (sesi langsung ada) → diarahkan ke tujuan awal", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: { access_token: "x" } }, error: null });
    expect(await expectRedirect(signUpAction(null, form({ ...SIGNUP, next: "/health-tracker" })))).toBe("/health-tracker");
  });

  test("error Supabase → pesan aman tanpa detail teknis", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: {}, error: { code: "over_email_send_rate_limit", message: "internal" } });
    const state = await signUpAction(null, form(SIGNUP));
    expect(state.message).toMatch(/Terlalu banyak email/);
    expect(state.message).not.toMatch(/internal/);
  });
});

describe("Masuk (screen 66, 68)", () => {
  test("kredensial salah → pesan aman, kata sandi tidak dikembalikan", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials" } });
    const state = await signInAction(null, form({ email: "uji@contoh.test", password: "salah123" }));
    expect(state.message).toMatch(/Email atau kata sandi belum sesuai/);
    expect(state.values).toEqual({ email: "uji@contoh.test" });
  });

  test("berhasil → kembali ke tujuan awal; tujuan luar ditolak", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    expect(await expectRedirect(signInAction(null, form({ email: "uji@contoh.test", password: "rahasia123", next: "/health-tracker" })))).toBe("/health-tracker");
    expect(await expectRedirect(signInAction(null, form({ email: "uji@contoh.test", password: "rahasia123", next: "https://contoh-jahat.example" })))).toBe("/profil");
  });
});

describe("Lupa & reset kata sandi (screen 67)", () => {
  test("permintaan pemulihan selalu memberi pesan yang sama (tidak membocorkan akun)", async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: { code: "user_not_found" } });
    const state = await requestPasswordResetAction(null, form({ email: "tidak-ada@contoh.test" }));
    expect(state.status).toBe("sent");
    expect(mockSupabase.auth.resetPasswordForEmail.mock.calls[0][1].redirectTo).toBe("http://localhost:3005/auth/confirm?next=/reset-password");
  });

  test("reset tanpa sesi pemulihan ditolak; dengan sesi → kata sandi diganti", async () => {
    mockSupabase.auth.getClaims.mockResolvedValueOnce({ data: null });
    expect((await updatePasswordAction(null, form({ password: "baru12345", confirmPassword: "baru12345" }))).status).toBe("error");
    expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();

    mockSupabase.auth.getClaims.mockResolvedValueOnce({ data: { claims: { sub: "u1" } } });
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null });
    expect(await expectRedirect(updatePasswordAction(null, form({ password: "baru12345", confirmPassword: "baru12345" })))).toBe("/profil?kata-sandi=diperbarui");
  });
});

describe("Profil & logout (screen 69, 72)", () => {
  test("Guest tidak bisa menyimpan profil", async () => {
    mockSupabase.auth.getClaims.mockResolvedValue({ data: null });
    expect(await expectRedirect(updateProfileAction(null, form({ displayName: "Nama" })))).toBe("/masuk?next=/profil");
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  test("Member hanya menyimpan baris miliknya sendiri (id = sub dari sesi)", async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({ upsert });
    mockSupabase.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "milik-saya" } } });
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null });
    const state = await updateProfileAction(null, form({ displayName: "Nama Baru", id: "milik-orang-lain" }));
    expect(state.status).toBe("saved");
    expect(upsert).toHaveBeenCalledWith({ id: "milik-saya", display_name: "Nama Baru" }, { onConflict: "id" });
  });

  test("tabel profil belum ada → pesan jelas", async () => {
    mockSupabase.from.mockReturnValue({ upsert: jest.fn().mockResolvedValue({ error: { code: "PGRST205" } }) });
    mockSupabase.auth.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } } });
    const state = await updateProfileAction(null, form({ displayName: "Nama" }));
    expect(state.message).toMatch(/migration profiles/);
  });

  test("logout memanggil signOut lalu ke Beranda", async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    expect(await expectRedirect(signOutAction())).toBe("/");
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});

describe("Tautan email /auth/confirm", () => {
  const req = (query) => new NextRequest(`http://localhost:3005/auth/confirm${query}`);

  test("kode valid → masuk & diarahkan ke tujuan", async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await confirmGET(req("?code=abc&next=/health-tracker"));
    expect(res.headers.get("location")).toBe("http://localhost:3005/health-tracker");
  });

  test("token_hash pemulihan → halaman reset", async () => {
    mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });
    const res = await confirmGET(req("?token_hash=t&type=recovery&next=/reset-password"));
    expect(res.headers.get("location")).toBe("http://localhost:3005/reset-password");
  });

  test("tautan tidak valid → /masuk dengan pesan; tujuan luar tidak diikuti", async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: { code: "otp_expired" } });
    const res = await confirmGET(req("?code=lama&next=https://contoh-jahat.example"));
    expect(res.headers.get("location")).toBe("http://localhost:3005/masuk?tautan=tidak-valid");
    const res2 = await confirmGET(req("?type=bukan-tipe&token_hash=t"));
    expect(res2.headers.get("location")).toBe("http://localhost:3005/masuk?tautan=tidak-valid");
  });
});
