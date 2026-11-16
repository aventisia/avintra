import { PlusIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type FieldSectionProps = {
  title: string;
  count: number;
  addLabel: string;
  emptyTitle: string;
  emptyHint: string;
  onAdd: () => void;
  children: ReactNode;
};

/**
 * A titled list of input or output fields with an add button and an empty state.
 */
export const FieldSection = ({
  title,
  count,
  addLabel,
  emptyTitle,
  emptyHint,
  onAdd,
  children,
}: FieldSectionProps) => (
  <section aria-label={title}>
    <div className="mb-2 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-mono text-label uppercase text-muted-foreground">
        {title}
        <span className="rounded-full bg-sunken px-1.5 text-[11px] tabular-nums text-ink-2 ring-1 ring-line">
          {count}
        </span>
      </h3>
      <button
        type="button"
        onClick={onAdd}
        className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[12.5px] font-medium text-primary-text outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-focus"
      >
        <PlusIcon className="size-3.5" />
        {addLabel}
      </button>
    </div>

    {count === 0 ? (
      <div className="rounded-lg border border-dashed border-line bg-sunken px-6 py-6 text-center">
        <p className="text-[13px] font-medium text-ink-2">{emptyTitle}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{emptyHint}</p>
      </div>
    ) : (
      <ul className="space-y-2.5">{children}</ul>
    )}
  </section>
);
