import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { EllipsisIcon } from "lucide-react";

export const FLIActionsTrigger = () => {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon7" }),
        "hover:bg-hover",
        //"opacity-0 group-hover/CommandItem:opacity-100 group-data-[selected]/CommandItem:opacity-100",
        "data-[state=open]:bg-hover data-[state=open]:opacity-100",
      )}
    >
      <EllipsisIcon className="h-4 w-4 text-[--icon-color]" />
    </DropdownMenuTrigger>
  );
};
