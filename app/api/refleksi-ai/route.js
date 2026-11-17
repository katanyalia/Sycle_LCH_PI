import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const maxDuration = 60;

// Membatasi data agar payload tetap terkontrol.
function bersihkanObject(data, maxKeys = 100) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(data)
      .slice(0, maxKeys)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return [key, value.slice(0, 2000)];
        }

        if (typeof value === "number" || typeof value === "boolean") {
          return [key, value];
        }

        if (Array.isArray(value)) {
          return [
            key,
            value.slice(0, 30).map((item) =>
              typeof item === "string"
                ? item.slice(0, 500)
                : item
            ),
          ];
        }

        return [key, value];
      })
  );
}

function bersihkanRingkasan(summary) {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return null;
  }

  const facts =
    summary.facts && typeof summary.facts === "object" ? summary.facts : {};

  return {
    title: String(summary.title ?? "").slice(0, 200),
    facts: {
      keluhan: String(facts.keluhan ?? "").slice(0, 1500),
      situasi: String(facts.situasi ?? "").slice(0, 1500),
    },
    intro: String(summary.intro ?? "").slice(0, 2000),
    sections: Array.isArray(summary.sections)
      ? summary.sections.slice(0, 10).map((section) => ({
          title: String(section?.title ?? "").slice(0, 200),
          content: Array.isArray(section?.content)
            ? section.content.slice(0, 30).map((item) =>
                String(item).slice(0, 1000)
              )
            : [],
        }))
      : [],
  };
}

function bersihkanCatatan(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) {
    return { error: "Format catatan tidak valid" };
  }

  const kondisi =
    typeof c.kondisi === "string" ? c.kondisi.trim() : "";

  if (!kondisi) {
    return { error: "Kondisi pengguna tidak boleh kosong" };
  }

  const cerita =
    typeof c.cerita === "string" ? c.cerita.trim().slice(0, 2000) : "";

  const gejala = Array.isArray(c.gejala)
    ? c.gejala
        .filter((g) => typeof g === "string")
        .slice(0, 30)
    : [];

  const iklim = Array.isArray(c.iklim)
    ? c.iklim.slice(0, 10)
        .filter((item) => item && typeof item === "object")
        .map(({ label, value, unit }) => ({
          label: String(label ?? "").slice(0, 200),
          value:
            typeof value === "number"
              ? value
              : String(value ?? "").slice(0, 100),
          unit: unit ? String(unit).slice(0, 50) : null,
        }))
    : [];

  const generatedSummary = bersihkanRingkasan(c.generatedSummary);
  const answers = bersihkanObject(c.answers);
  const scores = bersihkanObject(c.scores);

  return {
    value: {
      kondisi,
      gejala,
      iklim,
      cerita,
      generatedSummary,
      answers,
      scores,
    },
  };
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const { value: catatan, error } = bersihkanCatatan(body?.catatan);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const baseUrl = process.env.FASTAPI_BASE_URL;

    if (!baseUrl) {
      throw new Error("FASTAPI_BASE_URL belum di-set");
    }

    const upstream = await fetch(`${baseUrl}/refleksi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ catatan }),
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok || !data) {
      console.error("FastAPI error:", upstream.status, data);

      return NextResponse.json(
        { error: "Layanan refleksi AI sedang bermasalah." },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Refleksi API error:", err);

    const timeout = err?.name === "TimeoutError";

    return NextResponse.json(
      {
        error: timeout
          ? "Layanan AI terlalu lama merespons."
          : "Layanan refleksi AI belum dapat dihubungi.",
      },
      { status: timeout ? 504 : 500 }
    );
  }
}