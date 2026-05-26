import { DataTableRowActions } from "@aventisia/ui/data-table";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenArchivedFlow } from "../hooks/useOpenArchivedFlow";

interface ArchivedFlowRowActionsProps {
  rowId: string;
  refId: string;
}

export const ArchivedFlowRowActions = ({
  rowId,
  refId,
}: ArchivedFlowRowActionsProps) => {
  // Get handle function to open Archived flow
  const handleOpenArchivedFlowAction = useOpenArchivedFlow();

  return (
    // Dropdown menu for Archived flow table row actions
    <DataTableRowActions>
      <SimpleDDMenuItem
        content="View"
        Icon={ArrowTopRightOnSquareIcon}
        onClick={() => handleOpenArchivedFlowAction(refId, rowId)}
      />
    </DataTableRowActions>
  );
};
