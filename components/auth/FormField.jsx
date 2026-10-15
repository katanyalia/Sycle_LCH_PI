import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Kolom formulir dengan label, petunjuk, dan pesan error yang terhubung (aksesibilitas, Lampiran B "Validation").
export function FormField({ id, label, error, hint, ...inputProps }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} className="h-11 text-base" {...inputProps} />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-blush px-3 py-2 text-sm font-medium">
      {message}
    </p>
  );
}
