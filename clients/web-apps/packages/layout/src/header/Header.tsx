import { cn } from "@avplatform/ui/lib";
import React from "react";

/** Renders the app header bar on `bg`. */
const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center gap-3 border-b border-line bg-bg pl-4 pr-3",
          className,
        )}
        {...props}
      />
    );
  },
);

Header.displayName = "Header";

export { Header };
