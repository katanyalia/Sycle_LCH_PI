"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { BookA, BookOpen, CircleHelp, MessageCircle, RefreshCw, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { DraftBadge } from "@/components/content/DraftContent";
import { ReferenceList } from "@/components/content/ReferenceList";
import { EXAMPLE_QUESTIONS } from "@/content/questions/askIndex";
import { QUESTION_LIMITS } from "@/lib/validations/askValidation";

// WF-07 screen 59 (awal), 60 (jawaban & sumber), 61 (tidak ada bukti / error).
// Pertanyaan dan jawaban hanya ada di layar ini (memori), tidak disimpan.
export function AskSycle() {
  const id = useId();
  const [question, setQuestion] = useState("");
  const [state, setState] = useState({ status: "idle" });
  const resultRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (state.status !== "idle" && state.status !== "loading") resultRef.current?.focus();
  }, [state.status]);

  async function ask(text) {
    const value = text.trim();
    if (value.length < QUESTION_LIMITS.min) {
      setState({ status: "invalid", message: "Tulis pertanyaanmu terlebih dahulu." });
      return;
    }
    setState({ status: "loading", question: value });
    try {
      const response = await fetch("/api/tanya-sycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 400) setState({ status: "invalid", message: body.error });
      else if (!response.ok) setState({ status: "error", question: value });
      else setState({ ...body, question: value });
    } catch {
      setState({ status: "error", question: value });
    }
  }

  function askAnother() {
    setQuestion("");
    setState({ status: "idle" });
    inputRef.current?.focus();
  }

  const loading = state.status === "loading";

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
        className="space-y-3 rounded-xl border bg-card p-4 md:p-6"
      >
        <Label htmlFor={`${id}-q`} className="flex items-center gap-2 text-base">
          <MessageCircle className="size-5 text-primary-pressed" aria-hidden="true" />
          Pertanyaanmu
        </Label>
        <Textarea
          ref={inputRef}
          id={`${id}-q`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              ask(question);
            }
          }}
          maxLength={QUESTION_LIMITS.max}
          rows={3}
          placeholder="Contoh: Apa bedanya ISPU dan US AQI?"
          aria-invalid={state.status === "invalid"}
          aria-describedby={`${id}-hint${state.status === "invalid" ? ` ${id}-error` : ""}`}
          className="text-base"
          disabled={loading}
        />
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          Tanyakan hal umum tentang lingkungan dan kesehatan perempuan. Jangan tulis data pribadi. {question.length}/
          {QUESTION_LIMITS.max}
        </p>
        {state.status === "invalid" && (
          <p id={`${id}-error`} className="text-sm font-medium text-destructive">
            {state.message}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          <Send aria-hidden="true" />
          {loading ? "Mencari jawaban…" : "Kirim Pertanyaan"}
        </Button>
      </form>

      {(state.status === "idle" || state.status === "invalid") && (
        <section aria-labelledby={`${id}-contoh`} className="space-y-2">
          <h2 id={`${id}-contoh`} className="text-sm font-semibold">
            Contoh pertanyaan
          </h2>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setQuestion(example);
                  ask(example);
                }}
                className="min-h-10 rounded-full border bg-card px-4 text-left text-sm font-medium hover:bg-secondary"
              >
                {example}
              </button>
            ))}
          </div>
        </section>
      )}

      {loading && <StatusMessage variant="loading" title="Mencari di topik dan referensi SYCLE…" />}

      {!loading && state.status !== "idle" && state.status !== "invalid" && (
        <div ref={resultRef} tabIndex={-1} className="space-y-4 outline-none" aria-live="polite">
          <p className="rounded-lg bg-lavender px-3 py-2 text-sm">
            <span className="font-semibold">Pertanyaanmu:</span> {state.question}
          </p>
          {state.status === "answer" && <Answer result={state} />}
          {state.status === "no_evidence" && <NoEvidence onRetry={askAnother} />}
          {state.status === "personal" && <Personal related={state.related} />}
          {state.status === "emergency" && <Emergency related={state.related} />}
          {state.status === "error" && (
            <StatusMessage
              variant="error"
              title="Tanya SYCLE sedang mengalami gangguan"
              action={
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => ask(state.question)}>
                    <RefreshCw aria-hidden="true" />
                    Coba Lagi
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/info-edukasi">Lihat Edukasi</Link>
                  </Button>
                </div>
              }
            >
              Jawaban belum dapat dimuat. Periksa koneksi internetmu lalu coba lagi.
            </StatusMessage>
          )}
          {state.status !== "error" && (
            <Button variant="outline" onClick={askAnother}>
              <MessageCircle aria-hidden="true" />
              Ajukan Pertanyaan Lain
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Screen 60 — jawaban singkat dari konten yang sudah ada, istilah, referensi, batasan.
function Answer({ result }) {
  const { topic, terms, references, related, mode } = result;
  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-xl border bg-card p-4 md:p-6" aria-label="Jawaban">
        {mode === "glossary" && terms.length > 0 ? (
          <div className="space-y-3">
            {terms
              .filter((_, index) => index < 2)
              .map((term) => (
                <div key={term.id} className="space-y-1">
                  <h2 className="text-lg font-semibold">{term.term}</h2>
                  {term.draft && <DraftBadge />}
                  <p>{term.definition}</p>
                  {term.note && <p className="text-sm text-muted-foreground">{term.note}</p>}
                </div>
              ))}
          </div>
        ) : (
          topic && (
            <div className="space-y-3">
              {topic.status !== "approved" && <DraftBadge />}
              <h2 className="text-lg font-semibold">{topic.title}</h2>
              <p>{topic.summary}</p>
              {topic.section && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{topic.section.heading}</h3>
                  {topic.section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        )}
        <p className="text-xs text-muted-foreground">
          Jawaban ini diambil dari topik dan glosarium SYCLE, bukan disusun oleh AI.
          {topic?.status !== "approved" && " Penjelasan topik masih draf dan belum ditinjau tim."}
        </p>
        {topic && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/info-edukasi/${topic.slug}`}>
              <BookOpen aria-hidden="true" />
              Baca topik lengkap
            </Link>
          </Button>
        )}
      </section>

      {terms.length > 0 && mode !== "glossary" && (
        <section className="space-y-2 rounded-xl border bg-card p-4" aria-label="Istilah">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <BookA className="size-4 text-primary-pressed" aria-hidden="true" />
            Istilah
          </h3>
          <dl className="space-y-1.5 text-sm">
            {terms.map((term) => (
              <div key={term.id}>
                <dt className="inline font-semibold">{term.term}: </dt>
                <dd className="inline">{term.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {references.length > 0 && (
        <section className="rounded-xl border bg-sage/60 p-4">
          <ReferenceList
            variant="card"
            title="Referensi terkurasi"
            description="Sumber asli yang dapat kamu buka. Referensi bukan klaim kesehatan dari SYCLE."
            references={references}
          />
        </section>
      )}

      {topic?.limitations && (
        <p className="rounded-xl border bg-powder p-4 text-sm">
          <span className="font-semibold">Batasan informasi: </span>
          {topic.limitations} Tanya SYCLE bukan tenaga kesehatan dan tidak membaca catatan Health Tracker-mu.
        </p>
      )}

      {related.length > 0 && <RelatedTopics related={related} title="Topik terkait" />}
    </div>
  );
}

// Screen 61 — informasi belum cukup.
function NoEvidence({ onRetry }) {
  return (
    <StatusMessage
      variant="empty"
      title="Informasi yang tersedia belum cukup untuk menjawab"
      action={
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/info-edukasi">
              <BookOpen aria-hidden="true" />
              Lihat Edukasi
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw aria-hidden="true" />
            Coba Lagi
          </Button>
        </div>
      }
    >
      SYCLE belum memiliki topik atau referensi yang sesuai dengan pertanyaan ini, sehingga tidak memberikan jawaban yang
      tidak didukung sumber. Coba gunakan kata lain, misalnya &quot;panas&quot;, &quot;ISPU&quot;, atau &quot;UV&quot;.
    </StatusMessage>
  );
}

function Personal({ related }) {
  return (
    <div className="space-y-3">
      <StatusMessage variant="info" title="Tanya SYCLE tidak dapat menilai kondisi pribadimu">
        Pertanyaan tentang kondisi tubuhmu sendiri, obat, atau dosis perlu dibicarakan dengan tenaga kesehatan. Tanya SYCLE
        hanya menjawab pertanyaan edukatif yang umum dan tidak membaca catatan Health Tracker-mu.
      </StatusMessage>
      {related.length > 0 && <RelatedTopics related={related} title="Kamu tetap bisa membaca topik umum ini" />}
    </div>
  );
}

function Emergency({ related }) {
  return (
    <div className="space-y-3">
      <div role="alert" className="flex gap-3 rounded-xl border border-destructive/40 bg-blush p-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold">Bila ini keadaan darurat, segera cari pertolongan</p>
          <p className="text-sm">
            Hubungi layanan darurat 119 atau datangi fasilitas kesehatan terdekat. Tanya SYCLE tidak dapat membantu dalam
            keadaan darurat dan tidak menilai kondisi pribadi.
          </p>
        </div>
      </div>
      {related.length > 0 && <RelatedTopics related={related} title="Topik umum terkait" />}
    </div>
  );
}

function RelatedTopics({ related, title }) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <CircleHelp className="size-4 text-primary-pressed" aria-hidden="true" />
        {title}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {related.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/info-edukasi/${topic.slug}`}
              className="inline-flex min-h-10 items-center rounded-full border bg-card px-4 text-sm font-semibold text-primary-pressed hover:bg-secondary"
            >
              {topic.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
