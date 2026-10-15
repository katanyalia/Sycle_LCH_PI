// Uji koneksi Supabase tanpa menampilkan nilai kunci.
// Jalankan: npm run check:supabase  (membaca .env.local)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.log("GAGAL: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum terbaca dari .env.local");
  process.exit(1);
}
console.log(`URL terbaca: ${new URL(url).hostname.replace(/^[^.]+/, "<project>")}`);
console.log(`Key terbaca: ${key.startsWith("sb_publishable_") ? "format publishable (sb_publishable_…)" : key.startsWith("eyJ") ? "format JWT (anon key lama)" : "format tidak dikenal"}, panjang ${key.length}`);
if (key.startsWith("sb_secret_")) {
  console.log("PERINGATAN: ini kunci SECRET — jangan dipakai sebagai NEXT_PUBLIC_. Ganti dengan publishable key.");
  process.exit(1);
}

const headers = { apikey: key };
for (const [label, path] of [["Auth health", "/auth/v1/health"], ["Auth settings", "/auth/v1/settings"]]) {
  try {
    const res = await fetch(new URL(path, url), { headers, signal: AbortSignal.timeout(10000) });
    console.log(`${label}: HTTP ${res.status}`);
    if (path.endsWith("settings") && res.ok) {
      const s = await res.json();
      console.log(`  Email login aktif: ${s.external?.email === true}`);
      console.log(`  Konfirmasi email: ${s.mailer_autoconfirm ? "MATI (akun langsung aktif)" : "AKTIF (pengguna harus verifikasi email)"}`);
      console.log(`  Pendaftaran dibuka: ${s.disable_signup ? "tidak" : "ya"}`);
    }
  } catch (error) {
    console.log(`${label}: GAGAL (${error.name})`);
  }
}
