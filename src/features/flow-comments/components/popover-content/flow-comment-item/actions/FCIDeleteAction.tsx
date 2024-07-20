import {
  AlertDialogTrigger,
  buttonVariants,
  DropdownMenuItem,
} from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
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
          "text-xs group h-7 !px-[0.3rem]",
        )}
      >
        <TrashIcon className="mb-[2px] h-3.5 w-3.5 text-destructive group-focus:text-white" />
        Delete
      </AlertDialogTrigger>
    </DropdownMenuItem>
  );
};
