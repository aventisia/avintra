import { cn } from "@avplatform/ui/lib";
import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { EditIcon } from "lucide-react";

export const FUActionsTrigger = () => {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon7" }),
        "hover:bg-slate-200",
        //"opacity-0 group-hover/CommandItem:opacity-100 group-data-[selected]/CommandItem:opacity-100",
        "data-[state=open]:bg-slate-200 data-[state=open]:opacity-100",
      )}
    >
      <EditIcon className="h-4 w-4 text-[--icon-color]" />
    </DropdownMenuTrigger>
  );
};
