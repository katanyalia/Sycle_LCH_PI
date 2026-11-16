"use client";

import {
  CalendarDays,
  Baby,
  Heart,
  CheckCircle2,
  ClipboardList,
  SkipForward,
} from "lucide-react";

function getConditionVisual(label) {
  const normalized = String(label ?? "").toLowerCase();

  if (normalized.includes("menstruasi")) {
    return {
      icon: CalendarDays,
      description: "Catat pengalaman tubuh selama siklus menstruasi.",
      animation: "condition-calendar",
      background: "bg-[#F8E8EF]",
      iconBackground: "bg-[#F3DCE5]",
      iconColor: "text-[#A94C70]",
      border: "border-[#EED5DF]",
    };
  }

  if (
    normalized.includes("kehamilan") ||
    normalized.includes("hamil")
  ) {
    return {
      icon: Heart,
      description: "Catat kondisi tubuh selama masa kehamilan.",
      animation: "condition-heart",
      background: "bg-[#E9F2EA]",
      iconBackground: "bg-[#DDEBDD]",
      iconColor: "text-[#64866B]",
      border: "border-[#D7E6D9]",
    };
  }

  if (normalized.includes("menyusui")) {
    return {
      icon: Baby,
      description: "Catat pengalaman tubuh selama masa menyusui.",
      animation: "condition-baby",
      background: "bg-[#E8F1F7]",
      iconBackground: "bg-[#DCEAF3]",
      iconColor: "text-[#6489A5]",
      border: "border-[#D4E4EF]",
    };
  }

  return {
    icon: SkipForward,
    description: "Lanjutkan check-in tanpa memilih kondisi tertentu.",
    animation: "condition-skip",
    background: "bg-[#EEEAF8]",
    iconBackground: "bg-[#E3DDF2]",
    iconColor: "text-[#8272A8]",
    border: "border-[#DDD5EF]",
  };
}

function isSkipOption(option) {
  const label = String(option?.label ?? "").toLowerCase();

  return (
    label.includes("lewati") ||
    label.includes("tidak ingin menjawab")
  );
}

export default function ConditionScreen({
  options = [],
  condition,
  onChange,
}) {
  const mainOptions = options.filter(
    (option) => !isSkipOption(option)
  );

  const skipOption = options.find(isSkipOption);

  return (
    <section className="space-y-6">
      {/* SECTION HEADER */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-extrabold tracking-wide text-[#8E3E5E]">
          <ClipboardList size={14} />
          TAHAP 02 · KONDISI
        </div>

        <h2 className="text-xl font-extrabold tracking-tight text-[#332A35] sm:text-2xl">
          Kondisi yang ingin kamu catat
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#746875] sm:text-base">
          Pilih kondisi yang ingin dipertimbangkan dalam
          check-in ini. Kamu juga bisa melewati bagian ini.
        </p>
      </div>

      {/* CONDITION OPTIONS */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {mainOptions.map((option) => {
          const selected = condition === option.value;
          const visual = getConditionVisual(option.label);
          const Icon = visual.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`
                group relative flex min-h-[150px] sm:min-h-[180px]
                flex-col items-center sm:items-start
                rounded-2xl sm:rounded-[22px]
                border p-2.5 sm:p-5
                text-center sm:text-left
                transition-all duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#B84E73]
                focus-visible:ring-offset-2
                ${
                  selected
                    ? `${visual.background} border-[#B84E73] ring-2 ring-[#B84E73]/15`
                    : `bg-white ${visual.border} hover:shadow-[0_5px_24px_rgb(120_70_90_/_6%)]`
                }
              `}
            >
              {/* ICON */}
              <div className="flex w-full items-start justify-between">
                <div
                  className={`mx-auto flex size-10 sm:mx-0 sm:size-12 items-center justify-center rounded-xl sm:rounded-2xl ${visual.iconBackground} ${visual.iconColor}`}
                >
                  <Icon
                    size={23}
                    strokeWidth={1.8}
                    className={visual.animation}
                  />
                </div>

                {selected && (
                  <CheckCircle2
                    size={18}
                    className="absolute right-2 top-2 text-[#B84E73] sm:static sm:size-[21px]"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* TEXT */}
              <div className="mt-3 sm:mt-5 w-full">
                <h3
                  className={`text-xs font-extrabold leading-5 sm:text-base ${
                    selected ? "text-[#8E3E5E]" : "text-[#332A35]"
                  }`}
                >
                  {option.label}
                </h3>

                <p className="mt-1.5 hidden text-xs leading-6 text-[#746875] sm:block">
                  {visual.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* PILIHAN LEWATI */}
      {skipOption && (
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
            condition === skipOption.value
              ? "border-[#B84E73] bg-[#FFF8FB]"
              : "border-[#F0E3E9] bg-white hover:border-[#D9A5B8]"
          }`}
        >
          <input
            type="checkbox"
            checked={condition === skipOption.value}
            onChange={(event) => {
              onChange(
                event.target.checked ? skipOption.value : null
              );
            }}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#B84E73]"
          />

          <div className="min-w-0">
            <p className="text-sm font-bold text-[#332A35]">
              Saya ingin melewati pertanyaan kondisi
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#746875]">
              Kamu tetap bisa melanjutkan check-in tanpa memilih
              kondisi di atas.
            </p>
          </div>
        </label>
      )}

      {/* ANIMATIONS */}
      <style jsx>{`
        .condition-calendar {
          animation: calendar-float 3s ease-in-out infinite;
        }

        .condition-heart {
          animation: heart-beat 1.8s ease-in-out infinite;
        }

        .condition-baby {
          animation: baby-sway 2.5s ease-in-out infinite;
        }

        @keyframes calendar-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.12); }
          30% { transform: scale(1); }
          45% { transform: scale(1.08); }
        }

        @keyframes baby-sway {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(6deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .condition-calendar,
          .condition-heart,
          .condition-baby {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}