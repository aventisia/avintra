import { cn } from "@avplatform/ui/lib";
import type { ComponentPropsWithoutRef } from "react";

import { useIsInsideCrudDialog } from "@/ui/components/crud-dialog/CrudDialogContext";

/**
 * Props for the {@link ViewContainer} component.
 *
 * Extends native `<div>` props so standard container attributes can be
 * forwarded to the outer wrapper.
 */
type ViewContainerProps = ComponentPropsWithoutRef<"div">;

/**
 * Generic section wrapper for entity read-view containers.
 *
 * Use this when rendering grouped record details such as runtime,
 * connection metadata, or audit trail information.
 */
export const ViewContainer = ({ children, className, ...props }: ViewContainerProps) => {
  const isInDialog = useIsInsideCrudDialog();

  return (
    <div
      className={cn("space-y-4 px-3 pb-4 pt-1", isInDialog && "px-0 pb-1", className)}
      {...props}
    >
      {children}
    </div>
  );
};
