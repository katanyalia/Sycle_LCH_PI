// SYCLE V2 — service worker minimal, ditulis manual tanpa package (K-06, Tahap 8).
//
// Aturan (Panduan Proyek §7–8, Master Draft 6.4.8, wireframe screen 11):
// * Halaman PUBLIK saja yang disimpan untuk dibaca offline (Beranda, Info & Edukasi, panduan umum,
//   Healthcare, dan formulir check-in Health Tracker yang statis). Riwayat, Profil, PDF, autentikasi,
//   dan semua permintaan non-GET TIDAK PERNAH disimpan — data catatan tidak masuk cache.
// * Halaman selalu diambil dari jaringan lebih dulu; cache hanya dipakai bila offline.
// * Data lingkungan terakhir (/api/environment) disimpan agar Beranda dapat menampilkan
//   "Data tersimpan — bukan kondisi terkini" saat offline. Respons dari cache diberi header x-sycle-cache: stored.
// * Bila status login berubah (Guest ↔ Member, mis. logout atau hapus akun), cache halaman dikosongkan agar nama
//   Member tidak tertinggal di halaman tersimpan.

const VERSION = "sycle-v2-2026-11-12b";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const ENVIRONMENT = `${VERSION}-environment`;
const OFFLINE_URL = "/offline.html";
const MAX_ENVIRONMENT_ENTRIES = 5;

const PUBLIC_PAGES = [
  /^\/$/,
  /^\/education(\/.*)?$/,
  /^\/generalguidance$/,
  /^\/healthcare$/,
  /^\/assessment(\/.*)?$/, // Kenali Aktivitasmu → Personalisasi → Panduan Personal (hardcode, bisa offline)
  // Formulir check-in Health Tracker: halaman statis tanpa data pengguna. Catatan yang dibuat saat
  // offline disimpan di IndexedDB (lib/healthtracker/offlineQueue.js), bukan di cache ini.
  /^\/healthtracker\/assessment$/,
];
// Daftar halaman publik yang disimpan otomatis saat service worker dipasang (lihat app/api/offline-pages).
const OFFLINE_PAGES_URL = "/api/offline-pages";
// Data faskes seluruh Indonesia (snapshot OSM, ±420 KB terkompres) untuk Healthcare offline.
const HEALTHCARE_DATA_URL = "/api/healthcare/offline-data";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      // Simpan semua halaman publik + file JS/CSS-nya tanpa menunggu pengguna membukanya satu per satu.
      .then(() => precacheOfflinePages())
  );
});

const isPublicPage = (pathname) => PUBLIC_PAGES.some((pattern) => pattern.test(pathname));

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Payload RSC navigasi klien Next.js tidak disimpan (bisa memuat data sesi).
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  // Data lingkungan & prakiraan cuaca terakhir disimpan agar Beranda tetap terisi saat offline.
  if (url.pathname === "/api/environment" || url.pathname === "/api/weather") {
    event.respondWith(environmentNetworkFirst(request));
    return;
  }
  // Snapshot faskes OSM untuk Healthcare offline (versi mengikuti VERSION).
  if (url.pathname === HEALTHCARE_DATA_URL) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (url.pathname.startsWith("/api/")) return; // API lain (PDF, Tanya SYCLE, lokasi) tidak disimpan

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/images/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") event.respondWith(pageNetworkFirst(event, url));
});

// Gambar dari /_next/image dikirim dengan header "Vary: Accept". Permintaan <img> dan permintaan
// precache memakai header Accept berbeda, jadi pencocokan cache harus mengabaikan Vary.
const MATCH_OPTIONS = { ignoreVary: true };
const IMAGE_ACCEPT = "image/avif,image/webp,image/apng,image/*,*/*;q=0.8";

async function cacheFirst(request) {
  const cached = await caches.match(request, MATCH_OPTIONS);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(STATIC)).put(request, response.clone());
    return response;
  } catch (error) {
    // Offline: browser bisa meminta ukuran gambar lain dari yang tersimpan (tergantung lebar layar).
    // Pakai ukuran lain dari gambar yang sama bila ada.
    const fallback = await cachedImageVariant(request.url);
    if (fallback) return fallback;
    throw error;
  }
}

async function cachedImageVariant(requestUrl) {
  const url = new URL(requestUrl);
  if (url.pathname !== "/_next/image") return null;
  const source = url.searchParams.get("url");
  if (!source) return null;

  const cache = await caches.open(STATIC);
  const variants = (await cache.keys())
    .map((key) => new URL(key.url))
    .filter((key) => key.pathname === "/_next/image" && key.searchParams.get("url") === source)
    .sort((a, b) => Number(b.searchParams.get("w")) - Number(a.searchParams.get("w")));
  return variants.length ? cache.match(variants[0].href, MATCH_OPTIONS) : null;
}

// Status login terakhir disimpan di Cache Storage (service worker bisa dihentikan browser kapan saja).
const VIEWER_KEY = "/__sycle-viewer";

async function pageNetworkFirst(event, url) {
  const { request } = event;
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    const viewer = response.headers.get("x-sycle-viewer");
    if (viewer) {
      const stored = await cache.match(VIEWER_KEY);
      const lastViewer = stored ? await stored.text() : null;
      if (lastViewer !== viewer) {
        for (const key of await cache.keys()) await cache.delete(key);
        await cache.put(VIEWER_KEY, new Response(viewer));
        // Isi ulang halaman offline untuk status login yang baru.
        event.waitUntil(precacheOfflinePages());
      }
    }
    if (response.ok && isPublicPage(url.pathname) && !response.redirected) {
      await cache.put(url.pathname, response.clone());
    }
    return response;
  } catch {
    if (isPublicPage(url.pathname)) {
      const cached = await cache.match(url.pathname);
      if (cached) return cached;
    }
    return (await caches.match(OFFLINE_URL)) ?? Response.error();
  }
}

async function environmentNetworkFirst(request) {
  const cache = await caches.open(ENVIRONMENT);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      const keys = await cache.keys();
      for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ENVIRONMENT_ENTRIES))) await cache.delete(key);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (!cached) {
      return new Response(JSON.stringify({ error: "Koneksi tidak tersedia. Data lingkungan belum dapat diambil." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
    return markStored(cached);
  }
}

// ---------- Simpan otomatis halaman publik untuk offline ----------
// Halaman diambil satu per satu, lalu file JS/CSS/gambar yang dirujuk di HTML-nya ikut disimpan,
// supaya tombol, kartu belajar, dan kuis tetap berfungsi saat offline. Kegagalan satu halaman
// tidak menghentikan yang lain. Video (.mp4) tidak disimpan karena ukurannya besar.
const ASSET_PATTERN = /\/(?:_next\/static|_next\/image\?|brand\/|images\/|icons\/)[^"'\s\\)<>]+/g;

let precaching = null;

function precacheOfflinePages() {
  if (!precaching) {
    precaching = runPrecache().finally(() => {
      precaching = null;
    });
  }
  return precaching;
}

async function runPrecache() {
  let pages = [];
  try {
    const response = await fetch(OFFLINE_PAGES_URL, { cache: "no-store" });
    if (!response.ok) return;
    pages = (await response.json()).pages ?? [];
  } catch {
    return; // sedang offline; dicoba lagi saat service worker aktif berikutnya
  }

  const pageCache = await caches.open(PAGES);
  const staticCache = await caches.open(STATIC);
  const assets = new Set([HEALTHCARE_DATA_URL]);

  await Promise.allSettled(
    pages.filter(isPublicPage).map(async (path) => {
      const response = await fetch(path, { credentials: "same-origin" });
      if (!response.ok || response.redirected) return;
      await pageCache.put(path, response.clone());
      const html = await response.text();
      for (const match of html.matchAll(ASSET_PATTERN)) {
        const asset = match[0].replace(/&amp;/g, "&");
        if (!asset.endsWith(".mp4")) assets.add(asset);
      }
    })
  );

  await Promise.allSettled(
    [...assets].map(async (asset) => {
      if (await staticCache.match(asset, MATCH_OPTIONS)) return;
      // Gambar /_next/image harus diminta sebagai WebP/AVIF seperti permintaan <img>. Tanpa header ini
      // server mengirim JPEG, yang tidak punya latar transparan (latar ilustrasi berubah hitam).
      const response = await fetch(asset, asset.startsWith("/_next/image") ? { headers: { Accept: IMAGE_ACCEPT } } : undefined);
      if (response.ok) await staticCache.put(asset, response);
    })
  );
}

async function markStored(response) {
  const headers = new Headers(response.headers);
  headers.set("x-sycle-cache", "stored");
  return new Response(await response.blob(), { status: 200, headers });
}
