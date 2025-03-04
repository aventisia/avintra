import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenAgent } from "../../hooks/useOpenAgent";

interface AssignAgentTableRowActionsProps {
  value: string;
}

export const AssignAgentTableRowActions = ({
  value,
}: AssignAgentTableRowActionsProps) => {
  const handleOpenAgentAction = useOpenAgent();
  return (
    // Dropdown menu for machine table row action */}
    <DataTableRowActions>
      <SimpleDDMenuItem
        content="Open"
        Icon={ArrowTopRightOnSquareIcon}
        onClick={() => handleOpenAgentAction(value)}
      />
    </DataTableRowActions>
  );
};
