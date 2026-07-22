import { cn } from "@avplatform/ui/lib";
import React from "react";

/**
 * A minimal footer component that uses `React.forwardRef` to allow passing a ref to the root `<div>` element.
 * This component is styled as a flex container with centered content and optional additional classes.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The props for the `<div>` element, including optional `className`.
 * @param {string} [props.className] - Additional CSS classes to apply to the footer.
 * @param {React.Ref<HTMLDivElement>} ref - A ref to the root `<div>` element.
 *
 * @returns {JSX.Element} A styled `<div>` element representing the minimal footer.
 */
const MinimalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center space-x-2 px-3 pb-1 text-xs text-muted-foreground xs:pb-0",
          className,
        )}
        {...props}
      />
    );
  },
);

MinimalFooter.displayName = "MinimalFooter";

export { MinimalFooter };
