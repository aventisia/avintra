import { cn } from "@avplatform/ui/lib";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Props for the {@link ViewInfoRowsCard} component.
 *
 * Extends native `<div>` props so standard container attributes can be
 * forwarded to the outer section card.
 */
type ViewInfoRowsCardProps = ComponentPropsWithoutRef<"div"> & {
  /** Section title shown in uppercase style. */
  title: string;
  /** Optional icon rendered before the section title. */
  icon?: ReactNode;
  /** Optional action element rendered at the right end of the header. */
  action?: ReactNode;
  /** Additional classes for the section title. */
  headerClassName?: string;
  /** Additional classes for the body wrapper. */
  bodyClassName?: string;
};

/**
 * Generic section wrapper for entity read-view cards.
 *
 * Use this when rendering grouped record details such as runtime,
 * connection metadata, or audit trail information.
 */
export const ViewInfoRowsCard = ({
  title,
  icon,
  action,
  children,
  className,
  headerClassName,
  bodyClassName,
  ...props
}: ViewInfoRowsCardProps) => {
  return (
    <div className={cn("rounded-lg border bg-card px-4 pb-2 pt-4", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-between gap-2 text-2xs font-medium uppercase tracking-wider text-foreground",
          headerClassName,
        )}
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {action}
      </div>
      <div className={cn("space-y-1 pt-3", bodyClassName)}>{children}</div>
    </div>
  );
};
