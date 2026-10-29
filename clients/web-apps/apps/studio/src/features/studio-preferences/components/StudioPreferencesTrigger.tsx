import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { SlidersHorizontalIcon } from "lucide-react";

import { POPOVER_HEADING } from "../constants";

export const StudioPreferencesTrigger = () => {
  return (
    <Tooltip content={POPOVER_HEADING}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          "hidden md:flex",
          "hover:bg-hover",
          "aria-[expanded=true]:bg-hover",
        )}
      >
        <SlidersHorizontalIcon className="h-[1.1rem] w-[1.1rem] text-ink-2" />
      </PopoverTrigger>
    </Tooltip>
  );
};
