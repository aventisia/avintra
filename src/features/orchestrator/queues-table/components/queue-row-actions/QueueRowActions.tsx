import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { QueueRowDeleteAction } from "./QueueRowDeleteAction";
import { QueueRowRetryAction } from "./QueueRowRetryAction";

interface QueueRowActionsProps {
  rowId: string;
}

export const QueueRowActions = ({ rowId }: QueueRowActionsProps) => {
  return (
    // Dropdown menu for Queue table row action */}
    <DataTableRowActions>
      {/* View the Queue details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit Queue details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* retry the failed transaction */}
      <QueueRowRetryAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Queue delete alert dialog  */}
      <QueueRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
