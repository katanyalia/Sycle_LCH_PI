"use client";

import {
  Activity,
  Baby,
  ClipboardCheck,
  HeartPulse,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { HEALTH_TRACKER_SCALE } from "@/data/healthTrackerQuestions";

import {
  getAnswerLabel,
  getInlineScaleQuestion,
  getLabel,
  getValue,
} from "./utils/healthTrackerSummary";

function isAnswered(value) {
  return Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== null && value !== "";
}

function getScaleLabel(value) {
  const option = HEALTH_TRACKER_SCALE.find(
    (item) => String(getValue(item)) === String(value)
  );

  return option ? getLabel(option) : "Belum diisi";
}

function formatCapturedAt(value) {
  if (!value) return "Waktu tidak tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Waktu tidak tersedia";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function EnvironmentIndicator({ item }) {
  if (!item) return null;

  const sourceName =
    typeof item.source === "string"
      ? item.source
      : item.source?.name;

  const isUnavailable = item.status === "unavailable";

  return (
    <div className="rounded-xl border border-[#E9F2EA] bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#365541]">
            {item.label}
          </p>

          {isUnavailable ? (
            <p className="mt-1 text-xs text-[#8A7B87]">
              {item.message || "Data belum tersedia."}
            </p>
          ) : (
            <>
              <p className="mt-1 text-lg font-bold text-[#332A35]">
                {typeof item.value === "number"
                  ? item.value.toLocaleString("id-ID", {
                      maximumFractionDigits: 1,
                    })
                  : item.value}{" "}
                {item.unit}
              </p>

              {item.category?.label && (
                <p className="mt-1 text-xs font-medium text-[#52745A]">
                  {item.category.label}
                </p>
              )}
            </>
          )}
        </div>

        {item.status === "stale" && (
          <span className="rounded-full bg-[#FFF3DF] px-2 py-1 text-xs text-[#946B2D]">
            Data lama
          </span>
        )}
      </div>

      {!isUnavailable && (
        <div className="mt-2 space-y-1 text-xs text-[#8A7B87]">
          {sourceName && (
            <p>Sumber: {sourceName}</p>
          )}

          {item.dataType && (
            <p>Jenis data: {item.dataType}</p>
          )}

          {item.timeNote && (
            <p>{item.timeNote}</p>
          )}
        </div>
      )}

      {item.isFallback && item.fallbackReason && (
        <p className="mt-2 rounded-lg bg-[#FFF8FB] p-2 text-xs leading-5 text-[#746875]">
          {item.fallbackReason}
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  children,
  color = "pink",
}) {
  const styles = {
    pink: {
      border: "border-[#F0E3E9]",
      iconBg: "bg-[#F8E8EF]",
      icon: "text-[#B84E73]",
      title: "text-[#8E3E5E]",
      content: "text-[#5F5360]",
    },
    sage: {
      border: "border-[#D7E6D9]",
      iconBg: "bg-[#E9F2EA]",
      icon: "text-[#52745A]",
      title: "text-[#365541]",
      content: "text-[#526A59]",
    },
  };

  const style = styles[color];

  return (
    <article
      className={`rounded-2xl border ${style.border} bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90_/_4%)]`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg} ${style.icon}`}
        >
          <Icon size={21} />
        </div>

        <h3 className={`text-sm font-bold ${style.title}`}>
          {title}
        </h3>
      </div>

      <div
        className={`space-y-3 text-sm leading-relaxed ${style.content}`}
      >
        {children}
      </div>
    </article>
  );
}

function SummaryItem({
  question,
  answers,
  scores,
  condition,
}) {
  const value = answers[question.code];

  if (!isAnswered(value)) return null;

  const scaleQuestion = getInlineScaleQuestion(
    question,
    condition
  );

  const selectedOptions =
    scaleQuestion && Array.isArray(value)
      ? value.filter(
          (item) =>
            ![
              "lainnya",
              "tidak_ada",
              "tidak_ada_yang_ingin_dicatat",
            ].includes(item)
        )
      : [];

  const hasOther =
    question.otherText &&
    Array.isArray(value) &&
    value.includes("lainnya");

  return (
    <div>
      <p className="font-semibold text-[#332A35]">
        {question.question}
      </p>

      {question.type === "scale" ? (
        <p className="mt-1 font-semibold text-[#8E3E5E]">
          {getScaleLabel(value)}
        </p>
      ) : (
        <p className="mt-1">
          {getAnswerLabel(question, answers)}
        </p>
      )}

      {/* Keterangan lainnya */}
      {hasOther && (
        <p className="mt-2 rounded-lg bg-[#FFF8FB] p-3">
          <span className="font-semibold">Keterangan:</span>{" "}
          {answers[question.otherText.key] || "Belum diisi"}
        </p>
      )}

      {/* Tingkat gangguan per pilihan */}
      {selectedOptions.length > 0 && (
        <div className="mt-3 space-y-2 rounded-lg bg-[#FFF8FB] p-3">
          {selectedOptions.map((optionCode) => {
            const option = question.options?.find(
              (item) => getValue(item) === optionCode
            );

            const score = scores?.[optionCode];

            return (
              <div
                key={optionCode}
                className="flex flex-wrap justify-between gap-2"
              >
                <span>
                  {getLabel(option) || optionCode}
                </span>

                <span className="font-semibold text-[#8E3E5E]">
                  {isAnswered(score)
                    ? getScaleLabel(score)
                    : "Tingkat gangguan belum diisi"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SummaryScreen({
  conditionLabel,
  summaryQuestions = [],
  answers = {},
  scores = {},
  condition,
  story = "",
  snapshot = null,
}) {
  const activityQuestions = summaryQuestions.filter(
    (question) =>
      ["HT-04", "HT-05"].includes(question.code)
  );

  const bodyQuestions = summaryQuestions.filter(
    (question) =>
      ["HT-01", "HT-02"].includes(question.code)
  );

  const contextQuestions = summaryQuestions.filter(
    (question) =>
      ["HM-", "HK-", "HS-"].some((prefix) =>
        question.code.startsWith(prefix)
      )
  );

  const answeredActivity = activityQuestions.filter(
    (question) => isAnswered(answers[question.code])
  );

  const answeredBody = bodyQuestions.filter(
    (question) => isAnswered(answers[question.code])
  );

  const answeredContext = contextQuestions.filter(
    (question) => isAnswered(answers[question.code])
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold tracking-wide text-[#8E3E5E]">
          <ClipboardCheck size={15} />
          CHECK-IN SELESAI
        </div>

        <h2 className="text-xl font-bold text-[#332A35]">
          Gambaran Check-In Hari Ini
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#746875]">
          Berikut gambaran aktivitas, kondisi tubuh, dan pengalaman
          yang kamu catat hari ini.
        </p>
      </div>

            {/* Konteks lingkungan */}
      <SummaryCard
        icon={MapPin}
        title="Konteks Lingkungan"
        color="sage"
      >
        {snapshot ? (
          <>
            <div>
              <p className="font-semibold text-[#365541]">
                {snapshot.location_label || "Lokasi tidak tersedia"}
              </p>
              <p className="text-xs text-[#8A7B87]">
                {formatCapturedAt(snapshot.captured_at)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Suhu", "temperature"],
                ["Kelembapan", "humidity"],
                ["Heat Index", "heatIndex"],
                ["Kualitas Udara", "airQuality"],
                ["Indeks UV", "uv"],
              ].map(([label, key]) => {
                const item = snapshot.indicators?.[key];

                return (
                  <div
                    key={key}
                    className="rounded-xl bg-[#F5F8F5] p-3"
                  >
                    <p className="text-xs text-[#52745A]">
                      {label}
                    </p>

                    <p className="mt-1 font-bold text-[#365541]">
                      {item?.status === "unavailable"
                        ? "Tidak tersedia"
                        : item?.value != null
                          ? `${item.value} ${item.unit || ""}`
                          : "Tidak tersedia"}
                    </p>

                    {item?.category?.label && (
                      <p className="mt-1 text-xs text-[#746875]">
                        {item.category.label}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs leading-5 text-[#52745A]">
              Data lingkungan merupakan konteks pendukung, bukan
              diagnosis kesehatan.
            </p>
          </>
        ) : (
          <p>
            Data lingkungan tidak tersedia pada check-in ini.
          </p>
        )}
      </SummaryCard>

      {/* Aktivitas */}
      {answeredActivity.length > 0 && (
        <SummaryCard
          icon={Activity}
          title="Aktivitas Hari Ini"
        >
          {answeredActivity.map((question) => (
            <SummaryItem
              key={question.code}
              question={question}
              answers={answers}
              scores={scores}
              condition={condition}
            />
          ))}
        </SummaryCard>
      )}

      {/* Kondisi tubuh */}
      {answeredBody.length > 0 && (
        <SummaryCard
          icon={HeartPulse}
          title="Kondisi Tubuh"
        >
          {answeredBody.map((question) => (
            <SummaryItem
              key={question.code}
              question={question}
              answers={answers}
              scores={scores}
              condition={condition}
            />
          ))}
        </SummaryCard>
      )}

      {/* Konteks tubuh */}
      <SummaryCard
        icon={Baby}
        title={`Konteks Tubuh${conditionLabel ? ` · ${conditionLabel}` : ""}`}
      >
        {answeredContext.length > 0 ? (
          answeredContext.map((question) => (
            <SummaryItem
              key={question.code}
              question={question}
              answers={answers}
              scores={scores}
              condition={condition}
            />
          ))
        ) : (
          <p>
            Belum ada informasi konteks tubuh yang dicatat pada
            check-in ini.
          </p>
        )}
      </SummaryCard>

      {/* Cerita pribadi */}
      <SummaryCard
        icon={MessageCircle}
        title="Cerita Pribadi"
      >
        {story.trim() ? (
          <p className="whitespace-pre-wrap">
            {story}
          </p>
        ) : (
          <p>
            Kamu tidak menambahkan cerita pada check-in ini.
          </p>
        )}
      </SummaryCard>
    </section>
  );
}