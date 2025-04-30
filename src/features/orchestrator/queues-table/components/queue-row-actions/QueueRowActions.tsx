import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";

import { AddTriggerRowAction } from "./AddTriggerRowAction";
import { AssignAgentsRowAction } from "./AssignAgentsRowAction";
import { DeactivateRowAction } from "./DeactivateRowAction";
import { QueueRowDeleteAction } from "./QueueRowDeleteAction";
import { UploadItemsRowAction } from "./UploadItemsRowAction";

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

      <AssignAgentsRowAction rowId={rowId} />
      <AddTriggerRowAction rowId={rowId} />
      <UploadItemsRowAction rowId={rowId} />
      <DeactivateRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Queue delete alert dialog  */}
      <QueueRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
