import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { PopoverTrigger } from "@/react-toolkit/ui/popover/Popover";
import { PlusIcon } from "@heroicons/react/24/outline";
import { memo } from "react";

/**
 * Renders a plus button trigger component.
 *
 * Note: Node selector trigger to open from the output handle only
 */
export const OutputHandleTrigger = memo(() => {
  return (
    <PopoverTrigger
      className={cn(
        buttonVariants({ size: "icon5" }),
        "z-10 rounded-full bg-primary opacity-80 hover:opacity-100",
        "aria-[expanded=true]:opacity-100",
      )}
    >
      <PlusIcon className="h-3 w-3 stroke-[3] text-white" />
      <span className="sr-only">Open menu</span>
    </PopoverTrigger>
  );
});
