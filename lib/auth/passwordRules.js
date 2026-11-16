// Aturan kekuatan password Sycle. Dipakai di halaman Daftar dan Ubah Password.
export const PASSWORD_RULES = [
  { id: "length", label: "Minimal 8 karakter", test: (value) => value.length >= 8 },
  { id: "upper", label: "Ada huruf besar (A–Z)", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "Ada huruf kecil (a–z)", test: (value) => /[a-z]/.test(value) },
  { id: "number", label: "Ada angka (0–9)", test: (value) => /[0-9]/.test(value) },
  { id: "symbol", label: "Ada simbol (mis. ! @ # $ %)", test: (value) => /[^A-Za-z0-9\s]/.test(value) },
];

export function checkPassword(value = "") {
  return PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(value) }));
}

export function isStrongPassword(value = "") {
  return checkPassword(value).every((rule) => rule.passed);
}
