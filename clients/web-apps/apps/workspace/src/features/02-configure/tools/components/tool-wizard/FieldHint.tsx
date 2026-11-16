import type { ReactNode } from "react";

/**
 * Muted helper text under a tool wizard field.
 */
export const FieldHint = ({ children }: { children: ReactNode }) => (
  <p className="pt-1.5 text-[12px] leading-4 text-muted-foreground">{children}</p>
);
