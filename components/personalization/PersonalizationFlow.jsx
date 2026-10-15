"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardCheck, ClipboardList, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SingleChoice } from "@/components/forms/SingleChoice";
import { MultiChoice } from "@/components/forms/MultiChoice";
import { PERSONALIZATION_QUESTIONS, optionLabel } from "@/content/questions/personalization";
import { isAnswered } from "@/lib/personalization/flow";
import { usePersonalization } from "@/context/PersonalizationContext";

// WF-02: 13 (pengantar) → 14–22 (pertanyaan & cabang) → 23 (tinjau). Guest & Member, tanpa login.
export function PersonalizationFlow() {
  const { stage } = usePersonalization();
  if (stage === "questions") return <QuestionStep />;
  if (stage === "review") return <ReviewAnswers />;
  return <Intro />;
}

function Intro() {
  const { start, dirty, setStage } = usePersonalization();
  return (
    <div className="space-y-4">
      <ul className="list-disc space-y-1 pl-5">
        <li>Bukan diagnosis atau pemeriksaan kesehatan.</li>
        <li>Jawaban tidak otomatis disimpan.</li>
        <li>Kamu boleh melewati kondisi tertentu.</li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={start}>
          <ClipboardList aria-hidden="true" />
          {dirty ? "Mulai dari pertanyaan pertama" : "Mulai"}
        </Button>
        {dirty && (
          <Button size="lg" variant="outline" onClick={() => setStage("review")}>
            Lanjutkan ke tinjau jawaban
          </Button>
        )}
      </div>
    </div>
  );
}

function QuestionStep() {
  const { answers, steps, stepIndex, answer, setStepIndex, setStage } = usePersonalization();
  const headingRef = useRef(null);
  const index = Math.min(stepIndex, steps.length - 1);
  const code = steps[index];
  const question = PERSONALIZATION_QUESTIONS[code];
  const isLast = index === steps.length - 1;

  useEffect(() => {
    headingRef.current?.focus();
  }, [code]);

  const next = () => (isLast ? setStage("review") : setStepIndex(index + 1));
  const back = () => (index === 0 ? setStage("intro") : setStepIndex(index - 1));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-primary-pressed outline-none">
          Pertanyaan {index + 1} dari {steps.length}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 md:p-6">
        {question.type === "multi" ? (
          <MultiChoice
            code={code}
            question={question.question}
            helper={question.helper}
            options={question.options}
            value={answers[code] ?? []}
            onChange={(value) => answer(code, value)}
          />
        ) : (
          <SingleChoice
            code={code}
            question={question.question}
            helper={question.helper}
            options={question.options}
            value={answers[code] ?? null}
            onChange={(value) => answer(code, value)}
          />
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" onClick={back}>
          <ArrowLeft aria-hidden="true" />
          Kembali
        </Button>
        <Button onClick={next}>
          {isLast ? "Tinjau Jawaban" : "Lanjut"}
          {isLast ? <ClipboardCheck aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
        </Button>
      </div>
      {!isAnswered(answers[code]) && (
        <p className="text-sm text-muted-foreground">Pertanyaan ini boleh dilewati; jawabannya akan tercatat &quot;Belum dijawab&quot;.</p>
      )}
    </div>
  );
}

export function answerText(code, value) {
  if (!isAnswered(value)) return "Belum dijawab";
  return Array.isArray(value) ? value.map((v) => optionLabel(code, v)).join(", ") : optionLabel(code, value);
}

// WF-02 screen 23 — tinjau jawaban. Tidak ada penyimpanan otomatis; Guest tidak diminta login.
function ReviewAnswers() {
  const router = useRouter();
  const { answers, steps, goToStep } = usePersonalization();
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="space-y-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        Periksa jawaban sebelum melihat panduan.
      </h2>
      <dl className="divide-y rounded-xl border bg-card">
        {steps.map((code) => (
          <div key={code} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <dt className="text-sm text-muted-foreground">{PERSONALIZATION_QUESTIONS[code].question}</dt>
              <dd className={isAnswered(answers[code]) ? "font-semibold" : "font-semibold text-muted-foreground"}>
                {answerText(code, answers[code])}
              </dd>
            </div>
            <Button variant="ghost" size="sm" onClick={() => goToStep(code)} aria-label={`Ubah jawaban: ${PERSONALIZATION_QUESTIONS[code].question}`}>
              <Pencil aria-hidden="true" />
              Ubah
            </Button>
          </div>
        ))}
      </dl>
      {answers["P-00"] === "kehamilan" && (
        <p className="rounded-lg bg-lavender px-3 py-2 text-sm">
          Kebutuhan perlindungan sudah dicatat pada pertanyaan sumber daya (P-03), jadi tidak ada pertanyaan tambahan.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => goToStep(steps[0])}>
          <Pencil aria-hidden="true" />
          Ubah Jawaban
        </Button>
        <Button onClick={() => router.push("/personalisasi/hasil")}>
          Lihat Panduan
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
