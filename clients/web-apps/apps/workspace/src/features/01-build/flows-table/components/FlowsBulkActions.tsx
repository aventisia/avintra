import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
  exportTableCNToCsv,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download, Trash2Icon } from "lucide-react";

import { flowOptimisticMutationFn } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY } from "../constants";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { MoveSelectedAgentsMenu } from "./bulk-actions/MoveSelectedAgentsMenu";

type FlowsBulkActionsProps = {
  table: Table<FlowsTableDto>;
};

/**
 * Action bar for the selected agents: move them to a folder, export them as CSV, or delete them
 * after confirmation.
 */
export function FlowsBulkActions({ table }: FlowsBulkActionsProps) {
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  const selectedAgents = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  const selectedRowIds = selectedAgents
    .map((agent) => agent.id)
    .filter((id): id is string => id !== undefined);

  const { mutate: deleteFlows } = useListOptimisticMutation<
    string[],
    FlowsTableDto | boolean,
    FlowsTableDto
  >(selectedRowIds, flowOptimisticMutationFn, FLOWS_QUERY_KEY);

  // TODO: Rollback selection if there is an error

  const confirmDelete = () =>
    showDefaultAlertDialog({
      confirmActionFn: () => {
        deleteFlows({
          payload: selectedRowIds,
          crudAction: "delete-multiple",
        });
        table.toggleAllRowsSelected(false);
      },
      alertType: "delete-multiple",
      additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "agents" : "agent"}`,
    });

  const exportSelected = () =>
    exportTableCNToCsv(table, {
      fileName: `agents-${format(new Date(), "yyyy-MM-dd")}`,
      onlySelected: true,
    });

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <MoveSelectedAgentsMenu
        agents={selectedAgents}
        disabled={locked}
        onMoved={() => table.resetRowSelection()}
      />
      <TableCNActionBarItem icon={Download} onClick={exportSelected}>
        Export CSV
      </TableCNActionBarItem>
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={Trash2Icon}
          tone="destructive"
          disabled={locked}
          onClick={confirmDelete}
        >
          Delete
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
