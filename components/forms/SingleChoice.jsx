"use client";

import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Pilihan tunggal: hanya satu opsi aktif, keadaan "belum dipilih" jelas, fokus keyboard terlihat.
export function SingleChoice({ code, question, helper, options, value, onChange, className }) {
  const id = useId();
  const legendId = `${id}-legend`;

  return (
    <fieldset className={cn("space-y-3", className)} aria-describedby={helper ? `${id}-help` : undefined}>
      <legend id={legendId} className="text-lg font-semibold">
        {code && <span className="sr-only">{code}. </span>}
        {question}
      </legend>
      {helper && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helper}
        </p>
      )}
      <RadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        aria-labelledby={legendId}
        className="grid gap-2 sm:grid-cols-2"
      >
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const checked = value === option.value;
          return (
            <Label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 text-[0.9375rem] font-normal leading-snug transition-colors hover:bg-secondary",
                checked && "border-primary bg-secondary"
              )}
            >
              <RadioGroupItem id={optionId} value={option.value} />
              {option.label}
            </Label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
