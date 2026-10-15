"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { ReferenceItem } from "@/components/content/ReferenceList";
import { REFERENCE_TOPICS, topicIdsOf } from "@/content/education/referenceTopics";
import { cn } from "@/lib/utils";

const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Daftar seluruh referensi terkurasi untuk pengguna, dengan filter topik dan pencarian.
export function ReferenceCatalog({ references }) {
  const id = useId();
  const [topic, setTopic] = useState("semua");
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  const withTopics = references.map((ref) => ({ ...ref, topicIds: topicIdsOf(ref) }));
  const filtered = withTopics.filter(
    (ref) =>
      (topic === "semua" || ref.topicIds.includes(topic)) &&
      (!q || normalize(`${ref.title} ${ref.publisher} ${ref.sourceType}`).includes(q))
  );
  const tabs = [{ id: "semua", label: "Semua" }, ...REFERENCE_TOPICS];
  const labelOf = Object.fromEntries(REFERENCE_TOPICS.map((t) => [t.id, t.label]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter topik referensi">
        {tabs.map((tab) => {
          const count = tab.id === "semua" ? withTopics.length : withTopics.filter((r) => r.topicIds.includes(tab.id)).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTopic(tab.id)}
              aria-pressed={topic === tab.id}
              className={cn(
                "min-h-10 rounded-full border bg-card px-4 text-sm font-medium hover:bg-secondary",
                topic === tab.id && "border-primary bg-secondary text-primary-pressed"
              )}
            >
              {tab.label} <span className="text-muted-foreground">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-md space-y-2">
        <Label htmlFor={`${id}-q`}>Cari judul atau penerbit</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={`${id}-q`} value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 pl-9 text-base" placeholder="Contoh: WHO" />
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered.length} referensi
        </p>
      </div>

      {topic === "ditunda" && (
        <StatusMessage variant="info" title="Topik ini belum dibahas di prototipe">
          Referensi tetap disimpan dan dapat dibuka, tetapi belum ada penjelasan topik di SYCLE.
        </StatusMessage>
      )}

      {filtered.length === 0 ? (
        <StatusMessage variant="empty" title="Referensi tidak ditemukan">
          Coba topik atau kata kunci lain.
        </StatusMessage>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.map((ref) => (
            <li key={ref.url}>
              <ReferenceItem reference={ref}>
                <p className="text-xs text-muted-foreground">Topik: {ref.topicIds.map((t) => labelOf[t]).join(", ") || "Umum"}</p>
                {ref.articles.length > 0 && (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <BookOpen className="size-3.5 text-primary-pressed" aria-hidden="true" />
                    {ref.articles.map((article) => (
                      <Link key={article.slug} href={`/info-edukasi/${article.slug}`} className="font-semibold text-primary-pressed hover:underline">
                        {article.title}
                      </Link>
                    ))}
                  </p>
                )}
              </ReferenceItem>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
