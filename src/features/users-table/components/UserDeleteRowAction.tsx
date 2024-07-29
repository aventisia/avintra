import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { TrashIcon } from "@heroicons/react/24/outline";
import { UsersTableDto } from "../dtos/users-table-dto";
import { userOptimisticMutationFn } from "../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";

interface DeleteActionProps {
  userId: string;
}

/**
 * Renders the delete action for a user row item.
 * This component displays a dropdown menu item with a delete button.
 */
export const UserDeleteRowAction = ({ userId }: DeleteActionProps) => {
  // Get showAlert handler
  const { showAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the user
  const { mutate: deleteUser } = useListOptimisticMutation<
    string,
    UsersTableDto | boolean,
    UsersTableDto
  >(userOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "group h-8")}
      onClick={() => {
        showAlertDialog({
          confirmActionFn: () => {
            // Delete the flow
            deleteUser({
              id: userId,
              payload: userId,
              crudAction: "delete",
            });
          },
          title: "Delete user",
          description:
            "This action cannot be undone. Are you sure you want to delete this user?",
          confirmBtnText: "Yes, delete user",
        });
      }}
    >
      <TrashIcon className="mb-[2px] h-4 w-4 text-destructive group-focus:text-white" />
      Delete
    </DropdownMenuItem>
  );
};
