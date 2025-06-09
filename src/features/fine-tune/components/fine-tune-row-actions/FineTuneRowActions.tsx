import { DataTableRowActions } from "@aventisia/ui/data-table";

import { FineTuneRowDeleteAction } from "./FineTuneRowDeleteAction";
import { FineTuneRowOpenAction } from "./FineTuneRowOpenAction";

interface FineTuneRowActionsProps {
  rowId: string;
  fileId: string;
}

export const FineTuneRowActions = ({
  rowId,
  fileId,
}: FineTuneRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions className="w-32">
      {/* To open a row */}
      <FineTuneRowOpenAction fileId={fileId} />

      {/* Triggers model delete alert dialog  */}
      <FineTuneRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
