import { DataTable } from "@/react-toolkit/ui/data-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { useFetchPermissionsAndFeature } from "../../../hooks/useFetchPermissionsAndFeature";
import { PermissionsTableColumns } from "./PermissionsTableColumns";

export const PermissionsTable = () => {
  const { data } = useFetchPermissionsAndFeature();

  // Create a new instance of the React table.
  const table = useReactTable({
    data: data,
    columns: PermissionsTableColumns(),
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div>
      <DataTable table={table} columnsLength={PermissionsTableColumns.length} />
    </div>
  );
};
