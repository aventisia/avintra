import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuTrigger } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export const HeaderActionMenuTrigger = () => {
  return (
    <Tooltip content="More">
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          "hover:bg-white/10",
        )}
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-white/80" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
    </Tooltip>
  );
};
