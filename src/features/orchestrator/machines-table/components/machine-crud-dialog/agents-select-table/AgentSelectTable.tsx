import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";
import { agentSelectTableColumns } from "./AgentSelectTableColumns";
import { AgentSelectTablePagination } from "./AgentSelectTablePagination";

interface AgentSelectTableProps {
  isReadMode?: boolean;
  isFetching: boolean;
}

export function AgentSelectTable({
  isReadMode = true,
  isFetching,
}: Readonly<AgentSelectTableProps>) {
  // Get store state and actions
  const { currentAgents } = useAgentsSelectTableStore(
    useShallow((state) => ({
      currentAgents: state.currentAgents,
    })),
  );

  // Initialize the row selection state.
  const [rowSelection, setRowSelection] = useState({});

  // Create a React table for agents data
  const table = useReactTable({
    data: currentAgents,
    columns: agentSelectTableColumns,
    state: {
      rowSelection,
      columnVisibility: {
        versionNumber: true,
        isAssigned: false,
        name: false,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useCallback(() => {
    console.log(table.getSelectedRowModel().rows);
  }, [table, rowSelection]);

  return isFetching ? (
    <DataTableSkeleton />
  ) : (
    <>
      <div className="my-2 flex items-center justify-between">
        <h4 className="text-md ml-1 flex w-full items-center truncate text-foreground">
          {isReadMode ? "Assigned agents" : "Select agents..."}
        </h4>

        <div className="flex items-center gap-2">
          <DTSearchBox
            table={table}
            searchColumn="name"
            placeholder="Search agents..."
          />
        </div>
      </div>

      {/* Data table to render data */}
      <div className="rounded-md border">
        <DataTable
          table={table}
          columnsLength={agentSelectTableColumns.length}
        />
      </div>
      <div className="mt-2">
        <AgentSelectTablePagination table={table} />
      </div>
    </>
  );
}
