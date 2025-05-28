import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PopoverTrigger } from "@aventisia/ui/popover";
import { ChevronDownIcon } from "lucide-react";

export const FlowVersionsTrigger = () => {
  return (
    <Tooltip content={"Versions"}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "ml-3 h-6 w-auto gap-1 rounded-xl border-none bg-white/10 px-3 py-1.5 font-medium text-white hover:bg-white/10",
        )}
      >
        <span className="text-primary-foreground">Version 1 </span>
        <ChevronDownIcon className="h-4 w-4 text-primary-foreground" />
      </PopoverTrigger>
    </Tooltip>
  );
};
