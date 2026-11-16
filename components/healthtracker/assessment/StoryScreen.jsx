"use client";

import {
  MessageCircleHeart,
  Heart,
  ShieldCheck,
} from "lucide-react";

const MAX_LENGTH = 2000;

export default function StoryScreen({
  story = "",
  setStory = () => {},
}) {
  const handleStoryChange = (event) => {
    setStory(event.target.value);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-extrabold tracking-wide text-[#8E3E5E]">
          <MessageCircleHeart size={15} />
          TAHAP 05 · CERITA HARI INI
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-[#332A35] sm:text-2xl">
          Ada cerita lain yang ingin kamu sampaikan?
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#746875] sm:text-base">
          Setiap pengalaman tubuh punya cerita. Kamu bisa
          menceritakan perubahan yang dirasakan, pengalaman
          sehari-hari, atau hal lain yang menurutmu penting.
        </p>
      </div>

      {/* Story input */}
      <div className="rounded-2xl border border-[#F0E3E9] bg-white p-4 shadow-[0_5px_24px_rgb(120_70_90_/_4%)] sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
            <Heart size={21} />
          </div>

          <div>
            <label
              htmlFor="assessment-story"
              className="block text-sm font-bold text-[#332A35]"
            >
              Ceritamu
            </label>

            <span className="text-xs text-[#8A7E8C]">
              Bagian ini opsional
            </span>
          </div>
        </div>

        <textarea
          id="assessment-story"
          value={story}
          onChange={handleStoryChange}
          maxLength={MAX_LENGTH}
          rows={8}
          placeholder="Tuliskan pengalaman atau hal yang ingin kamu ceritakan di sini..."
          className="w-full resize-y rounded-xl border border-[#E8DDE5] bg-[#FFF8FB]/70 px-4 py-4 text-sm leading-7 text-[#332A35] outline-none transition placeholder:text-[#AA9EAA] focus:border-[#B84E73] focus:bg-white focus:ring-2 focus:ring-[#B84E73]/10"
        />

        <div className="mt-3 flex items-start justify-between gap-3">
          <p className="text-xs leading-5 text-[#8A7E8C]">
            Ceritakan hanya hal yang nyaman untuk kamu bagikan.
          </p>

          <span
            className={`shrink-0 text-xs font-medium ${
              story.length >= MAX_LENGTH
                ? "text-[#B84E73]"
                : "text-[#8A7E8C]"
            }`}
          >
            {story.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Privacy information */}
      <div className="rounded-2xl border border-[#D7E6D9] bg-[#E9F2EA]/70 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#52745A]">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#365541]">
              Privasimu tetap penting
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-[#526A59]">
              Cerita ini tidak otomatis dikirim ke AI atau
              disimpan ke riwayat. Kamu akan mendapat pilihan
              sebelum melanjutkan ke proses berikutnya.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}