"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MAIN_NAV, isNavItemActive } from "@/lib/navigation";

// Navigasi horizontal untuk desktop (>= 1024px, Lampiran C wireframe).
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu utama" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {MAIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-[0.9375rem] font-medium transition-colors",
                  active
                    ? "bg-secondary text-primary-pressed"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Navigasi bawah untuk ponsel & tablet: empat tujuan yang sama, area sentuh besar.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {MAIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-center text-xs font-medium leading-tight",
                  active ? "text-primary-pressed" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
