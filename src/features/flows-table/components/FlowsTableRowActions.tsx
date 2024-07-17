import {
  AlertDialog as DeleteAlertDialogRoot,
  DropdownMenuSeparator,
} from "@/react-toolkit/components/ui";
import { useListOptimisticMutation } from "@/react-toolkit/hooks";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { flowOptimisticMutationFn } from "../apis/flows-table-apis";
import {
  DTDeleteRowAction,
  DTEditRowAction,
  DTRowDeleteAlert,
  DTViewRowAction,
  DataTableRowActions,
} from "@/react-toolkit/components/data-table";
import { FlowOpenRowAction } from "./FlowOpenRowAction";
import { useShallow } from "zustand/react/shallow";
import { useFlowsStore } from "../stores/flows-table-store";

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
  const { flowsQueryKey } = useFlowsStore(
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
    // Root component for delete alert dialog
    <DeleteAlertDialogRoot>
      {/* Dropdown menu for flow table row action */}
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
        <DTDeleteRowAction />
      </DataTableRowActions>

      {/* Content of delete alert dialog  */}
      <DTRowDeleteAlert
        description="This action cannot be undone. Are you sure you want to delete this flow?"
        confirmText="Yes, delete flow"
        rowDeleteMutateFn={() =>
          deleteFlow({
            id: rowId,
            payload: rowId,
            crudAction: "delete",
          })
        }
      />
    </DeleteAlertDialogRoot>
  );
};
