import { DatePickerWithRange } from "@/react-toolkit/ui/date-range-picker";

import { Separator } from "@aventisia/ui";
import { DataTable } from "@aventisia/ui/data-table";
import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { DTPagination } from "@aventisia/ui/data-table";
import { DTCreateButton } from "@aventisia/ui/data-table";
import { DTHeading } from "@aventisia/ui/data-table";
import { DTSearchBox } from "@aventisia/ui/data-table";
import { DTViewOptions } from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useDocumentTitle } from "@aventisia/ui/hooks";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchModels } from "../hooks/useFetchModels";
import { modelLibraryTableColumns } from "./ModelLibraryTableColumns";
import { ModelsBulkActions } from "./ModelsBulkActions";
import { ModelCrudDialog } from "./model-crud-dialog/ModelCrudDialog";

/**
 * Renders a table of models.
 *
 * @returns The rendered ModelLibraryTable component.
 */
export const ModelLibraryTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // State for date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Function to be passed to the DateRangePicker
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // Fetch models data
  const { data } = useFetchModels();

  const table = useDataTable(
    modelLibraryTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Set the filter value whenever dateRange changes
  useEffect(() => {
    // Apply the filter to the date column
    table.getColumn("createdOn")?.setFilterValue(dateRange);
  }, [dateRange, table]);

  // Return the rendered DataTable component.
  return (
    <>
      {data?.data ? (
        <div className="shadow-xs mt-7 space-y-4 rounded-lg border bg-white p-4">
          {/* Crud ops dialog */}
          <ModelCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search model..."
                />
                <DatePickerWithRange
                  selectedDate={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton buttonText="Create new model" />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={modelLibraryTableColumns.length}
              />
            </div>
          </ModelCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <ModelsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the models data
        <DataTableSkeleton />
      )}
    </>
  );
};
