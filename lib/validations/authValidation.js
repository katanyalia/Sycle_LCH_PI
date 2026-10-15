// Validasi formulir autentikasi (pola lib/validations materi mentor). Pesan dalam Bahasa Indonesia.
export const PASSWORD_MIN_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (formData, key) => String(formData.get(key) ?? "").trim();

export function validateEmail(email) {
  if (!email) return "Email wajib diisi.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Format email belum sesuai.";
  return null;
}

export function validatePassword(password) {
  if (!password) return "Kata sandi wajib diisi.";
  if (password.length < PASSWORD_MIN_LENGTH) return `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter.`;
  if (password.length > 72) return "Kata sandi maksimal 72 karakter.";
  return null;
}

export function validateDisplayName(name) {
  if (!name) return "Nama wajib diisi.";
  if (name.length > 60) return "Nama maksimal 60 karakter.";
  return null;
}

function result(values, errors) {
  const clean = Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
  return Object.keys(clean).length ? { ok: false, errors: clean, values } : { ok: true, values };
}

export function validateSignUp(formData) {
  const values = {
    displayName: text(formData, "displayName"),
    email: text(formData, "email").toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acknowledged: formData.get("acknowledged") === "on",
  };
  return result(
    { displayName: values.displayName, email: values.email, password: values.password },
    {
      displayName: validateDisplayName(values.displayName),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirmPassword: values.password !== values.confirmPassword ? "Konfirmasi kata sandi belum sama." : null,
      acknowledged: values.acknowledged ? null : "Centang pernyataan ini untuk melanjutkan.",
    }
  );
}

export function validateSignIn(formData) {
  const values = { email: text(formData, "email").toLowerCase(), password: String(formData.get("password") ?? "") };
  return result(values, {
    email: validateEmail(values.email),
    password: values.password ? null : "Kata sandi wajib diisi.",
  });
}

export function validateEmailOnly(formData) {
  const values = { email: text(formData, "email").toLowerCase() };
  return result(values, { email: validateEmail(values.email) });
}

export function validateNewPassword(formData) {
  const values = { password: String(formData.get("password") ?? ""), confirmPassword: String(formData.get("confirmPassword") ?? "") };
  return result({ password: values.password }, {
    password: validatePassword(values.password),
    confirmPassword: values.password !== values.confirmPassword ? "Konfirmasi kata sandi belum sama." : null,
  });
}

export function validateProfile(formData) {
  const values = { displayName: text(formData, "displayName") };
  return result(values, { displayName: validateDisplayName(values.displayName) });
}
