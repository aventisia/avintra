import { cn } from "@/react-toolkit/lib/utils";
import { memo } from "react";

/**
 * Renders a header container for the Node component.
 */
export const NodeHeader = memo(
  ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
      <div
        {...props}
        className={cn("flex items-center justify-between gap-3", className)}
      >
        {children}
      </div>
    );
  },
);
