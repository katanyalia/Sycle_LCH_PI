"use client";

import {
  ChevronDown,
  Info,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import SummaryScreen from "./SummaryScreen";
import ReflectionResult from "./Reflectionresult";
import SummaryText from "./shared/SummaryText";

function SummaryCard({ icon: Icon, title, children }) {
  return (
    <article className="rounded-2xl border border-[#EAD9F0] bg-[#FAF7FC] p-5 shadow-[0_5px_24px_rgb(120_70_90_/_4%)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F0E8F5] text-[#76558A]">
          <Icon size={21} />
        </div>

        <h3 className="text-sm font-bold text-[#76558A]">
          {title}
        </h3>
      </div>

      <div className="text-sm leading-relaxed text-[#5F5360]">
        {children}
      </div>
    </article>
  );
}

export default function AISummaryScreen({
  conditionLabel,
  summaryQuestions = [],
  answers = {},
  scores = {},
  condition,
  story = "",
  snapshot = null,
  aiNotice = {},
  generatedSummary = null,
}) {
  const messages = aiNotice ?? {};
  // Ringkasan tanpa AI hanya tampil sebagai cadangan jika Refleksi AI gagal.
  const aiReady = messages.status === "answer" && Boolean(messages.answer);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold tracking-wide text-[#8E3E5E]">
          <Sparkles size={15} />
          REFLEKSI AI
        </div>

        <h2 className="text-xl font-bold text-[#332A35]">
          Ringkasan &amp; Refleksi
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#746875]">
          Gambaran kondisi, konteks lingkungan, dan saran yang disusun AI dari
          catatanmu hari ini.
        </p>
      </div>

      {aiReady ? (
        <SummaryCard icon={MessageCircleHeart} title="Hasil Refleksi AI">
          <ReflectionResult data={messages} />
        </SummaryCard>
      ) : (
        <>
          <div className="flex items-start gap-3 rounded-2xl border border-[#F1E1C7] bg-[#FFF8EC] p-4 text-sm leading-6 text-[#7A5A2E]">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p>
              {messages.answer ||
                "Refleksi AI belum tersedia saat ini. Ringkasan tanpa AI tetap bisa kamu simpan."}
            </p>
          </div>

          {generatedSummary?.intro && (
            <SummaryCard icon={MessageCircleHeart} title="Ringkasan catatanmu">
              <p className="leading-7">
                <SummaryText text={generatedSummary.intro} />
              </p>
            </SummaryCard>
          )}
        </>
      )}

      {/* Jawaban asli check-in tetap bisa dibuka */}
      <details className="group rounded-2xl border border-[#EAD8E0] bg-white p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#8E3E5E]">
          Lihat jawaban check-in
          <ChevronDown
            size={18}
            className="transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="mt-4">
          <SummaryScreen
            conditionLabel={conditionLabel}
            summaryQuestions={summaryQuestions}
            answers={answers}
            scores={scores}
            condition={condition}
            story={story}
            snapshot={snapshot}
            showHeader={false}
          />
        </div>
      </details>

      {/* Catatan Penting */}
      <div className="rounded-2xl border border-[#D7E6D9] bg-[#E9F2EA] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#52745A]"
          />

          <div>
            <p className="text-sm font-bold text-[#365541]">
              Catatan Penting
            </p>

            <p className="mt-1 text-xs leading-5 text-[#526A59]">
              Refleksi AI merupakan informasi pendukung untuk membantu memahami
              pengalaman tubuh dan konteks lingkungan. Hasil ini bukan diagnosis
              atau pengganti konsultasi tenaga kesehatan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}