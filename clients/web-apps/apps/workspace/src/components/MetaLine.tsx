import { cn } from "@avplatform/ui/lib";
import { Fragment, type ReactNode } from "react";

interface MetaLineProps {
  items: ReactNode[];
  className?: string;
  dotClassName?: string;
}

/**
 * One truncating line of details separated by dots; empty items are skipped.
 */
export const MetaLine = ({ items, className, dotClassName }: MetaLineProps) => (
  <span className={cn("block truncate", className)}>
    {items.filter(Boolean).map((item, index) => (
      <Fragment key={index}>
        {index > 0 && (
          <span
            aria-hidden="true"
            className={cn(
              "mx-1.5 inline-block size-[3px] rounded-full bg-slate-300 align-middle",
              dotClassName,
            )}
          />
        )}
        {item}
      </Fragment>
    ))}
  </span>
);
