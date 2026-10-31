import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import type { ComponentProps } from "react";

/** Full-width row of the account menu. */
export const AccountMenuAction = ({ className, ...props }: ComponentProps<typeof Button>) => (
  <Button
    variant="ghost"
    className={cn("h-9 justify-start gap-2 rounded-sm align-middle font-normal", className)}
    {...props}
  />
);
