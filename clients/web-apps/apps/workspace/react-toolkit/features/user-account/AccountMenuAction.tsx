import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { type ComponentProps, forwardRef } from "react";

/** Full-width row of the account menu. */
export const AccountMenuAction = forwardRef<HTMLButtonElement, ComponentProps<typeof Button>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        "h-8 justify-start gap-2 rounded-sm px-2 text-body-sm font-normal text-ink hover:bg-hover [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
AccountMenuAction.displayName = "AccountMenuAction";
