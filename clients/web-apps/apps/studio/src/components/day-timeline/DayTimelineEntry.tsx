import { cn } from "@avplatform/ui/lib";
import { useEffect, useRef } from "react";

const ACCORDION_SETTLE_MS = 150;

type DayTimelineEntryProps = {
  isSelected: boolean;
  onSelect: () => void;
  /** Classes for the 6px marker on the rail (colour and shape). */
  markerClassName: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** Right-aligned value on the title line. */
  aside?: React.ReactNode;
  /** Controls revealed on hover, kept outside the row button. */
  actions?: React.ReactNode;
};

/** Selectable timeline row with a rail marker, two text lines, and optional hover actions. */
export const DayTimelineEntry = ({
  isSelected,
  onSelect,
  markerClassName,
  title,
  subtitle,
  aside,
  actions,
}: DayTimelineEntryProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isSelected) return;

    const timeout = setTimeout(() => {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, ACCORDION_SETTLE_MS);

    return () => clearTimeout(timeout);
  }, [isSelected]);

  const selectOnActionsTriggerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.target as Node)) onSelect();
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-current={isSelected ? "true" : undefined}
        onClick={onSelect}
        className={cn(
          "grid w-full grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-focus",
          isSelected
            ? "bg-fill ring-1 ring-inset ring-line-strong/50"
            : "hover:bg-hover group-hover/entry:bg-hover",
          actions && "pr-10",
        )}
      >
        <span aria-hidden="true" className="row-span-2 flex justify-center">
          <span className={cn("size-1.5 shrink-0", markerClassName)} />
        </span>

        <span
          className={cn(
            "truncate text-[12px]/[18px] tabular-nums",
            isSelected ? "font-medium text-ink" : "text-ink-2",
          )}
        >
          {title}
        </span>
        <span className="text-right font-mono text-[11.5px]/[18px] tabular-nums text-muted-foreground">
          {aside}
        </span>

        <span className="col-span-2 flex min-w-0 items-center gap-1.5 text-[11px] leading-4">
          {subtitle}
        </span>
      </button>

      {actions ? (
        <div
          onClick={selectOnActionsTriggerClick}
          className={cn(
            "absolute right-2 top-[23px] -translate-y-1/2 transition-opacity focus-within:opacity-100 group-hover/entry:opacity-100 has-[[data-state=open]]:opacity-100",
            isSelected ? "opacity-100" : "opacity-0",
          )}
        >
          {actions}
        </div>
      ) : null}
    </>
  );
};
