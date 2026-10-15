import {
  CircleAlert,
  CircleCheck,
  Clock,
  Info,
  LoaderCircle,
  LockKeyhole,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Keadaan antarmuka wajib (Master Draft 8.2.3, Lampiran B wireframe).
// Status selalu disertai teks; ikon hanya pelengkap (tidak bergantung pada warna/ikon saja).
const VARIANTS = {
  info: { icon: Info, className: "bg-powder" },
  loading: { icon: LoaderCircle, className: "bg-lavender", iconClass: "animate-spin" },
  empty: { icon: Info, className: "bg-card" },
  error: { icon: CircleAlert, className: "bg-blush" },
  offline: { icon: WifiOff, className: "bg-blush" },
  stale: { icon: Clock, className: "bg-blush" },
  partial: { icon: CircleAlert, className: "bg-powder" },
  success: { icon: CircleCheck, className: "bg-sage" },
  restricted: { icon: LockKeyhole, className: "bg-lavender" },
};

export function StatusMessage({ variant = "info", title, children, action, className }) {
  const { icon: Icon, className: variantClass, iconClass } = VARIANTS[variant] ?? VARIANTS.info;
  const live = variant === "error" || variant === "success" ? "polite" : undefined;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={live}
      className={cn("flex gap-3 rounded-xl border p-4", variantClass, className)}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0 text-primary-pressed", iconClass)} aria-hidden="true" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-sm text-foreground/90">{children}</div>}
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}
