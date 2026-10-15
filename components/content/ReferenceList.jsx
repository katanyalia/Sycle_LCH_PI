import { ExternalLink } from "lucide-react";

// Referensi ditampilkan dengan judul, penerbit, jenis sumber, dan tautan ke sumber asli —
// tanpa kode audit internal (Master Draft 5.7). Label tambahan untuk studi populasi & safety draft (E-4).
// variant "compact" (bawaan, dipakai panduan) atau "card" (Info & Edukasi).
export function ReferenceList({ references, title = "Referensi", description, variant = "compact" }) {
  if (!references?.length) return null;
  if (variant === "card") {
    return (
      <div className="space-y-2">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <ul className="space-y-2">
          {references.map((ref) => (
            <li key={ref.url}>
              <ReferenceItem reference={ref} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="space-y-1.5 text-sm">
        {references.map((ref) => (
          <li key={ref.url}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1.5 text-primary-pressed underline-offset-2 hover:underline"
            >
              <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {ref.title} <span className="text-muted-foreground">— {ref.publisher}</span>
                <span className="sr-only"> (membuka tab baru)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReferenceItem({ reference, children }) {
  return (
    <div className="space-y-1.5 rounded-lg border bg-card p-3 text-sm">
      <p className="font-semibold">{reference.title}</p>
      <p className="text-muted-foreground">
        {reference.publisher}
        {reference.sourceType && ` · ${reference.sourceType}`}
      </p>
      <ReferenceLabels reference={reference} />
      {children}
      <a
        href={reference.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-8 items-center gap-1.5 font-semibold text-primary-pressed underline-offset-2 hover:underline"
      >
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
        Buka sumber asli
        <span className="sr-only"> (membuka tab baru)</span>
      </a>
    </div>
  );
}

export function ReferenceLabels({ reference }) {
  if (!reference.populationStudy && !reference.safetyDraft) return null;
  return (
    <p className="flex flex-wrap gap-1.5">
      {reference.populationStudy && (
        <span className="rounded-full bg-powder px-2 py-0.5 text-xs font-semibold">
          Studi populasi — tidak berlaku pasti untuk individu
        </span>
      )}
      {reference.safetyDraft && (
        <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-semibold text-primary-pressed">
          Perlu tinjauan klinis
        </span>
      )}
    </p>
  );
}
