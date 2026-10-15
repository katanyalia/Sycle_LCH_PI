"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, History, House, LogOut, MapPin, NotebookPen, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/feedback/StatusMessage";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { IndicatorValue } from "@/components/environment/IndicatorValue";
import { LocationPicker } from "@/components/environment/LocationPicker";
import { formatDataTime } from "@/lib/environment/format";
import { sanitizeEnvironmentSnapshot } from "@/lib/validations/trackerValidation";
import { trackerAnswerText, TRACKER_SHORT_LABEL } from "@/lib/tracker/format";
import { saveTrackerRecordAction } from "@/app/health-tracker/actions";
import { useTrackerDraft } from "@/context/TrackerDraftContext";
import { useEnvironment } from "@/context/EnvironmentContext";
import { useNow } from "@/hooks/useNow";

// WF-05 screen 49 — ringkasan tanpa AI, lalu 50 (konfirmasi simpan) / 52 (selesai tanpa simpan).
export function TrackerSummary() {
  const router = useRouter();
  const { answers, steps, goToStep, markSaved, reset } = useTrackerDraft();
  const { snapshot } = useEnvironment();
  const now = useNow();
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef(null);
  useEffect(() => headingRef.current?.focus(), []);

  // Hanya indikator valid & tidak basi yang ikut (sama dengan aturan server).
  const environment = useMemo(() => (snapshot ? sanitizeEnvironmentSnapshot(snapshot, now) : null), [snapshot, now]);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveTrackerRecordAction({ answers, environment: snapshot });
      if (result.ok) markSaved(result);
      else setError(result.message);
    });
  }

  function finishWithoutSaving() {
    reset();
    router.push("/");
  }

  return (
    <div className="space-y-6">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
        Berikut ringkasan catatan yang kamu isi.
      </h2>

      <section aria-label="Jawaban" className="rounded-xl border bg-card">
        <dl className="divide-y">
          {steps.map((code) => (
            <div key={code} className="space-y-1 p-4">
              <dt className="text-sm text-muted-foreground">{TRACKER_SHORT_LABEL[code]}</dt>
              <dd className="whitespace-pre-line font-semibold">{trackerAnswerText(code, answers)}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">
          Skala gangguan aktivitas ditampilkan apa adanya, tanpa interpretasi klinis dan tanpa dijumlahkan.
        </p>
      </section>

      <section aria-labelledby="judul-lingkungan-catatan" className="space-y-3">
        <h3 id="judul-lingkungan-catatan" className="text-lg font-semibold">Kondisi lingkungan saat pencatatan</h3>
        {environment ? (
          <div className="space-y-3 rounded-xl border bg-powder p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <MapPin className="size-4 text-primary-pressed" aria-hidden="true" />
              {environment.location_label}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {Object.keys(environment.indicators).map((id) => (
                <IndicatorValue key={id} indicator={snapshot.indicators[id]} timezone={snapshot.location.timezone} now={now} />
              ))}
            </div>
            <p className="text-sm">
              Data diambil {formatDataTime(environment.captured_at, snapshot.location.timezone)}. Data ini tidak mewakili
              paparan lingkunganmu sepanjang hari.
            </p>
          </div>
        ) : showPicker ? (
          <LocationPicker initialMode="choose" onDone={() => setShowPicker(false)} onCancel={() => setShowPicker(false)} />
        ) : (
          <StatusMessage
            variant="partial"
            title="Kondisi lingkungan belum tersedia"
            action={
              <Button size="sm" variant="outline" onClick={() => setShowPicker(true)}>
                <MapPin aria-hidden="true" />
                Pilih Lokasi (opsional)
              </Button>
            }
          >
            Catatan tetap bisa disimpan tanpa data lingkungan.
          </StatusMessage>
        )}
      </section>

      <p className="rounded-lg bg-lavender px-3 py-2 text-sm">Tidak ada refleksi AI pada catatan ini.</p>

      {error && (
        <StatusMessage variant="error" title="Catatan belum tersimpan">
          {error}
        </StatusMessage>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => goToStep(steps[0])} disabled={pending}>
          <Pencil aria-hidden="true" />
          Ubah Catatan
        </Button>
        <ConfirmDialog
          trigger={
            <Button disabled={pending}>
              <Save aria-hidden="true" />
              {pending ? "Menyimpan…" : "Simpan Catatan"}
            </Button>
          }
          title="Simpan catatan ini ke Riwayat?"
          description="Catatan hanya dapat dilihat olehmu sebagai pemilik akun. Penyimpanan merupakan tindakan terpisah dari mengisi formulir dan persetujuan AI."
          confirmLabel="Ya, Simpan"
          onConfirm={save}
        />
        <ConfirmDialog
          trigger={
            <Button variant="ghost" disabled={pending}>
              <LogOut aria-hidden="true" />
              Selesai Tanpa Menyimpan
            </Button>
          }
          title="Selesai tanpa menyimpan catatan?"
          description="Jawaban sesi ini tidak akan menjadi riwayat baru dan akan dihapus dari layar. Pilih Batal untuk kembali dan menyimpannya."
          confirmLabel="Selesai Tanpa Menyimpan"
          onConfirm={finishWithoutSaving}
        />
      </div>
    </div>
  );
}

// WF-05 screen 51 — tampil hanya setelah server mengonfirmasi penyimpanan.
export function TrackerSaved() {
  const { saved, reset } = useTrackerDraft();
  return (
    <div className="space-y-4">
      <StatusMessage variant="success" title="Catatanmu berhasil disimpan.">
        Disimpan {formatDataTime(saved?.savedAt)}
        {saved?.withEnvironment ? ", bersama kondisi lingkungan saat pencatatan." : ", tanpa data lingkungan."}
      </StatusMessage>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/health-tracker/riwayat">
            <History aria-hidden="true" />
            Lihat Riwayat
          </Link>
        </Button>
        <Button variant="outline" onClick={reset}>
          <NotebookPen aria-hidden="true" />
          Buat Catatan Baru
        </Button>
        <Button asChild variant="ghost">
          <Link href="/" onClick={reset}>
            <House aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </Button>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CircleCheck className="size-4" aria-hidden="true" />
        PDF dapat diunduh dari detail catatan di Riwayat.
      </p>
    </div>
  );
}
