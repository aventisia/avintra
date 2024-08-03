import { cn } from "@/react-toolkit/lib/utils";
import { memo } from "react";

/**
 * Renders a label/heading for the Node component.
 */
export const NodeHeading = memo(
  ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    return (
      <h2
        {...props}
        className={cn(
          "grow truncate text-left text-sm font-medium text-slate-900",
          className,
        )}
      >
        {children}
      </h2>
    );
  },
);
