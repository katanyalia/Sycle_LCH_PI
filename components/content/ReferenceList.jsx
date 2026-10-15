import { ExternalLink } from "lucide-react";

// Referensi ditampilkan dengan judul, penerbit, dan tautan — tanpa kode audit internal (Master Draft 5.7).
export function ReferenceList({ references, title = "Referensi" }) {
  if (!references?.length) return null;
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
