"use client";

import {
  ClipboardCheck,
  HeartPulse,
  Activity,
  ThermometerSun,
  Baby,
  MessageCircleHeart,
  ShieldCheck,
} from "lucide-react";

function ReviewCard({
  icon: Icon,
  title,
  description,
  children,
  variant = "pink",
}) {
  const styles = {
    pink: {
      border: "border-[#F0E3E9]",
      background: "bg-[#FFF8FB]",
      icon: "bg-[#F8E8EF] text-[#B84E73]",
      label: "text-[#B84E73]",
    },
    sage: {
      border: "border-[#D7E6D9]",
      background: "bg-[#F5FAF5]",
      icon: "bg-[#E9F2EA] text-[#52775A]",
      label: "text-[#52775A]",
    },
    purple: {
      border: "border-[#E5DFF2]",
      background: "bg-[#F8F6FC]",
      icon: "bg-[#EEEAF8] text-[#77649B]",
      label: "text-[#77649B]",
    },
  };

  const style = styles[variant];

  return (
    <section
      className={`rounded-2xl border ${style.border} ${style.background} p-5`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={21} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#332A35]">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-xs leading-relaxed text-[#817480]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function ReviewScreen({
  conditionLabel,
  summaryQuestions = [],
  renderSummaryItem,
  story = "",
}) {
  const activityQuestions = summaryQuestions.filter((question) =>
    ["HT-04", "HT-05"].includes(question.code)
  );

  const bodyQuestions = summaryQuestions.filter((question) =>
    ["HT-01", "HT-02"].includes(question.code)
  );

  const contextQuestions = summaryQuestions.filter((question) =>
    ["HM-", "HK-", "HS-"].some((prefix) =>
      question.code?.startsWith(prefix)
    )
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold tracking-wide text-[#8E3E5E]">
          <ClipboardCheck size={14} />
          TINJAUAN CHECK-IN
        </div>

        <h2 className="text-xl font-bold text-[#332A35]">
          Ringkasan Check-In Kamu
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#746875]">
          Berikut gambaran aktivitas dan kondisi yang kamu catat
          hari ini. Periksa kembali sebelum melanjutkan.
        </p>
      </div>

      {/* Kondisi yang dicatat */}
      <ReviewCard
        icon={HeartPulse}
        title="Konteks Tubuh"
        description="Konteks yang kamu pilih saat check-in"
        variant="pink"
      >
        <p className="text-base font-bold text-[#332A35]">
          {conditionLabel || "Tidak disebutkan"}
        </p>
      </ReviewCard>

      {/* Aktivitas */}
      {activityQuestions.length > 0 && (
        <ReviewCard
          icon={Activity}
          title="Aktivitas Hari Ini"
          description="Aktivitas dan paparan luar ruangan yang kamu alami"
          variant="sage"
        >
          {activityQuestions.map((question) =>
            renderSummaryItem(question)
          )}
        </ReviewCard>
      )}

      {/* Kondisi tubuh */}
      {bodyQuestions.length > 0 && (
        <ReviewCard
          icon={ThermometerSun}
          title="Kondisi Tubuh"
          description="Kenyamanan dan hal-hal yang kamu rasakan hari ini"
          variant="pink"
        >
          {bodyQuestions.map((question) =>
            renderSummaryItem(question)
          )}
        </ReviewCard>
      )}

      {/* Konteks menstruasi, kehamilan, atau menyusui */}
      {contextQuestions.length > 0 && (
        <ReviewCard
          icon={Baby}
          title="Catatan Konteks Keseharian"
          description="Informasi tambahan sesuai konteks tubuh yang kamu pilih"
          variant="purple"
        >
          {contextQuestions.map((question) =>
            renderSummaryItem(question)
          )}
        </ReviewCard>
      )}

      {/* Cerita pengguna */}
      <ReviewCard
        icon={MessageCircleHeart}
        title="Cerita Hari Ini"
        description="Catatan pribadi yang ingin kamu bagikan"
        variant="pink"
      >
        {story.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#5F5360]">
            {story}
          </p>
        ) : (
          <p className="rounded-xl bg-white/80 p-4 text-sm leading-relaxed text-[#8A7D89]">
            Kamu tidak menambahkan cerita hari ini.
          </p>
        )}
      </ReviewCard>

      {/* Catatan privasi dan informasi */}
      <div className="flex gap-3 rounded-2xl border border-[#D7E6D9] bg-[#F5FAF5] p-4">
        <ShieldCheck
          size={21}
          className="mt-0.5 shrink-0 text-[#52775A]"
        />

        <p className="text-xs leading-relaxed text-[#607565]">
          Catatan ini membantu kamu memahami pengalaman tubuh
          dalam aktivitas sehari-hari. Informasi lingkungan dan
          jawaban check-in merupakan konteks pemantauan, bukan
          diagnosis medis.
        </p>
      </div>
    </section>
  );
}