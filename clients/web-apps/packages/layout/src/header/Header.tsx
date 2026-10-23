import { cn } from "@avplatform/ui/lib";
import React from "react";

/** Renders the app header bar. Branding overrides the gradient only when set; otherwise the built-in gradient below (same as before branding existed) applies. */
const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center rounded-xl bg-gradient-to-r from-[var(--header-from,#12102d)] via-[var(--header-via,#2c276c)] to-[var(--header-to,#12102d)] p-5 shadow xs:pl-3 xs:pr-3",
          className,
        )}
        {...props}
      />
    );
  },
);

Header.displayName = "Header";

export { Header };
