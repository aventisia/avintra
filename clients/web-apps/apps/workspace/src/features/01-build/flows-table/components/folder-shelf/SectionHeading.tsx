import type { ReactNode } from "react";

type SectionHeadingProps = {
  id?: string;
  title: string;
  count: number;
  hint?: ReactNode;
  actions?: ReactNode;
};

/**
 * Small uppercase heading with a count pill, used above the folders shelf and the agents list.
 */
export const SectionHeading = ({ id, title, count, hint, actions }: SectionHeadingProps) => (
  <div className="flex min-h-7 items-center justify-between gap-3">
    <h2
      id={id}
      className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
    >
      {title}
      <span className="rounded-full bg-muted px-1.5 py-px text-[11px] tabular-nums tracking-normal text-slate-600">
        {count}
      </span>
      {hint && (
        <span className="truncate text-[12px] font-normal normal-case tracking-normal text-slate-400">
          {hint}
        </span>
      )}
    </h2>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
