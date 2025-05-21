import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { POPOVER_HEADING } from "../constants";

export const StudioPreferencesTrigger = () => {
  return (
    <Tooltip content={POPOVER_HEADING}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon7" }),
          "hidden mlg:flex",
          "aria-[expanded=true]:bg-slate-100",
        )}
      >
        <AdjustmentsHorizontalIcon className="h-[1.1rem] w-[1.1rem] text-[--icon-color]" />
      </PopoverTrigger>
    </Tooltip>
  );
};
