"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { ContentStatus } from "@/components/content/ContentStatus";
import { cn } from "@/lib/utils";

const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// WF-08 screen 62 — katalog dengan kategori & pencarian sederhana (T3-4).
export function ArticleCatalog({ articles, categories }) {
  const id = useId();
  const [category, setCategory] = useState("semua");
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  const filtered = articles.filter(
    (article) =>
      (category === "semua" || article.category === category) &&
      (!q || normalize(`${article.title} ${article.summary}`).includes(q))
  );
  const labelOf = Object.fromEntries(categories.map((c) => [c.id, c.label]));
  const tabs = [{ id: "semua", label: "Semua" }, ...categories];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
        {tabs.map((tab) => {
          const count = tab.id === "semua" ? articles.length : articles.filter((a) => a.category === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              aria-pressed={category === tab.id}
              className={cn(
                "min-h-10 rounded-full border bg-card px-4 text-sm font-medium hover:bg-secondary",
                category === tab.id && "border-primary bg-secondary text-primary-pressed"
              )}
            >
              {tab.label} <span className="text-muted-foreground">({count})</span>
            </button>
          );
        })}
      </div>

      {articles.length > 0 && (
        <div className="max-w-md space-y-2">
          <Label htmlFor={`${id}-q`}>Cari topik</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id={`${id}-q`} value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 pl-9 text-base" />
          </div>
        </div>
      )}

      {articles.length === 0 ? (
        <StatusMessage variant="empty" title="Artikel sedang disiapkan">
          Artikel edukasi sedang ditulis dan ditinjau oleh tim. Sementara itu, kamu bisa membaca glosarium.
        </StatusMessage>
      ) : filtered.length === 0 ? (
        <StatusMessage variant="empty" title="Belum ada artikel yang cocok">
          Coba kategori atau kata kunci lain.
        </StatusMessage>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2" aria-live="polite">
          {filtered.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/info-edukasi/${article.slug}`}
                className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 hover:bg-secondary"
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="size-4 text-primary-pressed" aria-hidden="true" />
                  {labelOf[article.category]}
                </span>
                <span className="text-lg font-semibold group-hover:underline">{article.title}</span>
                <span className="text-sm text-muted-foreground">{article.summary}</span>
                <span className="mt-auto pt-1">
                  <ContentStatus item={article} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
