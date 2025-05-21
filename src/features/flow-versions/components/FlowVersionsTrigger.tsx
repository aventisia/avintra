import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";

export const FlowVersionsTrigger = () => {
  return (
    <Tooltip content={"Versions"}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon7" }),
          "hidden mlg:flex",
          "aria-[expanded=true]:bg-slate-100",
        )}
      >
        <Square3Stack3DIcon className="h-[1.1rem] w-[1.1rem] text-[--icon-color]" />
      </PopoverTrigger>
    </Tooltip>
  );
};
