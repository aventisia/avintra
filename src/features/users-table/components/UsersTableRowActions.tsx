import {
  UsersTableDto,
  userOptimisticMutationFn,
  DATA_QUERY_KEY,
} from "@/features/users-table";
import { DropdownMenuSeparator } from "@/react-toolkit/components/ui";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import {
  DTDeleteRowAction,
  DTEditRowAction,
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
    <DataTableRowActions>
      {/* Opens crud dialog to view the user details */}
      <DTViewRowAction rowId={rowId} />

      {/* Opens crud dialog to update user details */}
      <DTEditRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <DTDeleteRowAction
        rowDeleteMutateFn={() =>
          deleteUser({
            id: rowId,
            payload: rowId,
            crudAction: "delete",
          })
        }
        description="This action cannot be undone. Are you sure you want to delete this user?"
        confirmBtnText="Yes, delete user"
      />
    </DataTableRowActions>
  );
};
