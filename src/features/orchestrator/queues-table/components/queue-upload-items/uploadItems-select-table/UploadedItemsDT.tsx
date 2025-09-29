/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable, DTPagination } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
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
      <DataTable table={table} columnsLength={columns.length} />
      <DTPagination table={table} />
    </div>
  );
};

export default UploadedItemsDT;
