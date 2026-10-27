import type { PropsWithChildren } from "react";

/** Component renders a simple and small footer with copyright information
 * and Terms of service, Privecy policy links */
const MinimalFooter = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex items-center justify-center gap-2 px-3 pb-1 text-hint text-muted-foreground xs:pb-0">
      {children ?? (
        <>
          <a
            href={`${import.meta.env.VITE_MARKETING_URL}/terms-of-service`}
            className="underline-offset-4 hover:text-ink hover:underline"
          >
            Terms of Service
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={`${import.meta.env.VITE_MARKETING_URL}/privacy-policy`}
            className="underline-offset-4 hover:text-ink hover:underline"
          >
            Privacy Policy
          </a>
        </>
      )}
    </div>
  );
};

export { MinimalFooter };
