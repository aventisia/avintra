import type { ReactNode } from "react";

/**
 * Keyboard hint chip for picker and dialog footers.
 */
export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-popover px-1 font-sans text-[10px] font-medium text-muted-foreground ring-1 ring-line">
    {children}
  </kbd>
);
