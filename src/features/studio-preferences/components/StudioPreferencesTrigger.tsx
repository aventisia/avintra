import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PopoverTrigger } from "@aventisia/ui/popover";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { POPOVER_HEADING } from "../constants";

export const StudioPreferencesTrigger = () => {
  return (
    <Tooltip content={POPOVER_HEADING}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          "hover:bg-white/10",
        )}
      >
        <AdjustmentsHorizontalIcon className="h-[1.1rem] w-[1.1rem] text-primary-foreground" />
      </PopoverTrigger>
    </Tooltip>
  );
};
