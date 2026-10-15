/**
 * @jest-environment node
 */
// Simulasi public/sw.js (K-06, Tahap 8) dengan Cache Storage & jaringan tiruan.
// Memastikan: halaman publik tersedia offline, halaman Member & data Tracker tidak pernah disimpan,
// data lingkungan offline ditandai "stored", dan cache halaman dikosongkan saat status login berubah.
const fs = require("node:fs");
const vm = require("node:vm");

function createCaches() {
  const stores = new Map();
  const keyOf = (req) => (typeof req === "string" ? new URL(req, "http://localhost").href : req.url);
  const open = async (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const map = stores.get(name);
    return {
      put: async (req, res) => void map.set(keyOf(req), res),
      match: async (req) => map.get(keyOf(req))?.clone(),
      keys: async () => [...map.keys()].map((url) => new Request(url)),
      delete: async (req) => map.delete(keyOf(req)),
      addAll: async (urls) => urls.forEach((u) => map.set(keyOf(u), new Response(`precache ${u}`))),
    };
  };
  return {
    stores,
    open,
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    match: async (req) => {
      for (const name of stores.keys()) {
        const hit = await (await open(name)).match(req);
        if (hit) return hit;
      }
      return undefined;
    },
    paths: (name) => [...(stores.get(name)?.keys() ?? [])].map((u) => new URL(u).pathname),
  };
}

function loadWorker() {
  const listeners = {};
  const caches = createCaches();
  const net = { online: true, viewer: "guest" };
  const fetch = async (request) => {
    if (!net.online) throw new TypeError("Failed to fetch");
    const url = new URL(typeof request === "string" ? request : request.url);
    const body = url.pathname === "/api/environment" ? JSON.stringify({ location: { label: "Desa Uji" }, indicators: {} }) : `page ${url.pathname}`;
    return new Response(body, { status: 200, headers: { "x-sycle-viewer": net.viewer } });
  };
  const self = {
    location: new URL("http://localhost/"),
    addEventListener: (type, fn) => (listeners[type] = fn),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  vm.runInNewContext(fs.readFileSync("public/sw.js", "utf8"), { self, caches, fetch, Response, Request, Headers, URL, JSON, Promise, Math, console });

  const dispatch = async (path, { mode = "navigate", method = "GET" } = {}) => {
    const request = new Request(`http://localhost${path}`, { method });
    Object.defineProperty(request, "mode", { value: mode });
    let responded = null;
    listeners.fetch({ request, respondWith: (p) => (responded = p) });
    return responded ? await responded : "tidak ditangani";
  };
  return { listeners, caches, net, dispatch };
}

const PAGES = "sycle-v2-2026-10-15-pages";

describe("Service worker SYCLE (Tahap 8)", () => {
  test("halaman publik disimpan lalu tersedia saat offline", async () => {
    const sw = loadWorker();
    await sw.dispatch("/info-edukasi/panas-dan-tubuh");
    sw.net.online = false;
    const res = await sw.dispatch("/info-edukasi/panas-dan-tubuh");
    expect(await res.text()).toBe("page /info-edukasi/panas-dan-tubuh");
  });

  test("halaman Member (Tracker, Riwayat, Profil) tidak pernah disimpan; offline → halaman offline", async () => {
    const sw = loadWorker();
    await new Promise((resolve) => sw.listeners.install({ waitUntil: (p) => p.then(resolve) }));
    sw.net.viewer = "member";
    for (const path of ["/health-tracker", "/health-tracker/riwayat", "/health-tracker/riwayat/abc/pdf", "/profil", "/profil/privasi"]) {
      await sw.dispatch(path);
    }
    expect(sw.caches.paths(PAGES).filter((p) => !p.startsWith("/__"))).toEqual([]);
    sw.net.online = false;
    expect(await (await sw.dispatch("/health-tracker/riwayat")).text()).toBe("precache /offline.html");
  });

  test("API Tracker/PDF/Tanya SYCLE dan permintaan POST tidak ditangani service worker", async () => {
    const sw = loadWorker();
    expect(await sw.dispatch("/api/tracker/records/abc/pdf", { mode: "cors" })).toBe("tidak ditangani");
    expect(await sw.dispatch("/api/tanya-sycle", { mode: "cors", method: "POST" })).toBe("tidak ditangani");
    expect(await sw.dispatch("/health-tracker", { method: "POST" })).toBe("tidak ditangani");
  });

  test("data lingkungan offline diambil dari cache dan diberi tanda stored (screen 11)", async () => {
    const sw = loadWorker();
    const online = await sw.dispatch("/api/environment?adm4=31.71.01.1001", { mode: "cors" });
    expect(online.headers.get("x-sycle-cache")).toBeNull();
    sw.net.online = false;
    const offline = await sw.dispatch("/api/environment?adm4=31.71.01.1001", { mode: "cors" });
    expect(offline.headers.get("x-sycle-cache")).toBe("stored");
    expect((await offline.json()).location.label).toBe("Desa Uji");
    const none = await sw.dispatch("/api/environment?adm4=99.99.99.9999", { mode: "cors" });
    expect(none.status).toBe(503);
  });

  test("status login berubah → cache halaman dikosongkan (nama Member tidak tertinggal)", async () => {
    const sw = loadWorker();
    sw.net.viewer = "member";
    await sw.dispatch("/");
    expect(sw.caches.paths(PAGES)).toContain("/");
    sw.net.viewer = "guest";
    await sw.dispatch("/info-edukasi");
    expect(sw.caches.paths(PAGES).filter((p) => !p.startsWith("/__"))).toEqual(["/info-edukasi"]);
  });
});
