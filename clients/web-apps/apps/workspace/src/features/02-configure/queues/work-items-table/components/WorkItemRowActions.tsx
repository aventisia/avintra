import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";

import { WorkItemDeleteAction } from "./WorkItemDeleteAction";

interface WorkItemRowActionsProps {
  rowId: string;
}

export const WorkItemRowActions = ({ rowId }: WorkItemRowActionsProps) => {
  return (
    // Dropdown menu for Queue table row action */}
    <TableCNRowActionsMenu ariaLabel="Open work item actions" contentClassName="flex !w-8 flex-col">
      {/* Triggers Queue Work item delete alert dialog  */}
      <WorkItemDeleteAction rowId={rowId} />
    </TableCNRowActionsMenu>
  );
};
