import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export const HeaderActionMenuTrigger = () => {
  return (
    <Tooltip content="More">
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon8" }), "hover:bg-hover")}
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-ink-2" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
    </Tooltip>
  );
};
