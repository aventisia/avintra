import {
  DTExportButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { HorizontalScrollWrapper } from "@/react-toolkit/ui/HorizontalScrollWrapper";

import {
  HISTORY_JOB_STATUSES,
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { JobStatusEnum } from "../enums/job-status-enum";
import { useFetchJobsList } from "../hooks/useFetchJobsList";
import { DateRangeFilter } from "./DateRangeFilter";
import { JobsBulkActions } from "./JobsBulkActions";
import { JobsStats } from "./JobsStats";
import { jobsTableColumns } from "./JobsTableColumns";

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
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch Jobs data
  const { data } = useFetchJobsList();

  const filteredColumns = useMemo(() => {
    return jobsTableColumns.filter((col) => {
      // Show actions only for Current & Scheduled
      if (col.id === "actions") {
        return tabValue !== "History";
      }

      // Show isPublished only for History
      if (col.id === "isPublished") {
        return tabValue === "History";
      }

      // Show Select Row only for Scheduled
      if (col.id === "id") {
        return tabValue === "Scheduled";
      }

      return true;
    });
  }, [tabValue]);

  // Create a React table for Jobs data
  const table = useDataTable(
    filteredColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

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
              <Tabs value={tabValue} onValueChange={handleTabSelect}>
                <TabsList className="h-fit w-full rounded-lg px-1.5 py-1">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      value={tab}
                      key={tab}
                      className="w-full rounded-lg py-0.5"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={SEARCH_COLUMN}
                placeholder="Search..."
              />
              <DateRangeFilter />
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: TABLE_KEY }}
              />
              {tabValue == "History" ? (
                <DTExportButton fileName={TABLE_KEY} table={table} />
              ) : null}
            </div>
          </div>
          {/* Data table to render data */}
          <div className="flex flex-col gap-2">
            {tabValue === "History" && (
              <JobsStats
                data={data?.data.filter((job) =>
                  HISTORY_JOB_STATUSES.includes(job.status),
                )}
              />
            )}

            <HorizontalScrollWrapper>
              <DataTable
                table={table}
                columnsLength={jobsTableColumns.length}
              />
            </HorizontalScrollWrapper>
          </div>
          {tabValue === "Scheduled" && <JobsBulkActions table={table} />}{" "}
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
