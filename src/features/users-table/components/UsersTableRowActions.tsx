import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTEditRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTViewRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { UserDeleteRowAction } from "./UserDeleteRowAction";

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
  return (
    <DataTableRowActions>
      {/* Opens crud dialog to view the user details */}
      <DTViewRowAction rowId={rowId} />

      {/* Opens crud dialog to update user details */}
      <DTEditRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <UserDeleteRowAction userId={rowId} />
    </DataTableRowActions>
  );
};
