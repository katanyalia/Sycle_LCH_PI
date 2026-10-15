"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// Lokasi & data lingkungan disimpan di memori saja (tidak di localStorage).
// Tahap 8: saat offline, service worker (public/sw.js) mengembalikan data lingkungan terakhir dari Cache Storage
// dengan tanda `fromCache` → ditampilkan "Data tersimpan — bukan kondisi terkini" (screen 11).
const EnvironmentContext = createContext(null);

export function EnvironmentProvider({ children }) {
  const [location, setLocation] = useState(null); // { kind, code, label, shortLabel, lat, lon }
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const [online, setOnline] = useState(true);
  const requestId = useRef(0);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const load = useCallback(async (target) => {
    const params = new URLSearchParams();
    if (target.kind === "village") params.set("adm4", target.code);
    if (Number.isFinite(target.lat) && Number.isFinite(target.lon)) {
      params.set("lat", String(target.lat));
      params.set("lon", String(target.lon));
    }
    const id = ++requestId.current;
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch(`/api/environment?${params}`);
      const body = await response.json();
      if (id !== requestId.current) return;
      if (!response.ok) throw new Error(body.error ?? "Data lingkungan belum dapat diambil.");
      setSnapshot({ ...body, fromCache: response.headers.get("x-sycle-cache") === "stored" });
      // Simpan koordinat desa dari BMKG agar bisa dipakai sebagai cadangan pada pembaruan berikutnya.
      setLocation((current) => ({ ...current, ...body.location, kind: target.kind, code: target.code ?? null }));
      setStatus("ready");
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err.message || "Data lingkungan belum dapat diambil.");
      setStatus("error");
    }
  }, []);

  const selectVillage = useCallback(
    (village) => {
      const target = { kind: "village", code: village.code, label: village.label, shortLabel: `${village.village}, ${village.regency}` };
      setLocation(target);
      setSnapshot(null);
      load(target);
    },
    [load]
  );

  const selectDevice = useCallback(
    (lat, lon) => {
      const target = { kind: "device", code: null, lat, lon, label: "Lokasi perangkatmu", shortLabel: "Lokasi perangkatmu" };
      setLocation(target);
      setSnapshot(null);
      load(target);
    },
    [load]
  );

  // Dibuka saat offline tanpa lokasi di memori: minta data tersimpan terakhir ke service worker (screen 11).
  useEffect(() => {
    if (navigator.onLine || !navigator.serviceWorker?.controller) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      const stored = event.data?.snapshot;
      if (!stored?.location || !stored?.indicators) return;
      setLocation((current) => current ?? { ...stored.location });
      setSnapshot((current) => current ?? { ...stored, fromCache: true });
      setStatus((current) => (current === "idle" ? "ready" : current));
    };
    navigator.serviceWorker.controller.postMessage({ type: "latest-environment" }, [channel.port2]);
  }, []);

  const refresh = useCallback(() => {
    if (location) load(location);
  }, [location, load]);

  const clearLocation = useCallback(() => {
    requestId.current++;
    setLocation(null);
    setSnapshot(null);
    setStatus("idle");
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ location, snapshot, status, error, online, selectVillage, selectDevice, refresh, clearLocation }),
    [location, snapshot, status, error, online, selectVillage, selectDevice, refresh, clearLocation]
  );

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) throw new Error("useEnvironment harus dipakai di dalam EnvironmentProvider");
  return context;
}
