import {
  AlertDialog as DeleteAlertDialogRoot,
  DropdownMenuSeparator,
} from "@/react-toolkit/components/ui";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import { UsersTableDto } from "../dtos/users-table-dto";
import { userOptimisticMutationFn } from "../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";
import {
  DTDeleteRowAction,
  DTEditRowAction,
  DTRowDeleteAlert,
  DTViewRowAction,
  DataTableRowActions,
} from "@/react-toolkit/components/data-table";

interface UsersTableRowActionsProps {
  /** The ID of the row */
  rowId: string;
}

/**
 * Renders the actions for a table row in the users table.
 *
 * @param {UsersTableRowActionsProps} props - The component props.
 * @returns {JSX.Element} The rendered row actions component for users table.
 */
export const UsersTableRowActions = ({ rowId }: UsersTableRowActionsProps) => {
  // Get mutation function to delete the user
  const { mutate: deleteUser } = useListOptimisticMutation<
    string,
    UsersTableDto | boolean,
    UsersTableDto
  >(userOptimisticMutationFn, DATA_QUERY_KEY);

  // Return the component
  return (
    // Root component for delete alert dialog
    <DeleteAlertDialogRoot>
      {/* Dropdown menu for user table row action */}
      <DataTableRowActions>
        {/* Opens crud dialog to view the user details */}
        <DTViewRowAction rowId={rowId} />

        {/* Opens crud dialog to update user details */}
        <DTEditRowAction rowId={rowId} />

        {/* DropdownMenuSeparator component */}
        <DropdownMenuSeparator />

        {/* Triggers User delete alert dialog  */}
        <DTDeleteRowAction />
      </DataTableRowActions>

      {/* Content of delete alert dialog  */}
      <DTRowDeleteAlert
        description="This action cannot be undone. Are you sure you want to delete this user?"
        confirmText="Yes, delete user"
        rowDeleteMutateFn={() =>
          deleteUser({
            id: rowId,
            payload: rowId,
            crudAction: "delete",
          })
        }
      />
    </DeleteAlertDialogRoot>
  );
};
