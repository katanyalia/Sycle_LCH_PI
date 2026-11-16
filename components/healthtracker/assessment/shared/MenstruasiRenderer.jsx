
"use client";

export default function MenstruasiRenderer({
  value,
  updateAnswer,
}) {
  const selectedDay = /^hari_\d+$/.test(String(value ?? ""))
    ? Number(String(value).replace("hari_", ""))
    : null;

  const isUncertain = value === "tidak_yakin";

  const changeDay = (direction) => {
    const currentDay = selectedDay ?? 0;
    const nextDay = currentDay === 0
      ? 1
      : Math.min(14, Math.max(1, currentDay + direction));

    updateAnswer("HM-02", `hari_${nextDay}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 rounded-2xl border border-[#EADDE3] bg-white p-5">
        <button
          type="button"
          onClick={() => changeDay(-1)}
          disabled={selectedDay === null || selectedDay <= 1 || isUncertain}
          aria-label="Kurangi hari"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#EADDE3] text-[#8E3E5E] transition hover:bg-[#F8E8EF] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-2xl font-bold">−</span>
        </button>

        <div className="min-w-[110px] text-center">
          <p className="text-xs font-semibold text-[#8A7B87]">
            Hari menstruasi
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#B84E73]">
            {selectedDay ?? "—"}
          </p>
          <p className="text-xs text-[#8A7B87]">
            dari 14 hari
          </p>
        </div>

        <button
          type="button"
          onClick={() => changeDay(1)}
          disabled={selectedDay === 14 || isUncertain}
          aria-label="Tambah hari"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#EADDE3] text-[#8E3E5E] transition hover:bg-[#F8E8EF] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-2xl font-bold">+</span>
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#EADDE3] bg-[#FFF8FB] p-4">
        <input
          type="checkbox"
          checked={isUncertain}
          onChange={(event) => {
            updateAnswer(
              "HM-02",
              event.target.checked ? "tidak_yakin" : null
            );
          }}
          className="h-5 w-5 accent-[#B84E73]"
        />

        <span className="text-sm font-semibold text-[#5F5360]">
          Tidak yakin
        </span>
      </label>

      {isUncertain && (
        <p className="text-xs text-[#8A7B87]">
          Kamu tidak perlu menentukan hari menstruasi jika belum yakin.
        </p>
      )}
    </div>
  );
}