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
import { CalendarClock, History, Play } from "lucide-react";
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

const tabs = [
  { label: "Current", value: "Current", icon: Play },
  { label: "Scheduled", value: "Scheduled", icon: CalendarClock },
  { label: "History", value: "History", icon: History },
];

/**
 * Renders a table of jobs.
 *
 * @returns The rendered JobsTable component.
 */
export const JobsTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("t");
  const defaultTab = "History";
  const tabValues = tabs.map((tab) => tab.value);
  const [tabValue, setTabValue] = useState(
    tabParam && tabValues.includes(tabParam) ? tabParam : defaultTab,
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
    if (tabParam && tabValues.includes(tabParam)) {
      setTabValue(tabParam);
    } else if (!tabParam) {
      handleTabParamChange(defaultTab);
    }
  }, [defaultTab, handleTabParamChange, tabParam, tabValues]);

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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="jobs" />
              <Tabs value={tabValue} onValueChange={handleTabSelect}>
                <TabsList>
                  {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <TabsTrigger value={tab.value} key={tab.value}>
                        {TabIcon && <TabIcon className="size-4 shrink-0" aria-hidden="true" />}
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
