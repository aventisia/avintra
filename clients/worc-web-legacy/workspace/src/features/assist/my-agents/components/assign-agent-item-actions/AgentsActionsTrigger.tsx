import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuTrigger } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

export const AgentsActionsTrigger = () => {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon7" }),
        "hover:bg-slate-200",
        "data-[state=open]:bg-slate-200 data-[state=open]:opacity-100",
      )}
    >
      <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
    </DropdownMenuTrigger>
  );
};
