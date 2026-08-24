import { MinimalFooter, MinimalFooterLink } from "@avplatform/layout";
import { DotSeparator } from "@avplatform/ui";

/**
 * A functional React component that renders a minimal footer for the application.
 *
 * The footer includes links to the "Terms of Service" and "Privacy Policy" pages,
 * with URLs dynamically constructed using environment variables.
 */
const AppMinimalFooter = () => {
  return (
    <MinimalFooter>
      <MinimalFooterLink href={`${import.meta.env.VITE_MARKETING_URL}/terms-of-service`}>
        Terms of Service
      </MinimalFooterLink>
      <DotSeparator />
      <MinimalFooterLink href={`${import.meta.env.VITE_MARKETING_URL}/privacy-policy`}>
        Privacy Policy
      </MinimalFooterLink>
    </MinimalFooter>
  );
};

export { AppMinimalFooter };
