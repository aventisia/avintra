import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuTrigger } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

/**
 * Renders the actions trigger for the flow comment item.
 * This component displays an ellipsis icon that opens a dropdown menu when clicked.
 */
export const FCIActionsTrigger = () => {
  return (
    <DropdownMenuTrigger
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon6" }),
        "absolute right-3 top-[0.45rem] z-10 group-hover:opacity-100",
        "data-[state=open]:bg-muted data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
      )}
    >
      <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
      <span className="sr-only">Open menu</span>
    </DropdownMenuTrigger>
  );
};
