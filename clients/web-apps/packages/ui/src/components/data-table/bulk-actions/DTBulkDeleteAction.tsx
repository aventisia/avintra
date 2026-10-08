import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";

import { LockedActionTooltip, useActionLock } from "@/ui/components/action-lock";
import { buttonVariants } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

const DTBulkDeleteAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, disabled, ...props }, ref) => {
  const { locked } = useActionLock();

  const button = (
    <button
      className={cn(
        buttonVariants({ variant: "caution", size: "xs" }),
        "group gap-2 text-sm tracking-wide",
        className,
      )}
      {...props}
      disabled={disabled || locked}
      ref={ref}
    >
      <TrashIcon
        className={cn(
          "mb-[2px] h-4 w-4 text-destructive group-hover:text-white group-focus:text-white",
        )}
      />
      Delete
    </button>
  );

  return <LockedActionTooltip>{button}</LockedActionTooltip>;
});

DTBulkDeleteAction.displayName = "DTBulkDeleteAction";

export { DTBulkDeleteAction };
