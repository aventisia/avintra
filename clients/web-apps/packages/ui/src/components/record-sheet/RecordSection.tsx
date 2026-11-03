import type { ReactNode } from "react";

import { cn } from "@/ui/lib";

import { recordLabelClass } from "./record-label-class";

type RecordSectionProps = {
  title: string;
  count?: number;
  /** Right-aligned heading slot, for example a copy or open link. */
  action?: ReactNode;
  children: ReactNode;
};

/**
 * Titled block under a record summary, with an optional count and heading action.
 */
export const RecordSection = ({ title, count, action, children }: RecordSectionProps) => (
  <section className="space-y-2">
    <div className="flex min-h-[18px] items-center justify-between gap-3">
      <h3 className={cn("flex items-center gap-2", recordLabelClass, "text-[11px]")}>
        {title}
        {count !== undefined && (
          <span className="grid h-[18px] min-w-[18px] place-items-center rounded-sm bg-sunken px-1 text-[10.5px] tabular-nums text-ink-2 ring-1 ring-line">
            {count}
          </span>
        )}
      </h3>
      {action}
    </div>
    {children}
  </section>
);

export const RecordList = ({ children }: { children: ReactNode }) => (
  <ul className="divide-y divide-line overflow-hidden rounded-lg bg-popover ring-1 ring-line">
    {children}
  </ul>
);

export const RecordListItem = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <li className={cn("flex items-center gap-3 p-3", className)}>{children}</li>;

/**
 * Bordered box for a section's free-form content, for example remarks or a JSON payload.
 */
export const RecordPanel = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("rounded-lg bg-popover px-4 py-3 ring-1 ring-line", className)}>
    {children}
  </div>
);

/**
 * Dashed placeholder for a section with nothing to list.
 */
export const RecordEmpty = ({ mark, children }: { mark?: ReactNode; children: ReactNode }) => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong/50 px-4 py-6 text-center">
    {mark}
    <p className="text-[12.5px] text-muted-foreground">{children}</p>
  </div>
);
