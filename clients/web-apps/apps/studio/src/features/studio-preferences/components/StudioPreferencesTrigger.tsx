import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

import { POPOVER_HEADING } from "../constants";

export const StudioPreferencesTrigger = () => {
  return (
    <Tooltip content={POPOVER_HEADING}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          "hover:bg-white/10",
          "hidden mlg:flex",
          "aria-[expanded=true]:bg-white/10",
        )}
      >
        <AdjustmentsHorizontalIcon className="h-[1.1rem] w-[1.1rem] text-white/80" />
      </PopoverTrigger>
    </Tooltip>
  );
};
