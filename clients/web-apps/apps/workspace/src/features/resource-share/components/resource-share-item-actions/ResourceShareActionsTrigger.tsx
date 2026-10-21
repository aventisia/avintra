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
        "hover:bg-accent",
        "data-[state=open]:bg-accent data-[state=open]:opacity-100",
      )}
    >
      <EditIcon className="h-4 w-4" />
    </DropdownMenuTrigger>
  );
};
