import { Button } from "@avplatform/ui/buttons";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useAgentsSelectTableStore } from "../../../stores/agents-select-table-store";

interface AgentSelectTablePaginationProps<TData> {
  table: Table<TData>;
  isRowSelectionEnabled?: boolean;
}

export function AgentSelectTablePagination<TData>({
  table,
  isRowSelectionEnabled = true,
}: Readonly<AgentSelectTablePaginationProps<TData>>) {
  const { currentAgents } = useAgentsSelectTableStore(
    useShallow((state) => ({
      currentAgents: state.currentAgents,
    })),
  );

  return (
    <div className="flex items-center justify-end px-2 sm:justify-between">
      <div className="hidden flex-1 text-sm text-muted-foreground sm:flex">
        {isRowSelectionEnabled ? (
          <>
            {currentAgents.filter((x) => x.isAssigned).length} of{" "}
            {table.getFilteredRowModel().rows.length} agent(s) assigned.
          </>
        ) : (
          <>{table.getFilteredRowModel().rows.length} agent(s)</>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
