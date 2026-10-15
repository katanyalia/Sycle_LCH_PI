"use client";

import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DISRUPTION_SCALE } from "@/lib/forms/choices";
import { cn } from "@/lib/utils";

// Skala 0–4 = gangguan aktivitas, bukan tingkat keparahan penyakit (Master Draft 8.3.6).
// `value` null berarti belum diisi / dilewati (tidak ada data), bukan 0.
export function DisruptionScale({ itemLabel, question, value, onChange, className }) {
  const id = useId();
  const legendId = `${id}-legend`;

  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend id={legendId} className="font-semibold">
        {question ?? "Seberapa jauh hal ini mengganggu aktivitasmu?"}
        {itemLabel && <span className="block font-normal text-muted-foreground">{itemLabel}</span>}
      </legend>
      <RadioGroup
        value={value === null || value === undefined ? "" : String(value)}
        onValueChange={(next) => onChange(Number(next))}
        aria-labelledby={legendId}
        className="grid gap-2 sm:grid-cols-5"
      >
        {DISRUPTION_SCALE.map((step) => {
          const optionId = `${id}-${step.value}`;
          const checked = value === step.value;
          return (
            <Label
              key={step.value}
              htmlFor={optionId}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-3 py-2 text-sm font-normal leading-snug hover:bg-secondary sm:flex-col sm:items-start sm:gap-2",
                checked && "border-primary bg-secondary"
              )}
            >
              <RadioGroupItem id={optionId} value={String(step.value)} />
              <span>
                <span className="font-semibold">{step.value}</span> — {step.label}
              </span>
            </Label>
          );
        })}
      </RadioGroup>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{value === null || value === undefined ? "Belum diisi (tidak ada data)." : `Terpilih: ${value}.`}</span>
        {value !== null && value !== undefined && (
          <Button type="button" variant="link" size="sm" onClick={() => onChange(null)}>
            Kosongkan pilihan
          </Button>
        )}
      </div>
    </fieldset>
  );
}
