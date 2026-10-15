"use client";

import { useEffect, useId, useRef } from "react";
import { ArrowLeft, ArrowRight, ClipboardCheck, NotebookPen, Pencil, ShieldCheck, Bot, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SingleChoice } from "@/components/forms/SingleChoice";
import { MultiChoice } from "@/components/forms/MultiChoice";
import { DisruptionScale } from "@/components/forms/DisruptionScale";
import { TRACKER_QUESTIONS } from "@/content/questions/tracker";
import { scaledItems } from "@/lib/tracker/flow";
import { itemLabel, trackerAnswerText, TRACKER_SHORT_LABEL } from "@/lib/tracker/format";
import { useTrackerDraft } from "@/context/TrackerDraftContext";

function FreeText({ id, label, value, maxLength, onChange, rows = 3 }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value ?? ""} maxLength={maxLength} rows={rows} onChange={(e) => onChange(e.target.value)} className="text-base" aria-describedby={`${id}-count`} />
      <p id={`${id}-count`} className="text-right text-xs text-muted-foreground">
        {(value ?? "").length}/{maxLength}
      </p>
    </div>
  );
}

// WF-04 screen 28–45.
export function TrackerQuestionStep() {
  const id = useId();
  const { answers, steps, stepIndex, answer, setStepIndex, setStage } = useTrackerDraft();
  const headingRef = useRef(null);
  const index = Math.min(stepIndex, steps.length - 1);
  const code = steps[index];
  const q = TRACKER_QUESTIONS[code];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  useEffect(() => {
    if (!isFirst) headingRef.current?.focus();
  }, [code, isFirst]);

  return (
    <div className="space-y-5">
      {isFirst ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Catatan ini untuk mencatat pengalaman tubuhmu, bukan diagnosis.</li>
          <li>Mengisi formulir tidak sama dengan menyimpan. Penyimpanan dilakukan terpisah.</li>
          <li>Kamu boleh melewati pertanyaan dan memilih &quot;Tidak ingin menjawab&quot;.</li>
        </ul>
      ) : (
        <div className="space-y-2">
          <p ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-primary-pressed outline-none">
            Pertanyaan {index} dari {steps.length - 1}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(index / (steps.length - 1)) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
        {q.type === "single" && (
          <SingleChoice code={code} question={q.question} helper={q.helper} options={q.options} value={answers[code] ?? null} onChange={(v) => answer(code, v)} />
        )}

        {q.type === "multi" && (
          <>
            <MultiChoice code={code} question={q.question} helper={q.helper} options={q.options} value={answers[code] ?? []} onChange={(v) => answer(code, v)} />
            {q.other && (answers[code] ?? []).includes("lainnya") && (
              <FreeText id={`${id}-other`} label={q.other.label} value={answers[q.other.key]} maxLength={q.other.maxLength} onChange={(v) => answer(q.other.key, v)} rows={2} />
            )}
          </>
        )}

        {q.type === "scale-per-item" && (
          <div className="space-y-5">
            <div>
              <p className="text-lg font-semibold">{q.question}</p>
              <p className="text-sm text-muted-foreground">{q.helper}</p>
            </div>
            {scaledItems(answers, q.itemsFrom).map((item) => (
              <div key={item} className="rounded-xl border bg-background p-3">
                <DisruptionScale
                  question={itemLabel(q.itemsFrom, item, answers)}
                  value={answers[code]?.[item] ?? null}
                  onChange={(v) => {
                    const next = { ...(answers[code] ?? {}) };
                    if (v === null) delete next[item];
                    else next[item] = v;
                    answer(code, next);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {q.type === "scale" && (
          <>
            <DisruptionScale question={q.question} value={answers[code] ?? null} onChange={(v) => answer(code, v)} />
            {q.helper && <p className="text-sm text-muted-foreground">{q.helper}</p>}
          </>
        )}

        {q.type === "text" && (
          <>
            <p className="text-lg font-semibold">{q.question}</p>
            <p className="text-sm text-muted-foreground">{q.helper}</p>
            <FreeText id={`${id}-cerita`} label="Ceritamu (opsional)" value={answers[code]} maxLength={q.maxLength} onChange={(v) => answer(code, v)} rows={6} />
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        {isFirst ? (
          <span />
        ) : (
          <Button variant="outline" onClick={() => setStepIndex(index - 1)}>
            <ArrowLeft aria-hidden="true" />
            Kembali
          </Button>
        )}
        <Button
          onClick={() => (isLast ? setStage("review") : setStepIndex(index + 1))}
          disabled={isFirst && !answers.KONTEKS}
        >
          {isFirst ? <NotebookPen aria-hidden="true" /> : null}
          {isFirst ? "Mulai Mencatat" : isLast ? "Tinjau Catatan" : "Lanjut"}
          {isLast ? <ClipboardCheck aria-hidden="true" /> : !isFirst ? <ArrowRight aria-hidden="true" /> : null}
        </Button>
      </div>
      {isFirst && !answers.KONTEKS && <p className="text-sm text-muted-foreground">Pilih konteks untuk mulai mencatat.</p>}
    </div>
  );
}

// WF-04 screen 46 — tinjau. Belum disimpan; belum ada persetujuan AI.
export function TrackerReview() {
  const { answers, steps, goToStep, setStage } = useTrackerDraft();
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="space-y-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        Periksa catatanmu sebelum melanjutkan.
      </h2>
      <p className="rounded-lg bg-lavender px-3 py-2 text-sm">Catatan ini belum disimpan dan belum ada persetujuan AI.</p>
      <dl className="divide-y rounded-xl border bg-card">
        {steps.map((code) => (
          <div key={code} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <dt className="text-sm text-muted-foreground">{TRACKER_SHORT_LABEL[code]}</dt>
              <dd className="whitespace-pre-line font-semibold">{trackerAnswerText(code, answers)}</dd>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(code)} aria-label={`Ubah: ${TRACKER_SHORT_LABEL[code]}`}>
              <Pencil aria-hidden="true" />
              Ubah
            </Button>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => goToStep(steps[0])}>
          <Pencil aria-hidden="true" />
          Ubah Catatan
        </Button>
        <Button onClick={() => setStage("consent")}>
          Lanjut
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// WF-04 screen 47 — persetujuan AI #3. Tidak pre-checked; AI belum tersedia (Tahap 9).
export function TrackerConsent() {
  const { setStage } = useTrackerDraft();
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="space-y-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        Apakah kamu ingin AI membantu menyusun refleksi catatanmu?
      </h2>
      <ul className="space-y-2 rounded-xl border bg-card p-4 text-sm">
        <li className="flex gap-2"><Bot className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />Tujuan: merangkum dan memberi konteks edukatif.</li>
        <li className="flex gap-2"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />Data yang diproses: jawaban Tracker yang kamu setujui.</li>
        <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />AI opsional. Ringkasan tanpa AI tetap tersedia dan catatan tetap bisa disimpan.</li>
        <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />Persetujuan ini terpisah dari Simpan Catatan.</li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setStage("summary")}>Lanjut Tanpa AI</Button>
        <Button variant="outline" disabled aria-describedby="ai-belum-tersedia">
          <Bot aria-hidden="true" />
          Saya Setuju, Gunakan AI
        </Button>
      </div>
      <p id="ai-belum-tersedia" className="text-sm text-muted-foreground">
        Refleksi AI belum tersedia pada prototipe ini (direncanakan Tahap 9). Tidak ada data yang dikirim ke AI.
      </p>
      <Button variant="ghost" onClick={() => setStage("review")}>
        <ArrowLeft aria-hidden="true" />
        Kembali ke tinjau catatan
      </Button>
    </div>
  );
}
