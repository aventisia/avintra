import { Button } from "@avplatform/ui/buttons";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  exportTableCNToCsv,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { CalendarClock, Download, History, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  DateRangeFilter,
  HISTORY_JOB_STATUSES,
  JOBS_INITIAL_STATE,
  JOBS_PAGE_SIZE_OPTIONS,
  JobStatusEnum,
  JobsBulkActions,
  JobsStats,
  TABLE_HEADING,
  TABLE_KEY,
  jobsTableColumns,
  useFetchJobsList,
} from "..";

const tabs = [
  { label: "Current", value: "Current", icon: Play },
  { label: "Scheduled", value: "Scheduled", icon: CalendarClock },
  { label: "History", value: "History", icon: History },
];

const PAGINATION_PROPS = {
  pageSizeOptions: JOBS_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "job", plural: "jobs" },
};

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

  // Fetch Jobs data
  const { data } = useFetchJobsList();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: jobsTableColumns,
    getRowId: (row) => row.id,
    initialState: JOBS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["job", "status"],
  });

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

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading, tabs and create action */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
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
              <CrudCreateButton buttonText="Create job" entity="job" />
            </div>
          </div>

          {/* Table with its toolbar, statistics strip, pagination footer and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={tabValue === "Scheduled" && <JobsBulkActions table={table} />}
          >
            {/* Search beside the date-range filter and the History-only export */}
            <TableCNToolbar table={table} searchPlaceholder="Search agent, version or status...">
              <DateRangeFilter />
              {tabValue === "History" && (
                <Button
                  variant="outline"
                  size="xs"
                  className="gap-2 text-sm tracking-wide"
                  onClick={() => exportTableCNToCsv(table, { fileName: TABLE_KEY })}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </TableCNToolbar>

            {/* Statistics strip reads the fetched data, not the table instance */}
            {tabValue === "History" && (
              <JobsStats
                data={data?.data.filter((job) => HISTORY_JOB_STATUSES.includes(job.status))}
              />
            )}
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the jobs data
        <TableCNSkeleton columnCount={8} withSearch />
      )}
    </>
  );
};
