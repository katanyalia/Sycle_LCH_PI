"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";

const QUESTION_COUNT = 10;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Menyamarkan nama istilah di dalam definisi agar jawabannya tidak terlihat.
function maskTerm(definition, term) {
  const names = [term, term.split(" (")[0], term.match(/\(([^)]+)\)/)?.[1]]
    .filter((name) => name && name.length >= 3)
    .sort((a, b) => b.length - a.length);

  return names.reduce((text, name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(escaped, "gi"), "____");
  }, definition);
}

// Soal dibuat acak dari istilah pada topik terpilih; pilihan jawaban diambil dari seluruh glosarium.
function buildQuestions(terms, allTerms) {
  return shuffle(terms)
    .slice(0, QUESTION_COUNT)
    .map((term) => {
      const distractors = shuffle(
        allTerms.filter((item) => item.id !== term.id)
      ).slice(0, 3);

      return {
        term,
        prompt: maskTerm(term.definition, term.term),
        options: shuffle([term, ...distractors]),
      };
    });
}

// Kuis istilah. Skor tidak disimpan.
export default function GlossaryQuiz({ terms, allTerms }) {
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  function start() {
    setQuestions(buildQuestions(terms, allTerms));
    setCurrent(0);
    setSelected(null);
    setScore(0);
  }

  function choose(option) {
    if (selected) return;
    setSelected(option.id);
    if (option.id === questions[current].term.id) {
      setScore((value) => value + 1);
    }
  }

  function next() {
    setCurrent((value) => value + 1);
    setSelected(null);
  }

  if (terms.length === 0) {
    return (
      <p className="rounded-[22px] border border-dashed border-[#E4CBD7] bg-white p-8 text-center text-sm text-[#827382]">
        Belum ada istilah pada topik ini.
      </p>
    );
  }

  // Layar awal
  if (!questions) {
    return (
      <div className="mx-auto max-w-2xl rounded-[26px] border border-[#F0DFE7] bg-white p-7 text-center shadow-[0_8px_28px_rgb(120_70_90_/_6%)] sm:p-10">
        <Trophy className="mx-auto size-10 text-[#B84E73]" />
        <h3 className="mt-4 text-2xl font-extrabold">Uji pemahamanmu</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#756774]">
          Baca definisinya, lalu pilih istilah yang tepat.{" "}
          {Math.min(QUESTION_COUNT, terms.length)} soal dari topik yang dipilih.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-6 rounded-full bg-[#B84E73] px-6 py-2.5 text-sm font-extrabold text-white hover:bg-[#8E3E5E]"
        >
          Mulai kuis
        </button>
      </div>
    );
  }

  // Layar hasil
  if (current >= questions.length) {
    return (
      <div className="mx-auto max-w-2xl rounded-[26px] border border-[#D6E8D8] bg-[#EDF6EE] p-7 text-center sm:p-10">
        <Trophy className="mx-auto size-10 text-[#427D55]" />
        <h3 className="mt-4 text-2xl font-extrabold">
          Skormu {score} dari {questions.length}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#5E6F61]">
          {score === questions.length
            ? "Hebat, semua jawaban benar!"
            : "Bagus! Ulangi kuis atau pelajari lagi lewat Kartu Belajar."}
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#52775B] px-6 py-2.5 text-sm font-extrabold text-white hover:bg-[#41613F]"
        >
          <RotateCcw className="size-4" />
          Ulangi kuis
        </button>
      </div>
    );
  }

  const question = questions[current];
  const answered = selected !== null;
  const correct = selected === question.term.id;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm text-[#827382]">
        <span>
          Soal{" "}
          <span className="font-extrabold text-[#514351]">{current + 1}</span>{" "}
          dari {questions.length}
        </span>
        <span>
          Skor <span className="font-extrabold text-[#514351]">{score}</span>
        </span>
      </div>

      <div className="rounded-[26px] border border-[#F0DFE7] bg-white p-6 shadow-[0_8px_28px_rgb(120_70_90_/_6%)] sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B84E73]">
          Istilah apa yang dimaksud?
        </p>
        <p className="mt-3 text-base leading-7 text-[#332A35] sm:text-lg sm:leading-8">
          {question.prompt}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => {
            const isAnswer = option.id === question.term.id;
            const isChosen = option.id === selected;

            let style =
              "border-[#E9DCE3] bg-white text-[#514351] hover:border-[#D7A9BC] hover:bg-[#FFF8FB]";
            if (answered && isAnswer) {
              style = "border-[#7FB48B] bg-[#EDF6EE] text-[#2F5A3A]";
            } else if (answered && isChosen) {
              style = "border-[#E3A0A0] bg-[#FDEEEE] text-[#8A3434]";
            } else if (answered) {
              style = "border-[#EFE6EB] bg-white text-[#A3949E]";
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option)}
                disabled={answered}
                className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${style}`}
              >
                {option.term}
                {answered && isAnswer && <CheckCircle2 className="size-5 shrink-0" />}
                {answered && isChosen && !isAnswer && (
                  <XCircle className="size-5 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${
              correct ? "bg-[#EDF6EE] text-[#3F5A45]" : "bg-[#FFF6EC] text-[#6E5236]"
            }`}
            aria-live="polite"
          >
            <p className="font-extrabold">
              {correct ? "Benar!" : `Belum tepat. Jawabannya: ${question.term.term}.`}
            </p>
            <p className="mt-1">{question.term.definition}</p>
          </div>
        )}

        {answered && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-[#B84E73] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#8E3E5E]"
            >
              {current + 1 === questions.length ? "Lihat skor" : "Soal berikutnya"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
