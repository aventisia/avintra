import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";

import { HelpButton } from "@/components/help/HelpButton";
import { NoAgentsAvailable } from "@/features/04-assist/my-chats/components/NoAgentsAvailable";

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchSelectTableAgents } from "../hooks/useFetchSelectAgents";
import { agentsAssistTableColumns } from "./AgentsAssistTableColumns";
import { AgentsTableSkeleton } from "./AgentsTableSkeleton";
import { AgentsListItemActions } from "./assign-agent-item-actions";
import { ExecutionAction } from "./assign-agent-item-actions/ExecutionAction";

/**
 * Renders a table of configs.
 *
 * @returns The rendered ConfigsTable component.
 */
export const AgentsAssistTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  const { data, isLoading } = useFetchSelectTableAgents();

  // Create a React table for configs data
  const table = useDataTable(
    agentsAssistTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {!isLoading ? (
        <div className="mx-auto max-w-screen-lg space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="assist-agents" />
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search..." />
            </div>
          </div>
          {/* DT with only rows and custom design */}
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 rounded-lg border bg-white px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-lg border bg-background px-3.5 py-2.5 shadow-sm transition-shadow hover:ring-1 hover:ring-border"
                >
                  {/* Left icon with rounded border */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.getValue("name")}</span>
                    <span className="text-2xs text-muted-foreground">
                      Version: {row.getValue("versionNumber") as string}
                    </span>
                  </div>
                  {/* Action trigger */}
                  <div className="flex items-center gap-2">
                    <ExecutionAction
                      executionState={row.original.status}
                      rowId={row.original.id}
                      flowName={row.original.name}
                      flowVersionNumber={row.original.versionNumber}
                      jobId={row.original.jobId}
                    />
                    {/* Actions container */}
                    <AgentsListItemActions
                      id={row.original.id || ""}
                      machineIds={row.original.assignedMachineIds}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoAgentsAvailable includeChat={false} />
          )}
          {/* Data table Pagination component */}
          <DTPagination table={table} singularLabel="agent" pluralLabel="agents" />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <AgentsTableSkeleton />
      )}
    </>
  );
};
