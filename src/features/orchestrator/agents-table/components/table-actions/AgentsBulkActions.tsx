import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { DTBulkActions, DTSelectionInfo } from "@aventisia/ui/data-table";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
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

  const selectedAgents = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedRowIds = selectedAgents
    .map((a) => a.id)
    .filter(Boolean) as string[];

  const handleDisable = () => {
    showCustomAlertDialog({
      title: "Disable Agents",
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
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <Button
            variant="ghost"
            size="xs"
            className="gap-2.5 text-sm tracking-wide"
            onClick={handleDisable}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[--icon-color]" />
            ) : (
              <CircleOff className="h-3.5 w-3.5 text-[--icon-color]" />
            )}
            Disable
          </Button>
        </DTBulkActions>
      )}
    </>
  );
}
