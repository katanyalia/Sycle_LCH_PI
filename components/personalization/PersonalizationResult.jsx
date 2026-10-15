"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, ClipboardList, Lightbulb, MapPin, Pencil, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ContentStatus } from "@/components/content/ContentStatus";
import { ReferenceList } from "@/components/content/ReferenceList";
import { IndicatorValue } from "@/components/environment/IndicatorValue";
import { answerText } from "@/components/personalization/PersonalizationFlow";
import { PERSONALIZATION_QUESTIONS } from "@/content/questions/personalization";
import { PERSONAL_GUIDANCE } from "@/content/guidance/personal";
import { EVIDENCE_SOURCES } from "@/content/evidence/sources";
import { APPROVERS } from "@/content/approvers";
import { SHOW_DRAFT_CONTENT } from "@/lib/config";
import { resolveReferences } from "@/lib/content/rules";
import { hasAnyAnswer } from "@/lib/personalization/flow";
import { recommendGuidance } from "@/lib/personalization/recommend";
import { usePersonalization } from "@/context/PersonalizationContext";
import { useEnvironment } from "@/context/EnvironmentContext";
import { useNow } from "@/hooks/useNow";

// WF-03 screen 24 (hasil), 25 (Lewati), 26 (data/panduan tidak tersedia). Tanpa AI (AI #2 di Tahap 9).
export function PersonalizationResult() {
  const router = useRouter();
  const { answers, steps, goToStep, reset } = usePersonalization();
  const { snapshot, status: envStatus } = useEnvironment();
  const now = useNow();

  const result = useMemo(
    () =>
      recommendGuidance(answers, snapshot, {
        items: PERSONAL_GUIDANCE,
        sources: EVIDENCE_SOURCES,
        approvers: APPROVERS,
        showDraft: SHOW_DRAFT_CONTENT,
        now,
      }),
    [answers, snapshot, now]
  );

  if (!hasAnyAnswer(answers)) {
    return (
      <StatusMessage
        variant="empty"
        title="Belum ada jawaban personalisasi"
        action={
          <Button asChild>
            <Link href="/personalisasi">
              <ClipboardList aria-hidden="true" />
              Mulai Personalisasi
            </Link>
          </Button>
        }
      >
        Jawaban tidak disimpan, jadi hilang bila halaman dimuat ulang.
      </StatusMessage>
    );
  }

  const skipped = !answers["P-00"] || answers["P-00"] === "lewati";
  const finish = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Ringkasan konteks */}
      <section aria-labelledby="judul-ringkasan" className="space-y-3 rounded-xl border bg-card p-4">
        <h2 id="judul-ringkasan" className="font-semibold">Ringkasan jawabanmu</h2>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {steps.map((code) => (
            <div key={code}>
              <dt className="text-muted-foreground">{shortLabel(code)}</dt>
              <dd className="font-semibold">{code === "P-00" && skipped ? "Kondisi khusus: dilewati" : answerText(code, answers[code])}</dd>
            </div>
          ))}
        </dl>
      </section>

      {skipped && (
        <StatusMessage variant="info" title="Panduan umum untuk aktivitasmu">
          Kamu tidak memilih kondisi khusus, jadi panduan di bawah bersifat umum dan disusun dari rencana aktivitas serta
          sumber daya yang kamu pilih. Kamu tidak wajib memilih menstruasi, kehamilan, atau menyusui.
        </StatusMessage>
      )}

      {/* Kondisi lingkungan valid */}
      <section aria-labelledby="judul-lingkungan" className="space-y-3">
        <h2 id="judul-lingkungan" className="text-lg font-semibold">Kondisi lingkungan</h2>
        {snapshot ? (
          <div className="space-y-3 rounded-xl border bg-powder p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <MapPin className="size-4 text-primary-pressed" aria-hidden="true" />
              {snapshot.location.label}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {["heatIndex", "airQuality", "uv"].map((id) => (
                <IndicatorValue key={id} indicator={snapshot.indicators[id]} timezone={snapshot.location.timezone} now={now} />
              ))}
            </div>
          </div>
        ) : (
          <StatusMessage
            variant="partial"
            title={envStatus === "loading" ? "Data lingkungan sedang dimuat" : "Data lingkungan belum tersedia"}
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/">
                  <MapPin aria-hidden="true" />
                  Pilih Lokasi di Beranda
                </Link>
              </Button>
            }
          >
            Panduan di bawah disusun tanpa data lingkungan. Pilih lokasi agar urutan panduan mempertimbangkan kondisi
            lingkungan yang valid.
          </StatusMessage>
        )}
      </section>

      {/* Panduan utama */}
      <section aria-labelledby="judul-panduan" className="space-y-3">
        <h2 id="judul-panduan" className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="size-5 text-primary-pressed" aria-hidden="true" />
          Panduan perlindungan untuk rencanamu
        </h2>

        {result.status === "insufficient" ? (
          <StatusMessage
            variant="partial"
            title="Sebagian panduan belum dapat disusun."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/panduan-umum">Lihat panduan umum</Link>
              </Button>
            }
          >
            {SHOW_DRAFT_CONTENT
              ? "Belum cukup panduan yang sesuai dengan jawabanmu."
              : "Konten panduan yang belum ditinjau sedang disembunyikan."}{" "}
            SYCLE tidak membuat panduan baru di luar sumber yang tersedia.
          </StatusMessage>
        ) : null}

        {result.steps.length > 0 && (
          <ol className="space-y-3">
            {result.steps.map((step, index) => (
              <li key={step.id} className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <ContentStatus item={step} />
                </div>
                <p className="text-lg font-semibold">{step.text}</p>
                <p className="flex gap-2 text-sm">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary-pressed" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">Alasan: </span>
                    {step.reason}
                  </span>
                </p>
                {step.notes.length > 0 && (
                  <div className="rounded-lg bg-sage px-3 py-2 text-sm">
                    <p className="font-semibold">Disesuaikan karena:</p>
                    <ul className="list-disc pl-5">
                      {step.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <ReferenceList references={resolveReferences(step.evidenceIds, EVIDENCE_SOURCES)} />
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        Panduan ini bersifat umum dan bukan diagnosis atau penilaian risiko medis. Jawabanmu tidak disimpan.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            goToStep(steps[0]);
            router.push("/personalisasi");
          }}
        >
          <Pencil aria-hidden="true" />
          Ubah Jawaban
        </Button>
        <ConfirmDialog
          trigger={
            <Button>
              <CircleCheck aria-hidden="true" />
              Selesai
            </Button>
          }
          title="Selesai melihat panduan?"
          description="Jawaban personalisasimu akan dihapus dari sesi ini dan tidak disimpan sebagai riwayat."
          confirmLabel="Selesai"
          onConfirm={finish}
        />
      </div>
    </div>
  );
}

function shortLabel(code) {
  return {
    "P-00": "Kondisi yang dipertimbangkan",
    "P-01": "Rencana aktivitas",
    "P-02": "Perkiraan di luar ruangan",
    "P-03": "Sumber daya tersedia",
    "PM-01": "Status menstruasi",
    "PM-02": "Kebutuhan praktis",
    "PS-01": "Rencana menyusui/memompa ASI",
    "PS-02": "Kebutuhan menyusui",
  }[code] ?? PERSONALIZATION_QUESTIONS[code].question;
}
