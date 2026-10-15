import { Clock, CircleAlert } from "lucide-react";
import { DATA_TYPE_LABEL, formatDataTime, formatNumber } from "@/lib/environment/format";
import { isIndicatorStale } from "@/lib/environment/freshness";

// Menampilkan satu indikator: nilai + satuan + standar + kategori + kesegaran (Master Draft 6.3.6).
// Indikator yang tidak tersedia tidak menampilkan angka apa pun.
export function IndicatorValue({ indicator, timezone, now }) {
  if (!indicator || indicator.status === "unavailable") {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{indicator?.label}</p>
        <p className="flex items-center gap-1.5 font-semibold">
          <CircleAlert className="size-4 text-primary-pressed" aria-hidden="true" />
          {indicator?.message ?? "Data belum tersedia."}
        </p>
      </div>
    );
  }

  const stale = isIndicatorStale(indicator, now);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {indicator.label}
        {indicator.standard && <span className="font-semibold text-foreground"> · {indicator.standard}</span>}
      </p>
      <p className="text-3xl font-bold tracking-tight">
        {formatNumber(indicator.value)}
        {indicator.unit && indicator.unit !== indicator.standard && <span className="ml-1 text-lg font-semibold">{indicator.unit}</span>}
      </p>
      {indicator.category && <CategoryBadge category={indicator.category} />}
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        {DATA_TYPE_LABEL[indicator.dataType]} · {formatDataTime(indicator.timeUtc, timezone)}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {indicator.isFallback && (
          <span className="rounded-full bg-powder px-2 py-0.5 text-xs font-semibold">Data cadangan</span>
        )}
        {stale && (
          <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-semibold text-primary-pressed">Bukan kondisi terkini</span>
        )}
      </div>
    </div>
  );
}

// Warna kategori mengikuti standar indeks; label teks selalu ditampilkan (tidak bergantung warna saja).
export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-card px-2.5 py-1 text-sm font-semibold">
      {category.color && (
        <span className="size-3 rounded-full border border-black/20" style={{ backgroundColor: category.color }} aria-hidden="true" />
      )}
      {category.label}
    </span>
  );
}
