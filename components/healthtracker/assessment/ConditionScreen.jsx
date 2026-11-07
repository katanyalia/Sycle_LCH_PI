"use client";

import {
  CalendarDays,
  Baby,
  Heart,
  SkipForward,
  CheckCircle2,
} from "lucide-react";

function getConditionVisual(label) {
  const normalized = label.toLowerCase();

  if (normalized.includes("menstruasi")) {
    return {
      icon: CalendarDays,
      description: "Catat pengalaman tubuh selama siklus menstruasi.",
      animation: "condition-calendar",
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
    };
  }

  if (normalized.includes("menyusui")) {
    return {
      icon: Baby,
      description: "Catat pengalaman tubuh selama masa menyusui.",
      animation: "condition-baby",
    };
  }

  return {
    icon: SkipForward,
    description: "Lanjutkan check-in tanpa memilih kondisi tertentu.",
    animation: "condition-skip",
  };
}

export default function ConditionScreen({
  options,
  condition,
  onChange,
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#332A35]">
          Kondisi yang ingin kamu catat
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#746875]">
          Pilih kondisi yang ingin dipertimbangkan dalam
          check-in ini. Kamu juga bisa melewati bagian ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = condition === option.value;
          const visual = getConditionVisual(option.label);
          const Icon = visual.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`group relative flex min-h-[150px] flex-col items-start rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgb(120_70_90_/_8%)] ${
                selected
                  ? "border-[#B84E73] bg-[#F8E8EF] ring-2 ring-[#B84E73]/15"
                  : "border-[#F0E3E9] bg-white hover:border-[#B84E73]"
              }`}
            >
              <div className="flex w-full items-start justify-between">
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${
                    selected
                      ? "bg-white text-[#B84E73]"
                      : "bg-[#FFF1F5] text-[#B84E73]"
                  }`}
                >
                  <Icon
                    size={25}
                    strokeWidth={1.8}
                    className={visual.animation}
                  />
                </div>

                {selected && (
                  <CheckCircle2
                    size={21}
                    className="text-[#B84E73]"
                  />
                )}
              </div>

              <div className="mt-4">
                <h3
                  className={`text-sm font-bold ${
                    selected ? "text-[#8E3E5E]" : "text-[#332A35]"
                  }`}
                >
                  {option.label}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-[#746875]">
                  {visual.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

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

        .condition-skip {
          animation: skip-move 2s ease-in-out infinite;
        }

        @keyframes calendar-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.15); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
        }

        @keyframes baby-sway {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(8deg); }
        }

        @keyframes skip-move {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .condition-calendar,
          .condition-heart,
          .condition-baby,
          .condition-skip {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}