import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Sections are open by default rather than collapsed. A collapsed filter is a
 * filter nobody finds, and there are few enough here that the column still
 * scans in one screen on desktop.
 */
export function FilterSection({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-stone-soft py-4", className)}>
      <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      {hint ? <p className="mt-0.5 text-xs text-ink-soft">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}
