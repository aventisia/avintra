import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { EditIcon } from "lucide-react";

/**
 * Renders a dropdown menu trigger for Resource Share user action.
 */
export const ResourceShareActionsTrigger = () => {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon7" }),
        "hover:bg-slate-200",
        "data-[state=open]:bg-slate-200 data-[state=open]:opacity-100",
      )}
    >
      <EditIcon className="h-4 w-4 text-[--icon-color]" />
    </DropdownMenuTrigger>
  );
};
