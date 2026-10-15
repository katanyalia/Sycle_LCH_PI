import { cn } from "@/lib/utils";

// Tata letak halaman desktop-first (wireframe): kolom konteks kiri (opsional),
// konten utama, dan panel pendukung kanan (opsional: status, metadata, privasi).
// Di tablet/ponsel kolom bertumpuk tanpa menghilangkan isinya (Master Draft 8.4).
export function PageShell({ title, description, eyebrow, aside, panel, children, className }) {
  const hasAside = Boolean(aside);
  const hasPanel = Boolean(panel);

  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8", className)}>
      <div
        className={cn(
          "grid gap-6",
          hasAside && hasPanel && "lg:grid-cols-[14rem_minmax(0,1fr)_18rem]",
          hasAside && !hasPanel && "lg:grid-cols-[14rem_minmax(0,1fr)]",
          !hasAside && hasPanel && "lg:grid-cols-[minmax(0,1fr)_20rem]"
        )}
      >
        {hasAside && <aside className="order-2 lg:order-1">{aside}</aside>}

        <section className="order-1 min-w-0 space-y-6 lg:order-2" aria-labelledby="judul-halaman">
          <header className="space-y-2">
            {eyebrow && <p className="text-sm font-semibold text-primary-pressed">{eyebrow}</p>}
            <h1 id="judul-halaman" className="text-2xl font-bold tracking-tight lg:text-3xl">
              {title}
            </h1>
            {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
          </header>
          {children}
        </section>

        {hasPanel && (
          <aside className="order-3" aria-label="Panel pendukung">
            {panel}
          </aside>
        )}
      </div>
    </div>
  );
}

export function SupportPanel({ title, children }) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold text-primary-pressed">{title}</h2>
      <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
