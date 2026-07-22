import { cn } from "@avplatform/ui/lib";
import React from "react";

/**
 * A React functional component that renders a customizable header element.
 *
 * This component uses `React.forwardRef` to forward a ref to the underlying
 * `<header>` element, allowing for direct DOM manipulation or integration
 * with other libraries.
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - The props for the header component.
 * @param {string} [props.className] - Additional class names to apply to the header element.
 * @param {React.Ref<HTMLDivElement>} ref - A ref to the underlying `<header>` element.
 *
 * @returns {JSX.Element} A styled `<header>` element with customizable attributes.
 */
const Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center rounded-xl bg-gradient-to-r from-[#12102d] via-[#2c276c] to-[#12102d] p-5 shadow xs:pl-4 xs:pr-3",
          className,
        )}
        {...props}
      />
    );
  },
);

Header.displayName = "Header";

export { Header };
