import { cn } from "@avplatform/ui/lib";
import React from "react";

/**
 * A React functional component that renders a header container with a sticky position
 * and customizable styles. It uses `React.forwardRef` to forward
 * the `ref` to the underlying `<div>` element.
 *
 * @typeParam HTMLDivElement - The type of the DOM element the ref will point to.
 * @typeParam React.HTMLAttributes<HTMLDivElement> - The type of props accepted by the component.
 *
 * @param {Object} props - The props for the component.
 * @param {string} [props.className] - Additional class names to apply to the container.
 * @param {React.Ref<HTMLDivElement>} ref - A ref to the underlying `<div>` element.
 *
 * @returns {JSX.Element} A styled `<div>` element that serves as a header container.
 */
const HeaderContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("sticky top-0 z-10 w-full bg-bg p-[var(--header-padding)] pb-0", className)}
        {...props}
      />
    );
  },
);

HeaderContainer.displayName = "HeaderContainer";

export { HeaderContainer };
