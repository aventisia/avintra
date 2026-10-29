import { DataTableRowActions } from "@avplatform/ui/data-table";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ExternalLinkIcon } from "lucide-react";

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
    <DataTableRowActions>
      <SimpleDDMenuItem
        content="View"
        Icon={ExternalLinkIcon}
        onClick={handleOpenArchivedFlowAction}
      />
    </DataTableRowActions>
  );
};
