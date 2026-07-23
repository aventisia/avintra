import { DataTableRowActions } from "@avplatform/ui/data-table";

import { WorkItemDeleteAction } from "./WorkItemDeleteAction";

interface WorkItemRowActionsProps {
  rowId: string;
}

export const WorkItemRowActions = ({ rowId }: WorkItemRowActionsProps) => {
  return (
    // Dropdown menu for Queue table row action */}
    <DataTableRowActions className="flex !w-8 flex-col">
      {/* Triggers Queue Work item delete alert dialog  */}
      <WorkItemDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
