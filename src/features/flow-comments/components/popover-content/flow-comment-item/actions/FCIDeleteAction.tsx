import { cn } from "@/react-toolkit/lib/utils";
import { AlertDialogTrigger } from "@/react-toolkit/ui/alert-dialog";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { TrashIcon } from "@heroicons/react/24/outline";

/**
 * Renders the delete action for a flow comment item.
 * This component displays a dropdown menu item with a delete button.
 */
export const FCIDeleteAction = () => {
  return (
    <DropdownMenuItem asChild>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "dropdownCautionItem" }),
          "group h-7 !px-[0.3rem] text-xs",
        )}
      >
        <TrashIcon className="mb-[2px] h-3.5 w-3.5 text-destructive group-focus:text-white" />
        Delete
      </AlertDialogTrigger>
    </DropdownMenuItem>
  );
};
