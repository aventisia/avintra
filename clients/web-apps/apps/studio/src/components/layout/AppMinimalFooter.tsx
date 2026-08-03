import { MinimalFooter, MinimalFooterLink } from "@avplatform/layout";
import { DotSeparator } from "@avplatform/ui";

/**
 * A functional React component that renders a minimal footer for the application.
 *
 * The footer includes links to the "Terms of Service" and "Privacy Policy" pages,
 * with URLs dynamically constructed using environment variables.
 *
 * @component
 * @returns {JSX.Element} The rendered minimal footer component.
 *
 * @example
 * // Usage in a parent component
 * <AppMinimalFooter />
 *
 * @remarks
 * - The `VITE_MARKETING_URL` environment variable is used to construct the URLs for the links.
 * - The `DotSeparator` component is used to visually separate the links.
 */
const AppMinimalFooter = () => {
  return (
    <MinimalFooter>
      <MinimalFooterLink href={`${import.meta.env.VITE_MARKETING_URL}/terms-of-service`}>
        Terms of Service
      </MinimalFooterLink>
      <DotSeparator />
      {/* <span className="mx-2 -mt-3.5 text-[1.5rem] text-slate-500">.</span> */}
      <MinimalFooterLink href={`${import.meta.env.VITE_MARKETING_URL}/privacy-policy`}>
        Privacy Policy
      </MinimalFooterLink>
    </MinimalFooter>
  );
};

export { AppMinimalFooter };
