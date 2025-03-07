import { useMemo } from "react";
import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { ExtractedDataDto } from "../../dtos/ extracted-data-dto";
import { generateDynamicColumns } from "./ExtractedDataTableColumns";
import { useGetExtractedDataList } from "../../hooks/useFetchExtractedDataList";
import { generateVisibility, refactorData } from "../../constants";

export const ExtractedDataTable = () => {
  const { data } = useGetExtractedDataList();

  // Generate dynamic columns and visibility based on the data
  const columns = useMemo(
    () => generateDynamicColumns(data?.data),
    [data?.data],
  );

  const initialVisibility = useMemo(
    () => generateVisibility(data?.data),
    [data?.data],
  );

  // Refactored data
  const refactoredData = refactorData(data?.data);

  // Use the useDataTable hook to manage the table state
  const table = useDataTable(
    columns,
    refactoredData as ExtractedDataDto[],
    initialVisibility,
  );

  return (
    <div className="shadow-xs mt-7 space-y-4 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <DTHeading heading={"Extracted Data"} />
      </div>

      {/* Data table to render data */}
      <div className="rounded-md border">
        <DataTable table={table} columnsLength={columns.length} />
      </div>

      {/* Data table Pagination component */}
      <DTPagination table={table} />
    </div>
  );
};
