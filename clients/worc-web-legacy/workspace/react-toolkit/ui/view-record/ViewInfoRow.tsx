import { FALLBACK_VALUE } from "@aventisia/ui/constants";
import { cn } from "@aventisia/ui/lib";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Props for the {@link ViewInfoRow} component.
 *
 * Extends native `<div>` props so standard container attributes can be
 * forwarded to the outer row element.
 */
type ViewInfoRowProps = ComponentPropsWithoutRef<"div"> & {
  /** Left-side text that names the value being displayed. */
  label: string;
  /** Right-side content for the row. Accepts plain text or JSX such as badges. */
  value: ReactNode;
  /** Enables monospace rendering for IDs, hashes, and technical values. */
  mono?: boolean;
  /** Additional classes for the value container. */
  valueClassName?: string;
};

/**
 * Read-only key/value row for record detail cards.
 *
 * Use this inside section bodies where each line represents a single field.
 * Prefer `mono` for machine-oriented values like connection IDs or GUIDs.
 */
export const ViewInfoRow = ({
  label,
  value,
  mono,
  className,
  valueClassName,
  ...props
}: ViewInfoRowProps) => {
  return (
    <div
      className={cn("grid grid-cols-[7.2rem_1fr] items-center gap-3 px-0.5 py-1.5", className)}
      {...props}
    >
      <p className="text-muted-foreground text-xs">{label}</p>
      <div
        className={cn(
          "min-w-0 text-right text-xs font-medium",
          mono ? "break-all font-mono" : "truncate",
          valueClassName,
        )}
      >
        {value !== null && value !== undefined && value !== "" ? value : FALLBACK_VALUE}
      </div>
    </div>
  );
};
