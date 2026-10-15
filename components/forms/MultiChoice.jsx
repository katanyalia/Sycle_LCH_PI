"use client";

import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toggleMultiChoice } from "@/lib/forms/choices";
import { cn } from "@/lib/utils";

// Pilihan ganda dengan opsi eksklusif (opsi bertanda `exclusive: true`).
export function MultiChoice({ code, question, helper, options, value = [], onChange, className }) {
  const id = useId();
  const exclusiveValues = options.filter((option) => option.exclusive).map((option) => option.value);

  return (
    <fieldset className={cn("space-y-3", className)} aria-describedby={`${id}-help`}>
      <legend className="text-lg font-semibold">
        {code && <span className="sr-only">{code}. </span>}
        {question}
      </legend>
      <p id={`${id}-help`} className="text-sm text-muted-foreground">
        {helper ?? "Kamu boleh memilih lebih dari satu."}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const checked = value.includes(option.value);
          return (
            <Label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 text-[0.9375rem] font-normal leading-snug transition-colors hover:bg-secondary",
                checked && "border-primary bg-secondary"
              )}
            >
              <Checkbox
                id={optionId}
                checked={checked}
                onCheckedChange={() => onChange(toggleMultiChoice(value, option.value, exclusiveValues))}
              />
              {option.label}
            </Label>
          );
        })}
      </div>
    </fieldset>
  );
}
