import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTEditRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTViewRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { FlowDeleteRowAction } from "./FlowDeleteRowAction";
import { FlowOpenRowAction } from "./FlowOpenRowAction";

interface FlowsTableRowActionsProps {
  /** The ID of the row */
  rowId: string;
}

/**
 * Renders the actions for a table row in the flows table.
 *
 * @param {FlowsTableRowActionsProps} props - The component props.
 * @returns {JSX.Element} The rendered row actions component for flows table.
 */
export const FlowsTableRowActions = ({ rowId }: FlowsTableRowActionsProps) => {
  return (
    // Dropdown menu for flow table row action */}
    <DataTableRowActions>
      {/* To open flow in studio */}
      <FlowOpenRowAction rowId={rowId} />

      {/* Opens crud dialog to view the flow details */}
      <DTViewRowAction rowId={rowId} />

      {/* Opens crud dialog to update flow details */}
      <DTEditRowAction rowId={rowId} />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers Flow delete alert dialog  */}
      <FlowDeleteRowAction flowId={rowId} />
    </DataTableRowActions>
  );
};
