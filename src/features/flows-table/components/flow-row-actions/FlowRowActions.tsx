import { DTRowAction } from "@aventisia/ui/data-table";
import { DataTableRowActions } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { FlowRowDeleteAction } from "./FlowRowDeleteAction";
import { FlowRowOpenAction } from "./FlowRowOpenAction";

interface FlowRowActionsProps {
  rowId: string;
}

export const FlowRowActions = ({ rowId }: FlowRowActionsProps) => {
  return (
    // Dropdown menu for flow table row action */}
    <DataTableRowActions>
      {/* To open flow in studio */}
      <FlowRowOpenAction rowId={rowId} />

      {/* View the flow details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit flow details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Flow delete alert dialog  */}
      <FlowRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
