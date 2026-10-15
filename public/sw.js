// SYCLE V2 — service worker minimal, ditulis manual tanpa package (K-06, Tahap 8).
//
// Aturan (CLAUDE.md §7–8, Master Draft 6.4.8, wireframe screen 11):
// * Halaman PUBLIK saja yang disimpan untuk dibaca offline (Beranda, Info & Edukasi, panduan, detail indikator,
//   Personalisasi, Tanya SYCLE). Health Tracker, Riwayat, Profil, PDF, autentikasi, dan semua permintaan non-GET
//   TIDAK PERNAH disimpan — data Tracker tidak masuk cache offline.
// * Halaman selalu diambil dari jaringan lebih dulu; cache hanya dipakai bila offline.
// * Data lingkungan terakhir (/api/environment) disimpan agar Beranda dapat menampilkan
//   "Data tersimpan — bukan kondisi terkini" saat offline. Respons dari cache diberi header x-sycle-cache: stored.
// * Bila status login berubah (Guest ↔ Member, mis. logout atau hapus akun), cache halaman dikosongkan agar nama
//   Member tidak tertinggal di halaman tersimpan.

const VERSION = "sycle-v2-2026-10-15";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const ENVIRONMENT = `${VERSION}-environment`;
const OFFLINE_URL = "/offline.html";
const MAX_ENVIRONMENT_ENTRIES = 5;

const PUBLIC_PAGES = [/^\/$/, /^\/info-edukasi(\/.*)?$/, /^\/panduan-umum$/, /^\/lingkungan\/[^/]+$/, /^\/personalisasi(\/hasil)?$/, /^\/tanya-sycle$/];
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

  if (url.pathname === "/api/environment") {
    event.respondWith(environmentNetworkFirst(request));
    return;
  }
  if (url.pathname.startsWith("/api/")) return; // API lain (PDF, Tanya SYCLE, lokasi) tidak disimpan

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/brand/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") event.respondWith(pageNetworkFirst(request, url));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(STATIC)).put(request, response.clone());
  return response;
}

// Status login terakhir disimpan di Cache Storage (service worker bisa dihentikan browser kapan saja).
const VIEWER_KEY = "/__sycle-viewer";

async function pageNetworkFirst(request, url) {
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

async function markStored(response) {
  const headers = new Headers(response.headers);
  headers.set("x-sycle-cache", "stored");
  return new Response(await response.blob(), { status: 200, headers });
}

// Halaman Beranda meminta data lingkungan tersimpan terakhir saat dibuka offline (screen 11).
self.addEventListener("message", (event) => {
  if (event.data?.type !== "latest-environment") return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(ENVIRONMENT);
      const keys = await cache.keys();
      const latest = keys.length ? await cache.match(keys[keys.length - 1]) : null;
      const body = latest ? await latest.json() : null;
      event.ports[0]?.postMessage({ snapshot: body });
    })()
  );
});
