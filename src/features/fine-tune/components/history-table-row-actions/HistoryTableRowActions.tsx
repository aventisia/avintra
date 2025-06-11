import { Separator } from "@aventisia/ui";
import { DataTableRowActions } from "@aventisia/ui/data-table";

import { HistoryTableRescheduleAction } from "./HistoryTableRescheduleAction";
import { HistoryTableRowDeleteAction } from "./HistoryTableRowDeleteAction";

interface HistoryTableRowActionsProps {
  rowId: string;
  fileId?: string;
  disabled?: boolean;
}

export const HistoryTableRowActions = ({
  rowId,
  disabled,
}: HistoryTableRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions className="w-32">
      {/* To reschedule fine-tune record */}
      <HistoryTableRescheduleAction rowId={rowId} disabled={disabled} />

      <Separator />

      {/* Triggers model delete alert dialog  */}
      <HistoryTableRowDeleteAction rowId={rowId} disabled={disabled} />
    </DataTableRowActions>
  );
};
