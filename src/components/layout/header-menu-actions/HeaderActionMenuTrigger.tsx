import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuTrigger } from "@aventisia/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export const HeaderActionMenuTrigger = () => {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon8" }),
        "hover:bg-white/10",
      )}
    >
      <EllipsisVerticalIcon className="h-5 w-5 text-primary-foreground" />
      <span className="sr-only">Open menu</span>
    </DropdownMenuTrigger>
  );
};
