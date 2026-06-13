import { type ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  /** Optional content rendered on the right of the header (e.g. action buttons). */
  headerActions?: ReactNode;
  /** Section padding. Defaults to standard vertical rhythm; override for sections
   *  that need different top spacing (e.g. the first section after the Hero). */
  className?: string;
}

/**
 * Reusable page-section layout: a full-width `<section>` with a centered
 * max-width container, a title/description header, and an optional header
 * actions slot. Centralizes the layout markup shared by every content section.
 */
export function Section({
  id,
  title,
  description,
  children,
  headerActions,
  className = "py-16 md:py-20",
}: SectionProps) {
  return (
    <section id={id} className={className}>
      <div className="page-container flex flex-col gap-8">
        {headerActions ? (
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            {headerActions}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
