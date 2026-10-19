import type { ReactNode } from "react";

/**
 * Keyboard hint chip used in the agent picker footer.
 */
export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-popover px-1 font-sans text-[10px] font-medium text-muted-foreground shadow-[0_0_0_1px_rgb(226,232,240),0_1px_0_1px_rgb(241,245,249)]">
    {children}
  </kbd>
);
