import { cn } from "@avplatform/ui/lib";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Props for the {@link ViewDefaultCard} component.
 *
 * Extends native `<div>` props so standard container attributes can be
 * forwarded to the outer profile card.
 */
type ViewDefaultCardProps = ComponentPropsWithoutRef<"div">;

/**
 * Generic section wrapper for entity read-view cards.
 *
 * Use this when rendering grouped record details such as runtime,
 * connection metadata, or audit trail information.
 */
export const ViewDefaultCard = ({ children, className, ...props }: ViewDefaultCardProps) => {
  return (
    <div className={cn("rounded-lg space-y-4 border bg-card px-4 pt-4 pb-4", className)} {...props}>
      {children}
    </div>
  );
};
