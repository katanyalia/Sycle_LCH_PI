// Pemanggilan API eksternal dari server. User-Agent jujur mengidentifikasi SYCLE.
// Cache memakai Next.js Data Cache (`next.revalidate`, model tanpa Cache Components).
export const USER_AGENT = "SYCLE-V2/0.1 (aplikasi edukasi nonkomersial; Perempuan Inovasi 2026)";

export class SourceError extends Error {
  constructor(source, reason) {
    super(`${source}: ${reason}`);
    this.source = source;
    this.reason = reason;
  }
}

export async function fetchJson(source, url, { revalidate, timeoutMs }) {
  let response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new SourceError(source, error?.name === "TimeoutError" ? "timeout" : "network");
  }
  if (!response.ok) throw new SourceError(source, `http_${response.status}`);
  try {
    return await response.json();
  } catch {
    throw new SourceError(source, "invalid_json");
  }
}
