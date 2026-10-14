import { cn } from "@avplatform/ui/lib";
import React from "react";

/** Renders the app header bar with the branded gradient background. */
const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center rounded-xl bg-gradient-to-r from-[color-mix(in_srgb,var(--primary)_75%,var(--secondary))] via-primary to-[color-mix(in_srgb,var(--primary)_75%,var(--secondary))] p-5 shadow xs:pl-3 xs:pr-3",
          className,
        )}
        {...props}
      />
    );
  },
);

Header.displayName = "Header";

export { Header };
