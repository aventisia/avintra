import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { PopoverTrigger } from "@/react-toolkit/ui/popover/Popover";
import { PlusIcon } from "@heroicons/react/24/outline";

/**
 * Renders a flow controls trigger component.
 * This component displays a button with a plus icon that opens a menu when clicked.
 *
 * Note: Activity selector trigger for flow controls panel only
 */
export const FlowControlsTrigger = () => {
  return (
    <Tooltip content="Add activity">
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon6" }),
          "rounded-md",
          "aria-[expanded=true]:bg-muted",
        )}
      >
        <PlusIcon className="h-4 w-4 text-[--icon-color]" />
        <span className="sr-only">Open menu</span>
      </PopoverTrigger>
    </Tooltip>
  );
};
