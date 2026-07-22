import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";

import { buttonVariants } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";

const DTBulkDeleteAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    className={cn(
      buttonVariants({ variant: "caution", size: "xs" }),
      "group gap-2 text-sm tracking-wide",
      className,
    )}
    {...props}
    ref={ref}
  >
    <TrashIcon
      className={cn(
        "mb-[2px] h-4 w-4 text-destructive group-hover:text-white group-focus:text-white",
      )}
    />
    Delete
  </button>
));

DTBulkDeleteAction.displayName = "DTBulkDeleteAction";

export { DTBulkDeleteAction };
