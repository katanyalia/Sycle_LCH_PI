"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  LoaderCircle,
  MapPin,
  Clock3,
  Heart,
  Footprints,
  MessageCircle,
  CloudSun,
  AlertCircle,
} from "lucide-react";

import { getTrackerHistoryDetail } from "@/app/healthtracker/history/actions";
import {
  HEALTH_TRACKER_QUESTIONS,
  HEALTH_TRACKER_SCALE,
} from "@/data/healthTrackerQuestions";

const SINGLE_ANSWER_FIELDS = {
  "HT-01": "ht01_comfort",
  "HT-04": "ht04_activity_location",
  "HT-05": "ht05_outdoor",
  "HM-01": "hm01_menstruating",
  "HM-02": "hm02_day",
  "HM-03": "hm03_flow",
  "HM-04": "hm04_pain",
  "HM-05": "hm05_pain_disruption",
  "HM-06": "hm06_toilet_access",
  "HS-01": "hs01_breastfeeding",
  "HS-02": "hs02_discomfort",
  "HS-03": "hs03_disruption",
};

const MULTIPLE_ANSWER_FIELDS = {
  "HT-02": "ht02_other_text",
  "HK-01": "hk01_other_text",
  "HS-04": "hs04_other_text",
};

const CONDITION_QUESTIONS = {
  menstruasi: ["HM-01", "HM-02", "HM-03", "HM-04", "HM-05", "HM-06"],
  kehamilan: ["HK-01"],
  menyusui: ["HS-01", "HS-02", "HS-03", "HS-04"],
  lewati: [],
};

const CONDITION_LABELS = {
  menstruasi: "Menstruasi",
  kehamilan: "Hamil",
  menyusui: "Menyusui",
  lewati: "Catatan umum",
};

function getQuestion(code) {
  return HEALTH_TRACKER_QUESTIONS?.[code] ?? null;
}

function getQuestionLabel(code) {
  return getQuestion(code)?.question ?? "Informasi Check-In";
}

function getOptionLabel(code, value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const question = getQuestion(code);

  const option = question?.options?.find(
    (item) => item.value === value
  );

  return option?.label ?? String(value).replaceAll("_", " ");
}

function getScaleLabel(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  if (Array.isArray(HEALTH_TRACKER_SCALE)) {
    const scaleItem = HEALTH_TRACKER_SCALE.find(
      (item, index) => {
        if (typeof item === "string") {
          return index === numericValue;
        }

        return (
          Number(item?.value) === numericValue ||
          index === numericValue
        );
      }
    );

    if (typeof scaleItem === "string") {
      return scaleItem;
    }

    if (scaleItem?.label) {
      return scaleItem.label;
    }
  }

  if (
    HEALTH_TRACKER_SCALE &&
    !Array.isArray(HEALTH_TRACKER_SCALE)
  ) {
    const scaleItem = HEALTH_TRACKER_SCALE[numericValue];

    if (typeof scaleItem === "string") {
      return scaleItem;
    }

    if (scaleItem?.label) {
      return scaleItem.label;
    }
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatIndicatorName(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function AnswerRow({ code, record }) {
  const field = SINGLE_ANSWER_FIELDS[code];
  const value = field ? record?.[field] : null;

  if (!hasValue(value)) return null;

  const label =
    code === "HM-05" || code === "HS-03"
      ? getScaleLabel(value)
      : getOptionLabel(code, value);

  return (
    <div className="rounded-xl bg-[#F8F5F8] p-3.5">
      <p className="text-xs leading-5 text-[#8A7D89]">
        {getQuestionLabel(code)}
      </p>

      <p className="mt-1 text-sm font-semibold leading-6 text-[#332A35]">
        {label}
      </p>
    </div>
  );
}

function MultipleAnswerRow({ code, items = [], otherText }) {
  const selectedItems = items.filter(
    (item) => item.question_code === code
  );

  if (selectedItems.length === 0 && !otherText) {
    return null;
  }

  return (
    <div className="rounded-xl bg-[#F8F5F8] p-3.5">
      <p className="text-xs leading-5 text-[#8A7D89]">
        {getQuestionLabel(code)}
      </p>

      {selectedItems.length > 0 && (
        <div className="mt-2 space-y-2">
          {selectedItems.map((item, index) => (
            <div
              key={`${item.option_code}-${index}`}
              className="rounded-lg bg-white px-3 py-2.5"
            >
              <p className="text-sm font-semibold text-[#332A35]">
                {getOptionLabel(code, item.option_code)}
              </p>

              {hasValue(item.disruption_level) && (
                <p className="mt-1 text-xs text-[#8A7D89]">
                  Tingkat gangguan:{" "}
                  <span className="font-semibold text-[#B84E73]">
                    {getScaleLabel(item.disruption_level)}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {otherText && (
        <div className="mt-3 rounded-lg border border-[#E8DCE3] bg-white p-3">
          <p className="text-xs text-[#8A7D89]">
            Keterangan lainnya
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#5F5660]">
            {otherText}
          </p>
        </div>
      )}
    </div>
  );
}

function AnswerSection({ record, items = [] }) {
  const condition = record.context;
  const conditionQuestions = CONDITION_QUESTIONS[condition] ?? [];

  const hasGeneralAnswers = Boolean(
    record.ht01_comfort ||
    record.ht02_other_text ||
    record.ht04_activity_location ||
    record.ht05_outdoor ||
    items.some((item) => item.question_code === "HT-02")
  );

  const hasConditionAnswers = Boolean(
    conditionQuestions.some((code) => {
      const field =
        SINGLE_ANSWER_FIELDS[code] ??
        MULTIPLE_ANSWER_FIELDS[code];

      return field && hasValue(record[field]);
    }) ||
    items.some((item) =>
      conditionQuestions.includes(item.question_code)
    )
  );

  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#332A35]">
          <Heart size={17} className="text-[#B84E73]" />
          Pertanyaan umum
        </h3>

        {hasGeneralAnswers ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <AnswerRow code="HT-01" record={record} />

            <MultipleAnswerRow
              code="HT-02"
              items={items}
              otherText={record.ht02_other_text}
            />

            <AnswerRow code="HT-04" record={record} />
            <AnswerRow code="HT-05" record={record} />
          </div>
        ) : (
          <p className="rounded-xl bg-[#F8F5F8] p-3.5 text-sm text-[#817582]">
            Pertanyaan umum dilewati.
          </p>
        )}
      </section>

      {condition !== "lewati" && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#332A35]">
            <Footprints size={17} className="text-[#B84E73]" />
            Pertanyaan lanjutan
          </h3>

          {hasConditionAnswers ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {conditionQuestions.map((code) => {
                if (
                  code === "HK-01" ||
                  code === "HS-04"
                ) {
                  return (
                    <MultipleAnswerRow
                      key={code}
                      code={code}
                      items={items}
                      otherText={
                        record[MULTIPLE_ANSWER_FIELDS[code]]
                      }
                    />
                  );
                }

                return (
                  <AnswerRow
                    key={code}
                    code={code}
                    record={record}
                  />
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-[#F8F5F8] p-3.5 text-sm text-[#817582]">
              Pertanyaan lanjutan dilewati.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function EnvironmentSection({ snapshot }) {
  if (!snapshot) {
    return (
      <section className="rounded-2xl border border-dashed border-[#E8DCE3] p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#6F6570]">
          <CloudSun size={18} className="text-[#B84E73]" />
          Konteks lingkungan
        </div>

        <p className="mt-2 text-sm text-[#817582]">
          Tidak ada snapshot lingkungan yang tersimpan untuk Check-In ini.
        </p>
      </section>
    );
  }

  const indicators = snapshot.indicators;

  const indicatorEntries = Array.isArray(indicators)
    ? indicators.map((item, index) => [
        item?.name ?? item?.key ?? `Indikator ${index + 1}`,
        item,
      ])
    : Object.entries(indicators ?? {});

  return (
    <section className="rounded-2xl border border-[#E9F2EA] bg-[#F7FAF7] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-extrabold text-[#52745A]">
        <CloudSun size={18} />
        Konteks lingkungan
      </div>

      <div className="mt-3 flex items-start gap-2">
        <MapPin
          size={16}
          className="mt-0.5 shrink-0 text-[#66836B]"
        />

        <div>
          <p className="text-xs text-[#7B897D]">Lokasi</p>

          <p className="mt-0.5 text-sm font-semibold text-[#435A47]">
            {snapshot.location_label || "Lokasi tidak tersedia"}
          </p>
        </div>
      </div>

      {snapshot.captured_at && (
        <div className="mt-3 flex items-start gap-2">
          <Clock3
            size={16}
            className="mt-0.5 shrink-0 text-[#66836B]"
          />

          <div>
            <p className="text-xs text-[#7B897D]">
              Waktu pengambilan data
            </p>

            <p className="mt-0.5 text-sm text-[#435A47]">
              {formatDate(snapshot.captured_at)}
            </p>
          </div>
        </div>
      )}

      {indicatorEntries.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {indicatorEntries.map(([key, item]) => {
            const value =
              item && typeof item === "object"
                ? item.value ?? item.label ?? item.status ?? null
                : item;

            const unit =
              item && typeof item === "object"
                ? item.unit
                : null;

            const source =
              item && typeof item === "object"
                ? item.source
                : null;

            if (!hasValue(value)) return null;

            return (
              <div
                key={key}
                className="rounded-xl border border-[#E5EEE6] bg-white p-3"
              >
                <p className="text-xs text-[#7B897D]">
                  {formatIndicatorName(key)}
                </p>

                <p className="mt-1 text-sm font-bold text-[#435A47]">
                  {String(value)}
                  {unit ? ` ${unit}` : ""}
                </p>

                {source && (
                  <p className="mt-1 text-[11px] text-[#8A978C]">
                    Sumber: {source}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-[#718174]">
        Informasi lingkungan merupakan konteks pendukung untuk memahami
        pengalaman harian, bukan diagnosis medis.
      </p>
    </section>
  );
}

export default function HistoryEntryDetail({
  recordId,
  open,
  onClose,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!recordId) return;

    try {
        setLoading(true);
        setError("");
        setDetail(null);

        const result = await getTrackerHistoryDetail(recordId);

        if (!result?.ok) {
        setError(result?.message || "Detail catatan gagal dimuat.");
        return;
        }

        setDetail(result);
    } catch (error) {
        console.error("Gagal memuat detail riwayat:", error);
        setError("Terjadi kesalahan saat memuat detail catatan.");
    } finally {
        setLoading(false);
    }
    }, [recordId]);

    useEffect(() => {
    if (!open || !recordId) return;

    let cancelled = false;

    const fetchDetail = async () => {
        try {
        setLoading(true);
        setError("");
        setDetail(null);

        const result = await getTrackerHistoryDetail(recordId);

        if (cancelled) return;

        if (!result?.ok) {
            setError(result?.message || "Detail catatan gagal dimuat.");
            return;
        }

        setDetail(result);
        } catch (error) {
        if (cancelled) return;

        console.error("Gagal memuat detail riwayat:", error);
        setError("Terjadi kesalahan saat memuat detail catatan.");
        } finally {
        if (!cancelled) {
            setLoading(false);
        }
        }
    };

    fetchDetail();

    return () => {
        cancelled = true;
    };
    }, [open, recordId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-[#332A35]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-detail-title"
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[26px] bg-[#FFF8FB] shadow-2xl sm:rounded-[26px]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[#F0DFE7] bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold text-[#B84E73]">
              Health Tracker
            </p>

            <h2
              id="history-detail-title"
              className="mt-1 text-lg font-extrabold text-[#332A35]"
            >
              Detail Check-In
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8E8EF] text-[#B84E73] transition hover:bg-[#F1DCE5]"
          >
            <X size={19} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#8A6578]">
              <LoaderCircle
                size={28}
                className="animate-spin"
              />

              <p className="text-sm">
                Memuat detail Check-In...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-[#F0D6A8] bg-[#FFF4E5] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#7A4B00]">
                <AlertCircle size={18} />
                Detail belum tersedia
              </div>

              <p className="mt-2 text-sm leading-6 text-[#7A4B00]">
                {error}
              </p>

              <button
                type="button"
                onClick={loadDetail}
                className="mt-3 rounded-full bg-[#B84E73] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#8E3E5E]"
              >
                Coba lagi
              </button>
            </div>
          )}

          {!loading && detail && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#F0DFE7] bg-white p-4">
                <span className="rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold text-[#B84E73]">
                  {CONDITION_LABELS[detail.record.context] ??
                    detail.record.context ??
                    "Catatan umum"}
                </span>

                <p className="mt-3 text-xs text-[#8A7D89]">
                  Waktu Check-In
                </p>

                <p className="mt-1 text-sm font-semibold text-[#332A35]">
                  {formatDate(detail.record.recorded_at)}
                </p>
              </section>

              <AnswerSection
                record={detail.record}
                items={detail.items ?? []}
              />

              {detail.record.story && (
                <section className="rounded-2xl border border-[#E9F2EA] bg-[#F7FAF7] p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#52745A]">
                    <MessageCircle size={17} />
                    Cerita harian
                  </h3>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5F5660]">
                    {detail.record.story}
                  </p>
                </section>
              )}

              <EnvironmentSection snapshot={detail.snapshot} />

              {detail.snapshotWarning && (
                <p className="text-xs text-[#8A7D89]">
                  {detail.snapshotWarning}
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-[#F0DFE7] bg-white px-5 py-3 text-right sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#E8C9D5] px-5 py-2.5 text-xs font-bold text-[#B84E73] transition hover:bg-[#FFF8FB]"
          >
            Tutup
          </button>
        </footer>
      </section>
    </div>
  );
}