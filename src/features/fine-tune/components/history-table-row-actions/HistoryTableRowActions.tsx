import { Separator } from "@aventisia/ui";
import { DataTableRowActions } from "@aventisia/ui/data-table";

import { HistoryTableRescheduleAction } from "./HistoryTableRescheduleAction";
import { HistoryTableRowDeleteAction } from "./HistoryTableRowDeleteAction";

interface HistoryTableRowActionsProps {
  rowId: string;
  fileId: string;
}

export const HistoryTableRowActions = ({
  rowId,
  fileId,
}: HistoryTableRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions className="w-32">
      {/* To reschedule fine-tune record */}
      <HistoryTableRescheduleAction fileId={fileId} />

      <Separator />

      {/* Triggers model delete alert dialog  */}
      <HistoryTableRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
