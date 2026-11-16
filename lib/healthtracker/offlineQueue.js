// Antrean catatan Health Tracker yang dibuat saat offline.
// Disimpan di IndexedDB perangkat, terikat ke akun yang membuatnya, lalu dikirim ke Supabase
// begitu online (components/pwa/TrackerOfflineSync.jsx). Setelah terkirim, salinannya dihapus.
// Antrean dikosongkan saat logout (components/profile/LogoutButton.jsx).

const DB_NAME = "sycle-offline";
const STORE = "tracker-queue";
const CHANGE_EVENT = "sycle:tracker-queue";

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB tidak tersedia"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      store.createIndex("userId", "userId");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, action) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const result = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(result?.result ?? result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

function notifyChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function onTrackerQueueChange(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

// input = argumen saveHealthTrackerAssessment (kondisi, jawaban, cerita, data lingkungan).
export async function queueTrackerRecord(userId, input) {
  await withStore("readwrite", (store) =>
    store.add({ userId, input, recordedAt: new Date().toISOString() })
  );
  notifyChange();
}

export async function listQueuedRecords() {
  try {
    return await withStore("readonly", (store) => store.getAll());
  } catch {
    return [];
  }
}

export async function removeQueuedRecord(id) {
  await withStore("readwrite", (store) => store.delete(id));
  notifyChange();
}

export async function clearTrackerQueue() {
  forgetTrackerUser();
  try {
    await withStore("readwrite", (store) => store.clear());
    notifyChange();
  } catch {
    // IndexedDB tidak tersedia: tidak ada antrean yang perlu dihapus.
  }
}

// ID akun terakhir yang login di perangkat ini. Dipakai saat offline bila sesi login tidak bisa
// diperbarui (token kedaluwarsa butuh internet). Dihapus saat logout.
const LAST_USER_KEY = "sycle:tracker-user";

export function rememberTrackerUser(userId) {
  try {
    if (userId) localStorage.setItem(LAST_USER_KEY, userId);
  } catch {
    // penyimpanan perangkat tidak tersedia
  }
}

export function lastTrackerUser() {
  try {
    return localStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
}

export function forgetTrackerUser() {
  try {
    localStorage.removeItem(LAST_USER_KEY);
  } catch {
    // penyimpanan perangkat tidak tersedia
  }
}

// Server tidak bisa dihubungi? Dipakai bila server action gagal dengan error yang bukan TypeError
// (Next.js kadang membungkus kegagalan jaringan dengan pesan lain).
export async function isServerUnreachable() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  try {
    const response = await fetch(`/api/offline-pages?ping=${Date.now()}`, { cache: "no-store" });
    return !response.ok;
  } catch {
    return true;
  }
}

export function isOfflineError(error) {
  return (
    (typeof navigator !== "undefined" && navigator.onLine === false) ||
    error?.name === "TypeError" ||
    /failed to fetch|load failed|networkerror|network request failed/i.test(error?.message ?? "")
  );
}
