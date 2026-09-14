/* eslint-disable @typescript-eslint/no-explicit-any */
import { DTPagination, DataTable } from "@avplatform/ui/data-table";
import { useDataTable } from "@avplatform/ui/hooks";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";

const UploadedItemsDT = ({
  columns,
  columnsVisibilityState,
  data,
}: {
  columns: ColumnDef<any>[];
  data: any[];
  columnsVisibilityState: VisibilityState;
}) => {
  // Initialize the table
  const table = useDataTable(columns, data, columnsVisibilityState, [], true);

  return (
    <div className="space-y-3">
      {/* Match the dialog's fixed width so the table fills it; DataTable's own
          ScrollArea shows a horizontal scrollbar when columns exceed it. */}
      <div className="max-w-[57rem]">
        <DataTable table={table} columnsLength={columns.length} />
      </div>
      <DTPagination table={table} />
    </div>
  );
};

export default UploadedItemsDT;
