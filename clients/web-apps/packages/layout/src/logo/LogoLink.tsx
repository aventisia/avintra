import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import React from "react";
import { useShallow } from "zustand/react/shallow";

/**
 * A React functional component that renders an anchor (`<a>`) element styled as a logo link.
 * The component uses `React.forwardRef` to forward the ref to the underlying anchor element.
 *
 * @typeParam HTMLAnchorElement - The type of the HTML element the ref is forwarded to.
 * @typeParam React.AnchorHTMLAttributes<HTMLAnchorElement> - The props type for the anchor element.
 *
 * @param props - The props for the anchor element, including:
 * - `className` (optional): Additional CSS classes to apply to the anchor element.
 * - Any other valid anchor element attributes.
 * @param ref - A React ref that is forwarded to the anchor element.
 *
 * @returns A styled anchor element with a default `href` pointing to the `BASE_URL` environment variable.
 *
 * @example
 * ```tsx
 * import { LogoLink } from './LogoLink';
 *
 * const App = () => (
 *   <LogoLink className="custom-class" target="_blank">
 *     My Logo
 *   </LogoLink>
 * );
 * ```
 */
const LogoLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => {
    // Get the base URL from the environment variables
    const { viteEnvVars } = useBaseLayoutStore(
      useShallow((state) => ({
        viteEnvVars: state.viteEnvVars,
      })),
    );

    return (
      <a
        ref={ref}
        href={viteEnvVars.BASE_URL}
        className={cn("flex items-center justify-center gap-2 font-medium", className)}
        {...props}
      />
    );
  },
);

LogoLink.displayName = "LogoLink";

export { LogoLink };
