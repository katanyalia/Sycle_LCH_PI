import { CalendarDays, Clock, MapPin } from "lucide-react";
import { RECORD_NOTES } from "@/lib/tracker/record";

// WF-06 screen 56/57 — isi catatan tersimpan. Menerima hasil buildRecordView (sama dengan isi PDF).
export function RecordDetail({ view }) {
  return (
    <div className="space-y-6">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-primary-pressed" aria-hidden="true" />
          Dicatat {view.timeText}
        </span>
        <span>Konteks: {view.contextLabel}</span>
      </p>

      <section aria-labelledby="judul-jawaban" className="rounded-xl border bg-card">
        <h2 id="judul-jawaban" className="border-b px-4 py-3 text-lg font-semibold">Jawaban catatan</h2>
        <dl className="divide-y">
          {view.answers.map((answer) => (
            <div key={answer.code} className="space-y-1 p-4">
              <dt className="text-sm text-muted-foreground">{answer.label}</dt>
              <dd className="whitespace-pre-line font-semibold break-words">{answer.text}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">{RECORD_NOTES.scale}</p>
      </section>

      <RecordEnvironment environment={view.environment} />

      <p className="rounded-lg bg-lavender px-3 py-2 text-sm">{RECORD_NOTES.noAi}</p>
    </div>
  );
}

export function RecordEnvironment({ environment }) {
  return (
    <section aria-labelledby="judul-lingkungan" className="space-y-3">
      <h2 id="judul-lingkungan" className="text-lg font-semibold">Kondisi lingkungan saat pencatatan</h2>
      {environment ? (
        <div className="space-y-4 rounded-xl border bg-powder p-4">
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-1.5 font-semibold">
              <MapPin className="size-4 text-primary-pressed" aria-hidden="true" />
              {environment.locationLabel}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary-pressed" aria-hidden="true" />
              Data diambil {environment.capturedText}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {environment.indicators.map((ind) => (
              <li key={ind.id} className="space-y-1.5 rounded-lg border bg-card p-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {ind.label}
                  {ind.standard && <span className="font-semibold text-foreground"> · {ind.standard}</span>}
                </p>
                <p className="text-2xl font-bold tracking-tight">{ind.valueText}</p>
                {ind.category && (
                  <span className="inline-block rounded-full border bg-card px-2.5 py-0.5 text-sm font-semibold">{ind.category}</span>
                )}
                <p className="text-xs text-muted-foreground">
                  Sumber: {ind.source}
                  {ind.dataTypeLabel && ` · ${ind.dataTypeLabel}`} · waktu data {ind.timeText}
                </p>
                {ind.isFallback && (
                  <span className="inline-block rounded-full bg-powder px-2 py-0.5 text-xs font-semibold">Data cadangan</span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-sm">{RECORD_NOTES.environment}</p>
        </div>
      ) : (
        <p className="rounded-xl border bg-card p-4 text-sm">{RECORD_NOTES.noEnvironment}</p>
      )}
    </section>
  );
}
