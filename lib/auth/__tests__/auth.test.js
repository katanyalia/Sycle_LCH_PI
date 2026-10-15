import { safeNextPath, isMemberOnlyPath, isGuestOnlyPath } from "@/lib/auth/redirect";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "@/lib/auth/errors";
import { validateNewPassword, validateSignIn, validateSignUp } from "@/lib/validations/authValidation";

const form = (obj) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(obj)) data.set(key, value);
  return data;
};

describe("Tujuan setelah login (anti open redirect)", () => {
  test("path internal diterima", () => {
    expect(safeNextPath("/health-tracker")).toBe("/health-tracker");
    expect(safeNextPath("/profil?tab=privasi")).toBe("/profil?tab=privasi");
  });
  test("URL luar, protocol-relative, dan backslash ditolak", () => {
    expect(safeNextPath("https://contoh-jahat.example")).toBe("/profil");
    expect(safeNextPath("//contoh-jahat.example")).toBe("/profil");
    expect(safeNextPath("/\\contoh-jahat.example")).toBe("/profil");
    expect(safeNextPath(undefined)).toBe("/profil");
  });
  test("halaman autentikasi tidak dijadikan tujuan", () => {
    expect(safeNextPath("/masuk")).toBe("/profil");
    expect(safeNextPath("/auth/confirm?x=1")).toBe("/profil");
    expect(safeNextPath("/reset-password")).toBe("/reset-password"); // tujuan sah tautan pemulihan
  });
  test("pembagian halaman Member/Guest", () => {
    expect(isMemberOnlyPath("/profil")).toBe(true);
    expect(isMemberOnlyPath("/health-tracker/riwayat")).toBe(true);
    expect(isMemberOnlyPath("/health-tracker")).toBe(false); // gerbang screen 27
    expect(isMemberOnlyPath("/profilku")).toBe(false);
    expect(isGuestOnlyPath("/masuk")).toBe(true);
  });
});

describe("Pesan error autentikasi aman", () => {
  test("kredensial salah tidak menyebut email terdaftar/tidak", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).not.toMatch(/tidak terdaftar|sudah terdaftar/);
  });
  test("kode tak dikenal → pesan umum tanpa detail teknis", () => {
    expect(authErrorMessage({ code: "unexpected_failure", message: "db timeout at 10.0.0.1" })).toBe(GENERIC_AUTH_ERROR);
  });
});

describe("Validasi formulir", () => {
  const valid = { displayName: "Ayu", email: "ayu@contoh.id", password: "rahasia123", confirmPassword: "rahasia123", acknowledged: "on" };

  test("pendaftaran valid", () => {
    expect(validateSignUp(form(valid))).toMatchObject({ ok: true, values: { email: "ayu@contoh.id" } });
  });

  test("pendaftaran: kata sandi pendek, konfirmasi beda, pernyataan belum dicentang", () => {
    const result = validateSignUp(form({ ...valid, password: "pendek", confirmPassword: "beda", acknowledged: "" }));
    expect(Object.keys(result.errors).sort()).toEqual(["acknowledged", "confirmPassword", "password"]);
  });

  test("email dinormalisasi & format dicek", () => {
    expect(validateSignIn(form({ email: " AYU@Contoh.ID ", password: "x" })).values.email).toBe("ayu@contoh.id");
    expect(validateSignIn(form({ email: "bukan-email", password: "x" })).errors.email).toBeDefined();
  });

  test("kata sandi baru harus sama dengan konfirmasi", () => {
    expect(validateNewPassword(form({ password: "rahasia123", confirmPassword: "rahasia124" })).ok).toBe(false);
  });

});
