import { DataTableRowActions } from "@/react-toolkit/data-table/components/row-actions/DataTableRowActions";
import { DTDeleteRowAction } from "@/react-toolkit/data-table/components/row-actions/DTDeleteRowAction";
import { DTEditRowAction } from "@/react-toolkit/data-table/components/row-actions/DTEditRowAction";
import { DTViewRowAction } from "@/react-toolkit/data-table/components/row-actions/DTViewRowAction";
import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { useShallow } from "zustand/react/shallow";
import { flowOptimisticMutationFn } from "../apis/flows-table-apis";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useFlowsTableStore } from "../stores/flows-table-store";
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
  // Get flows store state and actions
  const { flowsQueryKey } = useFlowsTableStore(
    useShallow((state) => ({
      flowsQueryKey: state.flowsQueryKey,
    })),
  );

  // Get mutation function to delete the flow
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    FlowsTableDto | boolean,
    FlowsTableDto
  >(flowOptimisticMutationFn, flowsQueryKey);

  // Return the component
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
      <DTDeleteRowAction
        rowDeleteMutateFn={() =>
          deleteFlow({
            id: rowId,
            payload: rowId,
            crudAction: "delete",
          })
        }
        description="This action cannot be undone. Are you sure you want to delete this flow?"
        confirmBtnText="Yes, delete flow"
      />
    </DataTableRowActions>
  );
};
