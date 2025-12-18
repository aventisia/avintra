import {
  DataTable,
  DataTableSkeleton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useEffect, useState } from "react";

import { SEARCH_COLUMN, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { JobStatusTypesEnum } from "../enums/job-status-type-enum";
import { useFetchJobsList } from "../hooks/useFetchJobsList";

import { jobsTableColumns } from "./JobsTableColumns";

/**
 * Renders a table of jobs.
 *
 * @returns The rendered JobsTable component.
 */
export const JobsTable = () => {
  const [tabValue, setTabValue] = useState<string>("Running");

  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch Jobs data
  const { data } = useFetchJobsList();

  // Create a React table for Jobs data
  const table = useDataTable(
    jobsTableColumns.filter(
      (col) => !(col.id === "actions" && tabValue === "History"), // Exclude "actions" when tab is "History"
    ),
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  useEffect(() => {
    const statusColumn = table.getColumn("status");

    if (!statusColumn) return;

    if (tabValue === "Running") {
      statusColumn.setFilterValue(JobStatusTypesEnum.Running);
    } else if (tabValue === "Created") {
      statusColumn.setFilterValue(JobStatusTypesEnum.Created);
    } else if (tabValue === "History") {
      statusColumn.setFilterValue([
        JobStatusTypesEnum.Completed,
        JobStatusTypesEnum.Failed,
        JobStatusTypesEnum.Canceled,
        JobStatusTypesEnum.Abort,
      ]);
    }
  }, [tabValue, table]);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />

            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search..."
              />
              <Tabs
                value={tabValue}
                // className="w-full"
                onValueChange={setTabValue}
              >
                <TabsList className="h-fit w-full rounded-lg px-1.5 py-1">
                  <TabsTrigger
                    value="Running"
                    className="w-full rounded-lg py-0.5"
                  >
                    Current
                  </TabsTrigger>
                  <TabsTrigger
                    value="Created"
                    className="w-full rounded-lg py-0.5"
                  >
                    Scheduled
                  </TabsTrigger>
                  <TabsTrigger
                    value="History"
                    className="w-full rounded-lg py-0.5"
                  >
                    History
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
              />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={jobsTableColumns.length} />

          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the jobs data
        <DataTableSkeleton />
      )}
    </>
  );
};
