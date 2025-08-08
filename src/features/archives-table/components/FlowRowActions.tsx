import { DataTableRowActions } from "@aventisia/ui/data-table";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";

interface FlowRowActionsProps {
  rowId: string;
}

export const FlowRowActions = ({ rowId }: FlowRowActionsProps) => {
  console.log(rowId);
  return (
    // Dropdown menu for flow table row action */}
    <DataTableRowActions>
      <SimpleDDMenuItem content="Move to Published" />
    </DataTableRowActions>
  );
};
