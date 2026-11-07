"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock3,
  Download,
  CalendarCheck,
} from "lucide-react";

import DeleteHistoryButton from "@/components/healthtracker/history/DeleteHistoryButton";
import HistoryEntryDetail from "@/components/healthtracker/history/HistoryEntryDetail";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function getJakartaTodayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function getMonthKey(dateKey) {
  return dateKey.slice(0, 7);
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

function getDateLabel(dateKey) {
  const date = new Date(`${dateKey}T12:00:00+07:00`);

  return date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(monthKey, amount) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));

  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}

function getCalendarDays(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;

  return [
    ...Array(mondayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      return `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }),
  ];
}

function HistoryEntryCard({ entry }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      <article className="flex flex-col gap-4 rounded-[22px] border border-[#F0DFE7] bg-white p-4 shadow-[0_5px_20px_rgb(120_70_90_/_5%)] transition-all duration-200 hover:border-[#E8C9D5] hover:shadow-[0_8px_24px_rgb(120_70_90_/_8%)] sm:p-5">
        {/* Informasi utama */}
        <div className="flex items-center gap-4">
          {/* Tanggal */}
          <div className="flex h-[66px] w-[66px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#F8E8EF]">
            <span className="text-2xl font-extrabold leading-none text-[#B84E73]">
              {entry.day}
            </span>
            <span className="mt-1 text-[10px] font-bold text-[#A16B82]">
              {MONTHS[Number(entry.dateKey?.slice(5, 7)) - 1]}
            </span>
          </div>

          {/* Kondisi dan waktu */}
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-[#F8E8EF] px-3 py-1.5 text-xs font-bold text-[#B84E73]">
              {entry.condition || "Catatan umum"}
            </span>

            {entry.time && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[#8A7D89]">
                <Clock3 size={14} />
                {entry.time} WIB
              </p>
            )}
          </div>
        </div>

        {/* Tombol tindakan */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#F2E9EE] pt-3">
          <button
            type="button"
            onClick={() => setIsDetailOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-[#B84E73] px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-[#8E3E5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2"
          >
            Lihat Detail
          </button>

          <Link
            href={`/api/tracker/records/${entry.id}/pdf`}
            className="inline-flex items-center gap-2 rounded-full border border-[#E8DCE3] px-4 py-2.5 text-xs font-bold text-[#6F6570] transition-all duration-200 hover:border-[#B84E73] hover:bg-[#FFF8FB] hover:text-[#B84E73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73]"
          >
            <Download size={14} />
            Unduh PDF
          </Link>

          <DeleteHistoryButton recordId={entry.id} />
        </div>
      </article>

      {/* Modal detail riwayat */}
      <HistoryEntryDetail
        recordId={entry.id}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}

export default function HistoryCalendar({ entries = [] }) {
  const todayKey = getJakartaTodayKey();
  const currentMonth = getMonthKey(todayKey);

  const entriesByDate = useMemo(() => {
    const groupedEntries = {};

    entries.forEach((entry) => {
      if (!entry.dayKey) return;

      if (!groupedEntries[entry.dayKey]) {
        groupedEntries[entry.dayKey] = [];
      }

      groupedEntries[entry.dayKey].push(entry);
    });

    return groupedEntries;
  }, [entries]);

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(currentMonth);

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  );

  const selectedEntries = entriesByDate[selectedDate] || [];
  const canGoNext = visibleMonth < currentMonth;

  function changeMonth(amount) {
    const nextMonth = shiftMonth(visibleMonth, amount);

    if (nextMonth > currentMonth) return;

    setVisibleMonth(nextMonth);

    if (nextMonth === currentMonth) {
      setSelectedDate(todayKey);
      return;
    }

    const datesInNextMonth = Object.keys(entriesByDate)
      .filter((date) => getMonthKey(date) === nextMonth)
      .sort();

    setSelectedDate(
      datesInNextMonth[datesInNextMonth.length - 1] ||
        `${nextMonth}-01`
    );
  }

  function selectDate(dateKey) {
    if (!dateKey || dateKey > todayKey) return;
    setSelectedDate(dateKey);
  }

  function goToToday() {
    setVisibleMonth(currentMonth);
    setSelectedDate(todayKey);
  }

  return (
    <div className="space-y-7">
      {/* Kalender */}
      <section className="mx-auto w-full max-w-[680px] rounded-[26px] border border-[#F0DFE7] bg-white p-4 shadow-[0_5px_24px_rgb(120_70_90_/_6%)] sm:p-6 md:p-7">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73] sm:h-12 sm:w-12">
              <CalendarDays size={23} />
            </div>

            <div>
              <p className="text-xs font-bold text-[#B84E73] sm:text-sm">
                Kalender Check-In
              </p>

              <h2 className="mt-0.5 text-lg font-extrabold text-[#332A35] sm:text-xl">
                {getMonthLabel(visibleMonth)}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={goToToday}
            className="inline-flex items-center gap-2 rounded-full border border-[#E8C9D5] bg-white px-4 py-2.5 text-xs font-bold text-[#B84E73] transition-all duration-200 hover:border-[#B84E73] hover:bg-[#F8E8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2 sm:text-sm"
          >
            <CalendarCheck size={16} />
            Hari Ini
          </button>
        </div>

        {/* Navigasi bulan */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#FFF8FB] p-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Bulan sebelumnya"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#8A6578] transition-all duration-200 hover:bg-[#F8E8EF] hover:text-[#B84E73] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73]"
          >
            <ChevronLeft size={23} />
          </button>

          <span className="text-sm font-extrabold text-[#6F6570] sm:text-base">
            {getMonthLabel(visibleMonth)}
          </span>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={!canGoNext}
            aria-label="Bulan berikutnya"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#8A6578] transition-all duration-200 hover:bg-[#F8E8EF] hover:text-[#B84E73] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={23} />
          </button>
        </div>

        {/* Grid kalender */}
        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="py-2.5 text-center text-[11px] font-extrabold text-[#A193A0] sm:py-3 sm:text-sm"
            >
              {weekday}
            </div>
          ))}

          {calendarDays.map((dateKey, index) => {
            if (!dateKey) {
              return <div key={`empty-${index}`} />;
            }

            const day = Number(dateKey.slice(-2));
            const entryCount = entriesByDate[dateKey]?.length || 0;
            const hasEntries = entryCount > 0;
            const isSelected = selectedDate === dateKey;
            const isToday = todayKey === dateKey;
            const isFuture = dateKey > todayKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => selectDate(dateKey)}
                disabled={isFuture}
                aria-label={`${getDateLabel(dateKey)}${
                  hasEntries ? `, ${entryCount} catatan` : ""
                }`}
                aria-pressed={isSelected}
                title={
                  hasEntries
                    ? `${entryCount} Check-In`
                    : getDateLabel(dateKey)
                }
                className={`group relative mx-auto flex aspect-square w-full max-w-[68px] flex-col items-center justify-center rounded-[15px] text-sm transition-all duration-200 sm:rounded-[18px] sm:text-base ${
                  isSelected
                    ? "scale-[1.04] bg-[#B84E73] font-extrabold text-white shadow-[0_5px_14px_rgb(184_78_115_/_25%)]"
                    : isFuture
                      ? "cursor-not-allowed text-[#DED7DC]"
                      : hasEntries
                        ? "bg-[#FFF1F6] font-bold text-[#B84E73] hover:-translate-y-1 hover:bg-[#F8E8EF] hover:shadow-[0_4px_12px_rgb(184_78_115_/_10%)]"
                        : "text-[#6F6570] hover:-translate-y-1 hover:bg-[#FFF3F7] hover:text-[#B84E73]"
                } ${
                  isToday && !isSelected
                    ? "ring-2 ring-inset ring-[#B84E73]"
                    : ""
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84E73] focus-visible:ring-offset-2`}
              >
                <span>{day}</span>

                {hasEntries && (
                  <span
                    className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full transition-colors sm:bottom-2 ${
                      isSelected ? "bg-white" : "bg-[#B84E73]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Keterangan */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#F2E9EE] pt-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#817582] sm:text-xs">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#B84E73]" />
              Ada Check-In
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-[#B84E73]" />
              Hari ini
            </span>
          </div>

          <span className="rounded-full bg-[#F8F5F8] px-3 py-1.5 text-[11px] font-bold text-[#817582] sm:text-xs">
            {entries.length} catatan tersimpan
          </span>
        </div>
      </section>

      {/* Detail tanggal terpilih */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#B84E73] sm:text-xs">
              Catatan terpilih
            </p>

            <h2 className="mt-1 text-base font-extrabold text-[#332A35] sm:text-lg">
              {getDateLabel(selectedDate)}
            </h2>
          </div>

          {selectedEntries.length > 0 && (
            <span className="rounded-full bg-[#F8E8EF] px-3.5 py-2 text-xs font-bold text-[#B84E73]">
              {selectedEntries.length} Check-In
            </span>
          )}
        </div>

        {selectedEntries.length > 0 ? (
          <div className="space-y-3">
            {selectedEntries.map((entry) => (
              <HistoryEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#E8DCE3] bg-white px-4 py-10 text-center sm:py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8E8EF] text-[#B84E73]">
              <CalendarDays size={24} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#332A35]">
              Belum ada Check-In
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[#817582] sm:text-sm">
              Belum ada catatan yang tersimpan pada tanggal ini.
              Pilih tanggal lain untuk melihat riwayat Check-In.
            </p>
          </div>
        )}
      </section>

      {/* Informasi */}
      <p className="rounded-2xl border border-[#E9F2EA] bg-[#F7FAF7] p-4 text-xs leading-6 text-[#657568] sm:p-5 sm:text-sm">
        Riwayat Check-In merupakan catatan pribadi untuk membantu kamu
        memahami pengalaman dan kondisi tubuh dari waktu ke waktu.
        Informasi lingkungan menjadi konteks pendukung, bukan diagnosis medis.
      </p>
    </div>
  );
}