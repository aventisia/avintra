import type { PropsWithChildren } from "react";

import { MinimalFooterLink } from "./MinimalFooterLink";
import { PRIVACY_URL, TERMS_URL } from "./legalLinks";

/** A small footer with Terms of Service and Privacy Policy links, or the given children. */
const MinimalFooter = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex items-center justify-center gap-2 px-3 pb-1 text-hint text-muted-foreground xs:pb-0">
      {children ?? (
        <>
          <MinimalFooterLink href={TERMS_URL}>Terms of Service</MinimalFooterLink>
          <span aria-hidden="true">·</span>
          <MinimalFooterLink href={PRIVACY_URL}>Privacy Policy</MinimalFooterLink>
        </>
      )}
    </div>
  );
};

export { MinimalFooter };
