import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { TableCNRowActionsMenu } from "@avplatform/ui/table-cn";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

interface ArchivedFlowRowActionsProps {
  rowId: string;
  refId: string;
}

export const ArchivedFlowRowActions = ({ rowId, refId }: ArchivedFlowRowActionsProps) => {
  // Handle open archived flow action
  const handleOpenArchivedFlowAction = () => {
    window.open(`${import.meta.env.VITE_STUDIO_PATH}agent?f=${refId}&v=${rowId}`, "_blank");
  };

  return (
    // Dropdown menu for Archived flow table row actions
    <TableCNRowActionsMenu ariaLabel="Open archived flow actions">
      <SimpleDDMenuItem
        content="View"
        Icon={ArrowSquareOutIcon}
        onClick={handleOpenArchivedFlowAction}
      />
    </TableCNRowActionsMenu>
  );
};
