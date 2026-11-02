import { LockedActionTooltip } from "@avplatform/ui/action-lock";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { CircleOff, Loader2 } from "lucide-react";
import { useState } from "react";

import { AgentsTableDto } from "../../dtos/agents-table-dto";
import useBulkDisableAgents from "../../hooks/useBulkDisableAgents";

interface AgentsBulkActionsProps {
  table: Table<AgentsTableDto>;
}

export function AgentsBulkActions({ table }: Readonly<AgentsBulkActionsProps>) {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { disableAgents } = useBulkDisableAgents();
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAgents = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  const selectedRowIds = selectedAgents.map((a) => a.id).filter(Boolean) as string[];

  const handleDisable = () => {
    showCustomAlertDialog({
      title: "Disable agents",
      description: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "agents" : "agent"} will be disabled`,
      confirmBtnText: "Disable",
      isDestructive: true,
      confirmActionFn: async () => {
        setIsProcessing(true);
        await disableAgents(selectedRowIds);
        table.toggleAllRowsSelected(false); // Clear selection
        setIsProcessing(false);
      },
    });
  };

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={isProcessing ? Loader2 : CircleOff}
          onClick={handleDisable}
          disabled={isProcessing}
        >
          Disable
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
