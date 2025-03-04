import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";

import { useFetchAgents } from "../../hooks/useFetchAgents";
import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { AssignAgentTableColumns } from "./AssignAgentTableColumns";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { AssignAgentAction } from "./AssignAgentAction";

export const MachineAssignAgent = () => {
  const { data } = useFetchAgents();

  // Create a React table for machines data
  const table = useDataTable(
    AssignAgentTableColumns,
    data?.data || [],
    {},
    true,
  );

  // Return the form
  return (
    <div className="relative mb-3">
      {/* Table toolbar */}
      <div className="flex items-center justify-between pb-2">
        <DTHeading heading="Agents" />

        <DTSearchBox
          table={table}
          searchColumn="label"
          placeholder="Search agents..."
        />
      </div>

      {/* Data table to render data */}
      <div className="rounded-md border bg-slate-50">
        <DataTable table={table} columnsLength={1} />
      </div>
      <div className="rounded-md border bg-slate-50 py-3">
        <DTPagination table={table} />
      </div>
      <AssignAgentAction table={table} />
    </div>
  );
};
