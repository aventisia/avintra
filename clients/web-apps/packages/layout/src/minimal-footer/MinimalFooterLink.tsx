import { cn } from "@avplatform/ui/lib";
import React from "react";

/**
 * A React functional component that renders an anchor (`<a>`) element with customizable
 * styles and props. This component uses `React.forwardRef` to forward the `ref` to the
 * underlying anchor element, allowing for direct DOM manipulation or integration with
 * other libraries.
 *
 * @typeParam HTMLAnchorElement - The type of the DOM element being referenced.
 * @typeParam React.AnchorHTMLAttributes<HTMLAnchorElement> - The type of props that
 * the component accepts, which are standard anchor element attributes.
 *
 * @param {Object} props - The props passed to the component.
 * @param {string} [props.className] - Additional CSS classes to apply to the anchor element.
 * @param {React.Ref<HTMLAnchorElement>} ref - A ref to the anchor element.
 *
 * @returns {JSX.Element} A styled anchor element with hover effects.
 *
 * @example
 * ```tsx
 * <MinimalFooterLink href="https://example.com" className="text-primary-text">
 *   Example Link
 * </MinimalFooterLink>
 * ```
 */
const MinimalFooterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn("underline-offset-4 hover:text-ink hover:underline", className)}
      {...props}
    />
  );
});

MinimalFooterLink.displayName = "MinimalFooterLink";

export { MinimalFooterLink };
