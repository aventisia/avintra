import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { EllipsisIcon } from "lucide-react";

export const ActionsTrigger = () => {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon7" }),
        "hover:bg-hover",
        "data-[state=open]:bg-hover data-[state=open]:opacity-100",
      )}
    >
      <EllipsisIcon className="h-4 w-4 text-[--icon-color]" />
    </DropdownMenuTrigger>
  );
};
