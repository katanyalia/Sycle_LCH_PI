"use client";

import { useEffect, useState } from "react";
import { buildEnvironmentSnapshot } from "@/lib/healthtracker/buildEnvironmentSnapshot";

export default function useHealthTrackerEnvironment(environmentLocation) {
  const [snapshot, setSnapshot] = useState(null);
  const [environmentLoading, setEnvironmentLoading] = useState(true);
  const [environmentError, setEnvironmentError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchEnvironment() {
      setEnvironmentLoading(true);
      setEnvironmentError("");
      setSnapshot(null);

      const adm4 = environmentLocation?.adm4;
      const coordinates = environmentLocation?.coordinates;

      const hasCoordinates =
        coordinates?.latitude != null &&
        coordinates?.longitude != null;

      if (!adm4 && !hasCoordinates) {
        setEnvironmentLoading(false);
        return;
      }

      const params = new URLSearchParams();

      if (adm4) {
        params.set("adm4", adm4);
      } else {
        params.set("lat", coordinates.latitude);
        params.set("lon", coordinates.longitude);
      }

      try {
        const response = await fetch(
          `/api/environment?${params.toString()}`,
          { cache: "no-store" }
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload?.error ?? "Data lingkungan belum dapat diambil."
          );
        }

        const environmentSnapshot =
          buildEnvironmentSnapshot(payload);

        if (!environmentSnapshot) {
          throw new Error(
            "Data lingkungan belum lengkap untuk disimpan."
          );
        }

        if (!cancelled) {
          setSnapshot(environmentSnapshot);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setEnvironmentError(
            fetchError.message ??
              "Data lingkungan belum dapat diambil."
          );
        }
      } finally {
        if (!cancelled) {
          setEnvironmentLoading(false);
        }
      }
    }

    fetchEnvironment();

    return () => {
      cancelled = true;
    };
  }, [environmentLocation]);

  return {
    snapshot,
    environmentLoading,
    environmentError,
  };
}