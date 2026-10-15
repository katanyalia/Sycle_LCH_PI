"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// WF-08 screen 64 — daftar istilah dengan pencarian.
export function GlossaryList({ entries }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const filtered = q
    ? entries.filter((entry) => normalize(`${entry.term} ${entry.definition}`).includes(q))
    : entries;
  const byId = Object.fromEntries(entries.map((entry) => [entry.id, entry]));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${id}-q`}>Cari istilah</Label>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={`${id}-q`} value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 pl-9 text-base" placeholder="Contoh: ISPU" />
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered.length === 0 ? "Istilah tidak ditemukan." : `${filtered.length} istilah`}
        </p>
      </div>
      <dl className="space-y-3">
        {filtered.map((entry) => (
          <div key={entry.id} id={entry.id} className="scroll-mt-24 space-y-2 rounded-xl border bg-card p-4">
            <dt className="text-lg font-semibold">{entry.term}</dt>
            <dd className="space-y-2">
              <p>{entry.definition}</p>
              {entry.note && <p className="text-sm text-muted-foreground">{entry.note}</p>}
              {entry.related.length > 0 && (
                <p className="text-sm">
                  Lihat juga:{" "}
                  {entry.related.map((relatedId, index) => (
                    <span key={relatedId}>
                      {index > 0 && ", "}
                      <a href={`#${relatedId}`} className="font-semibold text-primary-pressed hover:underline" onClick={() => setQuery("")}>
                        {byId[relatedId]?.term}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
