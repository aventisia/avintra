import { DataTableRowActions } from "@aventisia/ui/data-table";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenFlow } from "../hooks/useOpenFlow";

interface FlowRowActionsProps {
  rowId: string;
  refId: string;
}

export const FlowRowActions = ({ rowId, refId }: FlowRowActionsProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  return (
    // Dropdown menu for flow table row action */}
    <DataTableRowActions>
      <SimpleDDMenuItem
        content="View"
        Icon={ArrowTopRightOnSquareIcon}
        onClick={() => handleOpenFlowAction(refId, rowId)}
      />
    </DataTableRowActions>
  );
};
