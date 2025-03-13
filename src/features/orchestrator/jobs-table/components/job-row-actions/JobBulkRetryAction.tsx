import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import Lucide from "@/react-toolkit/ui/Lucide";
import React from "react";

const JobBulkRetryAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    className={cn(
      buttonVariants({ variant: "ghost", size: "xs" }),
      "group gap-2 text-sm tracking-wide",
      className,
    )}
    {...props}
    ref={ref}
  >
    <Lucide
      icon="RotateCw"
      className={cn("mb-[2px] h-4 w-4 stroke-2 group-focus:text-white")}
    />
    Retry
  </button>
));

JobBulkRetryAction.displayName = "QueueBulkRetryAction";

export { JobBulkRetryAction };
