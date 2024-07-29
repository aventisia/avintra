import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu/dropdown-menu";
import { UserRowDeleteAction } from "./UserRowDeleteAction";

interface UserRowActionsProps {
  rowId: string;
}

export const UserRowActions = ({ rowId }: UserRowActionsProps) => {
  return (
    // Dropdown menu for User table row action */}
    <DataTableRowActions>
      {/* View the User details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit User details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers User delete alert dialog  */}
      <UserRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
