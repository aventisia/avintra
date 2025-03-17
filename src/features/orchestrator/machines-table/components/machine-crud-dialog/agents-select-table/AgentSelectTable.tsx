import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { agentSelectTableColumns } from "./AgentSelectTableColumns";
import { AgentSelectTablePagination } from "./AgentSelectTablePagination";
import { Table } from "@tanstack/react-table";

interface AgentSelectTableProps<TData> {
  isReadMode?: boolean;
  table: Table<TData>;
}

export function AgentSelectTable<TData>({
  table,
  isReadMode,
}: Readonly<AgentSelectTableProps<TData>>) {
  return (
    <>
      <div className="my-2 flex items-center justify-between">
        <h4 className="text-md ml-1 flex w-full items-center truncate text-foreground">
          {isReadMode ? "Assigned agents" : "Select agents..."}
        </h4>

        <div className="flex items-center gap-2">
          <DTSearchBox
            table={table}
            searchColumn={"name"}
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
