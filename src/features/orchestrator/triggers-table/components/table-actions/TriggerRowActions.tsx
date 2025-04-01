import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";

import { TriggerRowDeleteAction } from "./TriggerRowDeleteAction";

interface TriggerRowActionsProps {
  rowId: string;
}

export const TriggerRowActions = ({ rowId }: TriggerRowActionsProps) => {
  return (
    // Dropdown menu for Trigger table row action */}
    <DataTableRowActions>
      {/* View the Trigger details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit Trigger details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Trigger delete alert dialog  */}
      <TriggerRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
