import {
  BookOpen,
  CheckCircle2,
  CloudSun,
  ExternalLink,
  HeartPulse,
  Info,
  Lightbulb,
} from "lucide-react";

/* ---------- Helpers ---------- */

// Render **bold** dan *italic* sederhana (tanpa dependency tambahan)
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    return part;
  });
}

// Pecah markdown berdasarkan heading "## "
function parseSections(md) {
  return md
    .split(/^##\s+/m)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [title, ...rest] = chunk.split("\n");
      return { title: title.trim(), body: rest.join("\n").trim() };
    });
}

function parseBullets(body) {
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[-*]\s+/.test(l))
    .map((l) => l.replace(/^[-*]\s+/, ""));
}

/* ---------- Small UI pieces ---------- */

const headingTones = {
  rose: "bg-rose-100 text-rose-600",
  sky: "bg-sky-100 text-sky-600",
  amber: "bg-amber-100 text-amber-600",
  violet: "bg-violet-100 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
};

function SectionHeading({ icon: Icon, children, tone = "rose" }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${headingTones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-base font-semibold text-slate-900">{children}</h3>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function ReflectionResult({ data }) {
  const sections = parseSections(data?.answer ?? "");
  const find = (kw) => sections.find((s) => s.title.toLowerCase().includes(kw));

  // Format baru: "Gambaran kondisi hari ini" dan "Konteks lingkungan".
  // Format lama: "Ringkasan catatanmu" dan "Kondisi iklim saat pencatatan".
  const ringkasan = find("gambaran") ?? find("ringkasan");
  const iklim = find("lingkungan") ?? find("iklim");
  const saran = find("saran");
  // Judul "CATATAN" harus persis; find("catatan") juga cocok dengan
  // "Ringkasan catatanmu" sehingga ringkasan tampil dua kali.
  const catatan = sections.find(
    (s) => s.title.trim().toLowerCase() === "catatan",
  );

  // Section yang tidak dikenali tetap ditampilkan (kecuali "Referensi",
  // karena sudah ditampilkan lewat data.sources)
  const known = [ringkasan, iklim, saran, catatan];
  const others = sections.filter(
    (s) => !known.includes(s) && !s.title.toLowerCase().includes("referensi"),
  );

  const tips = saran ? parseBullets(saran.body) : [];

  return (
    <div className="space-y-6">
      {/* Gambaran kondisi hari ini */}
      {ringkasan && (
        <section className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-4 ring-1 ring-rose-100">
          <SectionHeading icon={HeartPulse} tone="rose">
            {ringkasan.title}
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-700">
            {renderInline(ringkasan.body)}
          </p>
        </section>
      )}

      {/* Konteks lingkungan */}
      {iklim && (
        <section className="rounded-2xl bg-sky-50/60 p-4 ring-1 ring-sky-100">
          <SectionHeading icon={CloudSun} tone="sky">
            {iklim.title}
          </SectionHeading>
          <p className="text-sm leading-relaxed text-slate-700">
            {renderInline(iklim.body)}
          </p>
        </section>
      )}

      {/* Saran */}
      {saran && (
        <section>
          <SectionHeading icon={Lightbulb} tone="amber">
            {saran.title}
          </SectionHeading>
          <ul className="space-y-2.5">
            {tips.map((tip, i) => {
              const m = tip.match(/\s*\(([^)]+)\)\s*$/);
              const text = m ? tip.replace(m[0], "") : tip;
              return (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-slate-700">
                      {renderInline(text)}
                    </p>
                    {m && (
                      <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {m[1]}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Section lain yang tidak dikenali */}
      {others.map((s) => (
        <section key={s.title}>
          <SectionHeading icon={Info} tone="slate">
            {s.title}
          </SectionHeading>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {renderInline(s.body)}
          </p>
        </section>
      ))}

      {/* Sumber */}
      {data?.sources?.length > 0 && (
        <section>
          <SectionHeading icon={BookOpen} tone="violet">
            Sumber rujukan
          </SectionHeading>
          <ul className="space-y-2">
            {data.sources.map((src) => (
              <li key={src.n}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-100 text-xs font-semibold text-violet-700">
                    {src.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-slate-900 group-hover:text-violet-700">
                      {src.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {src.publisher}
                      {src.page ? ` · Hal. ${src.page}` : ""}
                    </p>
                  </div>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-violet-600" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Artikel terkait */}
      {data?.relatedArticles?.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Bacaan terkait
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.relatedArticles.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:bg-white hover:shadow-md"
              >
                <p className="line-clamp-3 text-sm font-medium leading-snug text-slate-800 group-hover:text-rose-600">
                  {a.title}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{a.publisher}</span>
                  <ExternalLink className="ml-2 h-3.5 w-3.5 shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Catatan / disclaimer dari AI tidak ditampilkan: sudah diwakili
          kotak "Catatan Penting" di bawah hasil refleksi. */}
    </div>
  );
}