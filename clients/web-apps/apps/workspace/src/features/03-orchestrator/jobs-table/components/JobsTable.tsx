import {
  DTCreateButton,
  DTExportButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { HelpButton } from "@/components/help/HelpButton";
import {
  DateRangeFilter,
  HISTORY_JOB_STATUSES,
  JobStatusEnum,
  JobsBulkActions,
  JobsStats,
  TABLE_HEADING,
  TABLE_KEY,
  columnDisplayNames,
  columnVisibilityState,
  jobsTableColumns,
  useFetchJobsList,
} from "..";

const tabs = ["Current", "Scheduled", "History"];

/**
 * Renders a table of jobs.
 *
 * @returns The rendered JobsTable component.
 */
export const JobsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("t");
  const defaultTab = "History";
  const [tabValue, setTabValue] = useState(
    tabParam && tabs.includes(tabParam) ? tabParam : defaultTab,
  );

  const handleTabParamChange = useCallback(
    (newTab: string) => {
      // preserve other params
      const params = Object.fromEntries(searchParams.entries());
      params.t = newTab;
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Sync tab selection with URL param on mount and when param changes
  useEffect(() => {
    if (tabParam && tabs.includes(tabParam)) {
      setTabValue(tabParam);
    } else if (!tabParam) {
      handleTabParamChange(defaultTab);
    }
  }, [defaultTab, handleTabParamChange, tabParam]);

  const handleTabSelect = (tab: string) => {
    setTabValue(tab);
    handleTabParamChange(tab);
  };

  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch Jobs data
  const { data } = useFetchJobsList();

  // Create a React table for Jobs data
  const table = useDataTable(jobsTableColumns, data?.data || [], columnVisibility, sortState, true);

  useEffect(() => {
    const statusColumn = table.getColumn("status");

    if (!statusColumn) return;

    if (tabValue === "Current") {
      statusColumn.setFilterValue(JobStatusEnum.Running);
    } else if (tabValue === "Scheduled") {
      statusColumn.setFilterValue(JobStatusEnum.Created);
    } else if (tabValue === "History") {
      statusColumn.setFilterValue(HISTORY_JOB_STATUSES);
    }
  }, [tabValue, table]);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="jobs" />
              <Tabs value={tabValue} onValueChange={handleTabSelect}>
                <TabsList className="h-fit w-full rounded-lg px-1.5 py-1">
                  {tabs.map((tab) => (
                    <TabsTrigger value={tab} key={tab} className="w-full rounded-lg py-0.5">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["flowName", "flowVersionNumber", "status"]}
                placeholder="Search agent, version or status..."
              />
              <DateRangeFilter />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              {tabValue == "History" ? <DTExportButton fileName={TABLE_KEY} table={table} /> : null}
              <DTCreateButton buttonText="Create Job" entity="job" />
            </div>
          </div>
          {/* Data table to render data */}
          <div className="flex flex-col gap-2">
            {tabValue === "History" && (
              <JobsStats
                data={data?.data.filter((job) => HISTORY_JOB_STATUSES.includes(job.status))}
              />
            )}

            <DataTable table={table} columnsLength={jobsTableColumns.length} />
          </div>
          {tabValue === "Scheduled" && <JobsBulkActions table={table} />}{" "}
          {/* Data table Pagination component */}
          <DTPagination table={table} singularLabel="job" pluralLabel="jobs" />
        </div>
      ) : (
        // Show data table skeleton while fetching the jobs data
        <DataTableSkeleton />
      )}
    </>
  );
};
