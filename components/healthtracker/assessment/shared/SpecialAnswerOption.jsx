"use client";

export default function SpecialAnswerOption({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
        checked
          ? "border-[#B84E73] bg-[#FFF8FB]"
          : "border-[#F0E3E9] bg-white hover:border-[#D9A5B8]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#B84E73]"
      />

      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#332A35]">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-relaxed text-[#746875]">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}