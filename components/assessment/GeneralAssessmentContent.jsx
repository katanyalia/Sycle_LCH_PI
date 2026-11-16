"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PERSONALIZATION_QUESTIONS } from "@/data/sycle";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Droplets,
  Umbrella,
  CircleHelp,
  Heart,
  House,
  Sun,
  Footprints,
  Navigation,
  Sparkles,
  RotateCcw,
  Lightbulb,
  CalendarHeart,
  Baby,
  HeartHandshake,
  CircleMinus,
  ClipboardCheck,
} from "lucide-react";

// --------------------------------------------------
// KONFIGURASI
// --------------------------------------------------

const BASE_STEPS = ["P-00", "P-01", "P-02", "P-03"];

const ACTIVITY_OPTIONS = [
  {
    value: "indoor",
    label: "Dalam Ruangan",
    description: "Beraktivitas di dalam ruangan.",
    icon: House,
  },
  {
    value: "outdoor",
    label: "Luar Ruangan",
    description: "Beraktivitas di area terbuka.",
    icon: Sun,
  },
  {
    value: "moving",
    label: "Berpindah-pindah",
    description: "Beraktivitas di beberapa lokasi.",
    icon: Footprints,
  },
  {
    value: "travel",
    label: "Perjalanan",
    description: "Sedang atau akan bepergian.",
    icon: Navigation,
  },
];

const CONDITION_OPTIONS = [
  {
    value: "menstruasi",
    label: "Menstruasi",
    description: "Sedang mengalami siklus menstruasi.",
    icon: CalendarHeart,
  },
  {
    value: "kehamilan",
    label: "Kehamilan",
    description: "Sedang dalam masa kehamilan.",
    icon: Baby,
  },
  {
    value: "menyusui",
    label: "Menyusui",
    description: "Sedang dalam masa menyusui.",
    icon: HeartHandshake,
  },
  {
    value: "lewati",
    label: "Tidak ingin menjawab",
    description: "Lewati pertanyaan kondisi.",
    icon: CircleMinus,
  },
];

const EXCLUSIVE_OPTIONS = {
  "P-03": ["tidak_ada", "belum_tahu"],
  "PM-02": ["tidak_ada_kebutuhan", "tidak_ingin_menjawab"],
};

const FOLLOW_UP_CODES = ["PM-01", "PM-02", "PS-01", "PS-02"];

const CONDITION_LABELS = {
  menstruasi: "Menstruasi",
  kehamilan: "Kehamilan",
  menyusui: "Menyusui",
  lewati: "Tidak ingin menjawab",
};

// --------------------------------------------------
// LOGIKA PERTANYAAN BERCABANG
// --------------------------------------------------

function getVisibleSteps(answers) {
  const steps = [...BASE_STEPS];
  const condition = answers["P-01"];

  if (condition === "menstruasi") {
    steps.push("PM-01");

    if (answers["PM-01"] === "ya") {
      steps.push("PM-02");
    }
  }

  if (condition === "menyusui") {
    steps.push("PS-01");

    if (
      answers["PS-01"] === "ya" ||
      answers["PS-01"] === "belum_tahu"
    ) {
      steps.push("PS-02");
    }
  }

  return steps;
}

function isAnswered(value) {
  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    (!Array.isArray(value) || value.length > 0)
  );
}

// --------------------------------------------------
// HELPER PERTANYAAN
// --------------------------------------------------

function getOptionValue(option) {
  return typeof option === "string" ? option : option.value;
}

function getOptionLabel(option) {
  if (typeof option === "string") {
    return option.replaceAll("_", " ");
  }

  return option.label || option.title || option.value || "";
}

function getQuestionText(question) {
  return (
    question?.question ||
    question?.text ||
    question?.title ||
    question?.label ||
    ""
  );
}

function getQuestionDescription(question) {
  return (
    question?.description ||
    question?.helperText ||
    question?.subtitle ||
    ""
  );
}

function getQuestionOptions(question) {
  return question?.options || [];
}

function getQuestionType(question) {
  return question?.type || question?.inputType || "single";
}

function formatLabel(value) {
  if (!value) return "Belum dipilih";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// --------------------------------------------------
// REKOMENDASI
// --------------------------------------------------

function getRecommendations(answers) {
  const recommendations = [];

  const activity = answers["P-00"];
  const condition = answers["P-01"];
  const duration = answers["P-02"];
  const resources = answers["P-03"] || [];

  if (["outdoor", "moving", "travel"].includes(activity)) {
    recommendations.push({
      title: "Perhatikan paparan lingkungan",
      description:
        "Saat beraktivitas di luar atau berpindah tempat, perhatikan suhu, paparan UV, dan kualitas udara di lingkungan sekitar.",
      icon: Sun,
    });
  }

  if (["1_2_jam", "lebih_2_jam"].includes(duration)) {
    recommendations.push({
      title: "Atur jeda aktivitas",
      description:
        "Pertimbangkan untuk mengambil jeda secara berkala, terutama ketika cuaca terasa panas. Sesuaikan durasi istirahat dengan kebutuhan tubuh.",
      icon: Heart,
    });
  }

  if (
    Array.isArray(resources) &&
    !resources.includes("air_minum") &&
    !resources.includes("tidak_ada") &&
    !resources.includes("belum_tahu")
  ) {
    recommendations.push({
      title: "Siapkan air minum",
      description:
        "Usahakan air minum mudah dijangkau dan minum secara teratur sesuai kebutuhan.",
      icon: Lightbulb,
    });
  }

  if (
    Array.isArray(resources) &&
    !resources.includes("tempat_teduh") &&
    !resources.includes("tidak_ada") &&
    !resources.includes("belum_tahu")
  ) {
    recommendations.push({
      title: "Perhatikan akses tempat teduh",
      description:
        "Cari tempat yang lebih sejuk untuk beristirahat ketika lingkungan terasa panas.",
      icon: House,
    });
  }

  if (condition === "menstruasi") {
    recommendations.push({
      title: "Perhatikan kenyamanan selama menstruasi",
      description:
        "Sesuaikan aktivitas dengan kenyamanan tubuh dan perhatikan kebutuhan istirahat serta fasilitas yang mendukung.",
      icon: Heart,
    });
  }

  if (condition === "kehamilan") {
    recommendations.push({
      title: "Perhatikan kondisi panas",
      description:
        "Selama kehamilan, perhatikan paparan panas, jaga kecukupan cairan, dan beristirahat di tempat yang lebih sejuk ketika diperlukan.",
      icon: Heart,
    });
  }

  if (condition === "menyusui") {
    recommendations.push({
      title: "Perhatikan kenyamanan menyusui",
      description:
        "Usahakan tersedia tempat yang nyaman dan waktu istirahat yang cukup sesuai kebutuhan.",
      icon: Heart,
    });
  }

  recommendations.push({
    title: "Pantau kondisi lingkungan",
    description:
      "Gunakan informasi suhu, kelembapan, UV, dan kualitas udara sebagai konteks untuk menyesuaikan aktivitas sehari-hari.",
    icon: Sparkles,
  });

  return recommendations.slice(0, 5);
}

// --------------------------------------------------
// KOMPONEN CARD RINGKASAN
// --------------------------------------------------

function ContextCard({ title, value, icon: Icon, variant = "sage" }) {
  const styles =
    variant === "pink"
      ? {
          background: "bg-[#F8E8EF]",
          icon: "bg-white text-[#B84E73]",
          label: "text-[#A34C6B]",
        }
      : {
          background: "bg-[#E9F2EA]",
          icon: "bg-white text-[#527A59]",
          label: "text-[#527A59]",
        };

  return (
    <div className={`rounded-2xl p-4 ${styles.background}`}>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.12em] ${styles.label}`}
          >
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-[#332A35]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// KOMPONEN CARD PILIHAN
// --------------------------------------------------

function SelectionCard({ option, selected, onClick }) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex min-h-[132px] w-full flex-col items-center justify-center gap-3 rounded-2xl border p-3 text-center transition-all duration-200 sm:min-h-[150px] sm:p-4 ${
        selected
          ? "border-2 border-[#B84E73] bg-[#FDF2F6] shadow-[0_3px_12px_rgb(184_78_115/8%)]"
          : "border-[#E9E2E7] bg-white hover:border-[#D7A3B8] hover:bg-[#FFFAFC]"
      }`}
    >
      {selected && (
        <CheckCircle2
          size={18}
          className="absolute right-2 top-2 text-[#B84E73]"
        />
      )}

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          selected
            ? "bg-[#F8E8EF] text-[#B84E73]"
            : "bg-[#F8F4F6] text-[#766D77]"
        }`}
      >
        <Icon size={23} />
      </div>

      <span
        className={`text-xs font-bold leading-snug sm:text-sm ${
          selected ? "text-[#8E3E5E]" : "text-[#514852]"
        }`}
      >
        {option.label}
      </span>

      {option.description && (
        <span className="text-[10px] leading-relaxed text-[#766D77] sm:text-xs">
          {option.description}
        </span>
      )}
    </button>
  );
}

// --------------------------------------------------
// KOMPONEN PERTANYAAN UMUM
// --------------------------------------------------

function QuestionField({
  code,
  question,
  value,
  onChange,
  onMultiChange,
  error,
}) {
  if (!question) return null;

  const options = getQuestionOptions(question);
  const questionType = getQuestionType(question);
  const isMultiple =
    questionType === "multiple" || questionType === "multi";

  const description = getQuestionDescription(question);

  const isDuration = code === "P-02";
  const isResources = code === "P-03";
  const isFollowUp = code?.startsWith("PM") || code?.startsWith("PS");

  function getOptionVisual(option) {
    const optionValue = getOptionValue(option).toLowerCase();
    const label = getOptionLabel(option);
    const normalized = label.toLowerCase();
    const keyword = `${optionValue} ${normalized}`;

    if (isDuration) {
      let hint = "Sesuaikan dengan aktivitasmu.";

      if (keyword.includes("1_2") || keyword.includes("1-2")) {
        hint = "Aktivitas berlangsung sekitar satu hingga dua jam.";
      } else if (
        keyword.includes("lebih_2") ||
        keyword.includes("lebih dari 2")
      ) {
        hint = "Aktivitas berlangsung lebih dari dua jam.";
      } else if (
        keyword.includes("kurang") ||
        keyword.includes("di bawah")
      ) {
        hint = "Aktivitas berlangsung kurang dari satu jam.";
      } else if (
        keyword.includes("sepanjang") ||
        keyword.includes("seharian")
      ) {
        hint = "Aktivitas berlangsung hampir sepanjang hari.";
      }

      return { Icon: Clock3, hint };
    }

    if (isResources) {
      if (keyword.includes("air") || keyword.includes("minum")) {
        return {
          Icon: Droplets,
          hint: "Ketersediaan air minum selama beraktivitas.",
        };
      }

      if (
        keyword.includes("teduh") ||
        keyword.includes("naungan") ||
        keyword.includes("berteduh")
      ) {
        return {
          Icon: Umbrella,
          hint: "Tempat untuk berlindung dari panas atau hujan.",
        };
      }

      if (
        keyword.includes("tidak_ada") ||
        keyword.includes("belum_tahu")
      ) {
        return {
          Icon: CircleHelp,
          hint: "Pilih jika tidak tersedia atau belum mengetahui.",
        };
      }

      return {
        Icon: Heart,
        hint: "Dukungan yang tersedia selama beraktivitas.",
      };
    }

    if (isFollowUp) {
      if (normalized === "ya" || normalized.startsWith("ya,")) {
        return {
          Icon: CheckCircle2,
          hint: "Ya, kondisi ini sesuai dengan keadaanmu.",
        };
      }

      if (normalized === "tidak" || normalized.startsWith("tidak,")) {
        return {
          Icon: CircleMinus,
          hint: "Tidak, kondisi ini tidak sesuai dengan keadaanmu.",
        };
      }

      if (
        normalized.includes("belum tahu") ||
        normalized.includes("tidak tahu")
      ) {
        return {
          Icon: CircleHelp,
          hint: "Tidak apa-apa jika kamu belum yakin.",
        };
      }
    }

    return { Icon: Heart, hint: "" };
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold leading-relaxed text-[#332A35] md:text-lg">
          {getQuestionText(question)}
        </h3>

        {description && (
          <p className="mt-2 text-sm leading-relaxed text-[#766D77]">
            {description}
          </p>
        )}

        {isMultiple && (
          <p className="mt-2 text-xs font-medium text-[#A34C6B]">
            Kamu bisa memilih lebih dari satu jawaban.
          </p>
        )}
      </div>

      <div
        className={
          isFollowUp && !isMultiple
            ? "space-y-3"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        }
      >
        {options.map((option) => {
          const optionValue = getOptionValue(option);
          const label = getOptionLabel(option);
          const { Icon, hint } = getOptionVisual(option);

          const selected = isMultiple
            ? (Array.isArray(value) ? value : []).includes(optionValue)
            : value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => {
                if (isMultiple) {
                  onMultiChange(optionValue);
                } else {
                  onChange(optionValue);
                }
              }}
              aria-pressed={selected}
              className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-[#B84E73] bg-[#FDF2F6] shadow-[0_4px_14px_rgba(184,78,115,0.08)]"
                  : "border-[#F0E8ED] bg-white hover:border-[#D7A3B8] hover:bg-[#FFFAFC]"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  selected
                    ? "bg-[#F8E8EF] text-[#B84E73]"
                    : "bg-[#F8F4F6] text-[#8A7883] group-hover:bg-[#FDF2F6] group-hover:text-[#B84E73]"
                }`}
              >
                <Icon size={21} />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm font-bold ${
                    selected ? "text-[#8E3E5E]" : "text-[#514852]"
                  }`}
                >
                  {label}
                </span>

                {hint && (
                  <span className="mt-1 block text-xs leading-relaxed text-[#8A808A]">
                    {hint}
                  </span>
                )}
              </span>

              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center border ${
                  isMultiple ? "rounded-md" : "rounded-full"
                } ${
                  selected
                    ? "border-[#B84E73] bg-[#B84E73] text-white"
                    : "border-[#D8CCD4] bg-white text-transparent"
                }`}
              >
                {selected && <Check size={14} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------
// HALAMAN ASSESSMENT
// --------------------------------------------------

export default function GeneralAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const isHealthTrackerFlow = source === "healthtracker";

  const initialActivity = searchParams.get("activity") || "";

  const [answers, setAnswers] = useState(() =>
    initialActivity ? { "P-00": initialActivity } : {}
  );

  const [skipActivity, setSkipActivity] = useState(Boolean(initialActivity));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");

  // Status autentikasi pengguna
  const [isMember, setIsMember] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Periksa sesi Supabase
  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          setIsMember(false);
        } else {
          setIsMember(Boolean(session?.user));
        }
      } catch (error) {
        console.error("Gagal memeriksa sesi pengguna:", error);

        if (mounted) {
          setIsMember(false);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsMember(Boolean(session?.user));
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Scroll ke atas setiap berpindah bagian
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentIndex, showResult]);

  const visibleSteps = useMemo(
    () => getVisibleSteps(answers),
    [answers]
  );

  // Susunan screen berdasarkan asal dan jawaban pengguna
  const screens = useMemo(() => {
    const result = [];

    if (!skipActivity) {
      result.push({
        id: "activity",
        title: "Aktivitas",
        questions: ["P-00"],
      });
    }

    result.push({
      id: "condition",
      title: "Kondisi",
      questions: ["P-01"],
    });

    result.push({
      id: "details",
      title: "Durasi dan kebutuhan",
      questions: ["P-02", "P-03"],
    });

    const followUps = visibleSteps.filter((step) =>
      FOLLOW_UP_CODES.includes(step)
    );

    if (followUps.length > 0) {
      result.push({
        id: "followup",
        title: "Pertanyaan tambahan",
        questions: followUps,
      });
    }

    return result;
  }, [skipActivity, visibleSteps]);

  const currentScreen = screens[currentIndex];

  const recommendations = useMemo(
    () => getRecommendations(answers),
    [answers]
  );

  const activityInfo = ACTIVITY_OPTIONS.find(
    (item) => item.value === answers["P-00"]
  );

  const conditionLabel =
    CONDITION_LABELS[answers["P-01"]] ||
    formatLabel(answers["P-01"]);

  // ------------------------------------------------
  // MENYIMPAN JAWABAN
  // ------------------------------------------------

  function handleAnswer(code, value) {
    setError("");

    setAnswers((previous) => {
      const next = {
        ...previous,
        [code]: value,
      };

      const nextSteps = getVisibleSteps(next);

      // Hapus jawaban lanjutan yang tidak lagi relevan
      Object.keys(next).forEach((key) => {
        if (
          FOLLOW_UP_CODES.includes(key) &&
          !nextSteps.includes(key)
        ) {
          delete next[key];
        }
      });

      return next;
    });
  }

  function handleMultiAnswer(code, value) {
    const current = Array.isArray(answers[code])
      ? answers[code]
      : [];

    const exclusive = EXCLUSIVE_OPTIONS[code] || [];

    let next;

    if (exclusive.includes(value)) {
      next = current.includes(value) ? [] : [value];
    } else {
      next = current.filter((item) => !exclusive.includes(item));

      next = next.includes(value)
        ? next.filter((item) => item !== value)
        : [...next, value];
    }

    handleAnswer(code, next);
  }

  // ------------------------------------------------
  // VALIDASI DAN NAVIGASI SCREEN
  // ------------------------------------------------

  function handleNext() {
    if (!currentScreen) return;

    const unanswered = currentScreen.questions.find(
      (code) => !isAnswered(answers[code])
    );

    if (unanswered) {
      setError("Silakan lengkapi semua pertanyaan pada bagian ini.");
      return;
    }

    setError("");

    if (currentIndex < screens.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      setShowResult(true);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
      setError("");
    }
  }

  // Simpan konteks assessment dan lanjut ke Health Tracker
  function handleContinueToPersonal() {
    const dailyContext = {
      answers,
      completedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(
      "sycleDailyContext",
      JSON.stringify(dailyContext)
    );

    router.push("/healthtracker/assessment");
  }

  function handleRestart() {
    // Ulangi selalu dimulai dari aktivitas,
    // meskipun assessment sebelumnya berasal dari Beranda.
    setAnswers({});
    setSkipActivity(false);
    setCurrentIndex(0);
    setShowResult(false);
    setError("");
  }

  // ------------------------------------------------
  // RENDER PERTANYAAN
  // ------------------------------------------------

  function renderQuestion(code) {
    const question = PERSONALIZATION_QUESTIONS[code];

    if (!question) {
      return (
        <div
          key={code}
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          Pertanyaan belum dapat dimuat. Periksa data pertanyaan di
          data/sycle.js.
        </div>
      );
    }

    if (code === "P-00" || code === "P-01") {
      const isActivity = code === "P-00";
      const options = isActivity
        ? ACTIVITY_OPTIONS
        : CONDITION_OPTIONS;

      const selectedValue = answers[code];

      return (
        <div key={code} className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold leading-relaxed text-[#332A35] md:text-2xl">
              {getQuestionText(question)}
            </h2>

            {getQuestionDescription(question) && (
              <p className="mt-2 text-sm leading-relaxed text-[#766D77]">
                {getQuestionDescription(question)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {options.map((option) => (
              <SelectionCard
                key={option.value}
                option={option}
                selected={selectedValue === option.value}
                onClick={() => handleAnswer(code, option.value)}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <QuestionField
        key={code}
        code={code}
        question={question}
        value={answers[code]}
        onChange={(value) => handleAnswer(code, value)}
        onMultiChange={(value) => handleMultiAnswer(code, value)}
      />
    );
  }

  // ------------------------------------------------
  // HASIL
  // ------------------------------------------------

  if (showResult) {
    return (
      <main className="min-h-screen bg-[#FFF8FB] px-4 py-8 md:py-12">
        <section className="mx-auto w-full max-w-3xl space-y-6">
          <div className="overflow-hidden rounded-3xl border border-[#D7E6D9] bg-white">
            <div className="bg-[#E9F2EA] px-6 py-8 text-center md:px-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#527A59] shadow-sm">
                <CheckCircle2 size={34} />
              </div>

              <p className="text-xs font-bold tracking-[0.15em] text-[#527A59]">
                ASSESSMENT SELESAI
              </p>

              <h1 className="mt-3 text-2xl font-extrabold text-[#332A35] md:text-3xl">
                Terima kasih sudah mengenali kebutuhanmu.
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#625B64]">
                Berikut beberapa hal yang dapat kamu pertimbangkan
                berdasarkan jawaban dan konteks aktivitasmu.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 md:p-6">
              <ContextCard
                title="Aktivitas"
                value={activityInfo?.label || formatLabel(answers["P-00"])}
                icon={activityInfo?.icon || Sparkles}
              />

              <ContextCard
                title="Kondisi"
                value={conditionLabel}
                icon={Heart}
                variant="pink"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#B84E73]" />
                <h2 className="text-xl font-bold text-[#332A35]">
                  Rekomendasi untukmu
                </h2>
              </div>

              <p className="mt-1 text-sm text-[#766D77]">
                Beberapa hal yang bisa kamu pertimbangkan dalam
                aktivitas sehari-hari.
              </p>
            </div>

            {recommendations.map((item, index) => {
              const Icon = item.icon || Lightbulb;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#E9E2E7] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E6B8C9] hover:shadow-[0_5px_24px_rgb(120_70_90/6%)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8E8EF] text-[#B84E73]">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold tracking-[0.12em] text-[#B84E73]">
                        REKOMENDASI {index + 1}
                      </p>

                      <h3 className="mt-1 font-bold text-[#332A35]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-[#6B626C]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#E9E2E7] bg-[#F8F4F6] p-4">
            <div className="flex items-start gap-3">
              <Lightbulb
                size={20}
                className="mt-0.5 shrink-0 text-[#B84E73]"
              />

              <p className="text-xs leading-relaxed text-[#766D77]">
                Informasi ini bersifat edukatif. Data lingkungan
                merupakan konteks untuk membantu menyesuaikan
                aktivitas, bukan alat diagnosis atau penentu
                penyebab keluhan kesehatan.
              </p>
            </div>
          </div>

          {/* TOMBOL RINGKASAN */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {isHealthTrackerFlow ? (
              <Button
                type="button"
                onClick={() => router.push("/healthtracker")}
                variant="outline"
                className="h-12 flex-1 rounded-xl border-[#B84E73] text-[#8E3E5E] hover:bg-[#F8E8EF]"
              >
                <ArrowLeft size={17} />
                Kembali ke Health Tracker
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleRestart}
                variant="outline"
                className="h-12 flex-1 rounded-xl border-[#B84E73] text-[#8E3E5E] hover:bg-[#F8E8EF]"
              >
                <RotateCcw size={17} />
                Ulangi Assessment
              </Button>
            )}

            {isHealthTrackerFlow ? (
              <Button
                type="button"
                onClick={handleContinueToPersonal}
                className="h-12 flex-1 rounded-xl bg-[#B84E73] text-white hover:bg-[#8E3E5E]"
              >
                Lanjutkan Check-In Personal
                <ArrowRight size={17} />
              </Button>
            ) : authLoading ? (
              <Button
                type="button"
                disabled
                className="h-12 flex-1 rounded-xl bg-[#B84E73] text-white opacity-60"
              >
                Memeriksa akun...
              </Button>
            ) : isMember ? (
              <Button
                type="button"
                onClick={handleContinueToPersonal}
                className="h-12 flex-1 rounded-xl bg-[#B84E73] text-white hover:bg-[#8E3E5E]"
              >
                Daily Check-In
                <ArrowRight size={17} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => router.push("/login")}
                className="h-12 flex-1 rounded-xl bg-[#B84E73] text-white hover:bg-[#8E3E5E]"
              >
                Daftar/Masuk untuk Daily Check-In
                <ArrowRight size={17} />
              </Button>
            )}
          </div>
        </section>
      </main>
    );
  }

  // ------------------------------------------------
  // VALIDASI SCREEN
  // ------------------------------------------------

  if (!currentScreen) {
    return (
      <main className="min-h-screen bg-[#FFF8FB] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E9E2E7] bg-white p-6">
          <h2 className="font-bold text-[#332A35]">
            Pertanyaan belum dapat dimuat
          </h2>

          <p className="mt-2 text-sm text-[#766D77]">
            Periksa kembali data PERSONALIZATION_QUESTIONS di
            data/sycle.js.
          </p>
        </div>
      </main>
    );
  }

  // ------------------------------------------------
  // HALAMAN PERTANYAAN
  // ------------------------------------------------

  const progress = Math.round(
    ((currentIndex + 1) / screens.length) * 100
  );

  return (
    <main className="min-h-screen bg-[#FFF8FB] px-4 py-8 md:py-12">
      <section className="mx-auto w-full max-w-4xl space-y-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-[#F8E8EF] px-6 py-8 md:px-10 md:py-10">
          <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-[#E9F2EA]/70 blur-2xl" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#EBCBD7] bg-white/70 px-3 py-1.5">
              <Sparkles size={14} className="text-[#B84E73]" />
              <span className="text-[10px] font-bold tracking-[0.14em] text-[#A34C6B]">
                Sycle · ASSESSMENT UMUM
              </span>
            </div>

            <h1 className="max-w-2xl text-2xl font-extrabold leading-tight text-[#332A35] md:text-4xl">
              Kenali kebutuhanmu,
              <span className="text-[#B84E73]">
                {" "}sesuaikan aktivitasmu.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#625B64] md:text-base">
              Jawab beberapa pertanyaan singkat untuk mendapatkan
              informasi dan rekomendasi yang relevan dengan aktivitas
              serta konteks lingkunganmu.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[#765E6A]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2">
                <CheckCircle2 size={14} />
                Tanpa diagnosis
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-2">
                <Heart size={14} />
                Sesuai kebutuhanmu
              </span>
            </div>
          </div>
        </div>

        {/* KONTEKS PILIHAN */}
        <div className="rounded-2xl border border-[#E9E2E7] bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#332A35]">
                Konteks pilihanmu
              </h2>

              <p className="mt-1 text-xs text-[#766D77]">
                Ringkasan pilihan aktivitas dan kondisi.
              </p>
            </div>

            <Sparkles size={20} className="shrink-0 text-[#B84E73]" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ContextCard
              title="Aktivitas"
              value={activityInfo?.label || "Belum dipilih"}
              icon={activityInfo?.icon || Sparkles}
            />

            <ContextCard
              title="Kondisi"
              value={conditionLabel}
              icon={Heart}
              variant="pink"
            />
          </div>
        </div>

        {/* PROGRESS */}
        <div className="rounded-2xl border border-[#E9E2E7] bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#332A35]">
                Perjalanan assessment
              </p>

              <p className="mt-1 text-xs text-[#766D77]">
                {currentIndex + 1} dari {screens.length} bagian
              </p>
            </div>

            <span className="rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold text-[#A34C6B]">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#E9E2E7]">
            <div
              className="h-full rounded-full bg-[#B84E73] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {screens.map((screen, index) => (
              <span
                key={screen.id}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  index === currentIndex
                    ? "bg-[#F8E8EF] text-[#A34C6B]"
                    : index < currentIndex
                      ? "bg-[#E9F2EA] text-[#527A59]"
                      : "bg-[#F8F4F6] text-[#8A808A]"
                }`}
              >
                {screen.title}
              </span>
            ))}
          </div>
        </div>

        {/* SECTION PERTANYAAN */}
        <div
          key={currentScreen.id}
          className="space-y-5 rounded-3xl border border-[#E9E2E7] bg-white p-5 shadow-[0_5px_24px_rgb(120_70_90/6%)] md:p-8"
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck size={19} className="text-[#B84E73]" />

            <span className="text-xs font-bold tracking-[0.12em] text-[#A34C6B]">
              BAGIAN {currentIndex + 1}
            </span>
          </div>

          {currentScreen.id === "details" && (
            <div>
              <h2 className="text-xl font-extrabold text-[#332A35] md:text-2xl">
                Durasi dan kebutuhan
              </h2>

              <p className="mt-2 text-sm text-[#766D77]">
                Ceritakan durasi aktivitas dan sumber daya yang tersedia.
              </p>
            </div>
          )}

          {currentScreen.id === "followup" && (
            <div>
              <h2 className="text-xl font-extrabold text-[#332A35] md:text-2xl">
                Pertanyaan tambahan
              </h2>

              <p className="mt-2 text-sm text-[#766D77]">
                Beberapa pertanyaan berikut membantu memahami kebutuhanmu
                lebih lanjut.
              </p>
            </div>
          )}

          {currentScreen.questions.map((code) => (
            <div key={code}>{renderQuestion(code)}</div>
          ))}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}
        </div>

        {/* NAVIGASI */}
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="h-12 rounded-xl px-5"
          >
            <ArrowLeft size={17} />
            Kembali
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            className="h-12 rounded-xl bg-[#B84E73] px-6 text-white hover:bg-[#8E3E5E]"
          >
            {currentIndex === screens.length - 1
              ? "Lihat Rekomendasi"
              : "Lanjutkan"}

            <ArrowRight size={17} />
          </Button>
        </div>

        <p className="pb-4 text-center text-xs leading-relaxed text-[#8A808A]">
          Informasi Sycle bersifat edukatif dan bukan pengganti
          konsultasi tenaga kesehatan.
        </p>
      </section>
    </main>
  );
}