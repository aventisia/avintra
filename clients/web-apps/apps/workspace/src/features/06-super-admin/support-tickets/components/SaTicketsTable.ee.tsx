import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  SA_TICKETS_INITIAL_STATE,
  SA_TICKETS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchSaTickets } from "../hooks/useFetchSaTickets.ee";
import { saTicketTableColumns } from "./SaTicketTableColumns.ee";
import { SaTicketBulkActions } from "./ticket-row-actions/SaTicketBulkActions.ee";

const tabs = ["In Progress", "Closed"];

const PAGINATION_PROPS = {
  pageSizeOptions: SA_TICKETS_PAGE_SIZE_OPTIONS,
};

export const SaTicketsTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("t");
  const defaultTab = "In Progress";
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

  const { data } = useFetchSaTickets();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: saTicketTableColumns,
    getRowId: (row) => row.id ?? "",
    initialState: SA_TICKETS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["title", "ticketNumber"],
  });

  // Filter the table by the active tab's status.
  useEffect(() => {
    const statusColumn = table.getColumn("status");

    if (!statusColumn) return;

    if (tabValue === "In Progress") {
      statusColumn.setFilterValue(["New", "InProgress"]);
    } else if (tabValue === "Closed") {
      statusColumn.setFilterValue("Closed");
    }
  }, [tabValue, table]);

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          <div className="flex items-center justify-between">
            <TableCNHeading heading={TABLE_HEADING} />
            <div className="flex items-center gap-2">
              <Tabs value={tabValue} onValueChange={handleTabSelect}>
                <TabsList className="h-fit w-full rounded-lg px-1.5 py-1">
                  {tabs.map((tab) => (
                    <TabsTrigger value={tab} key={tab} className="w-full rounded-lg py-0.5">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <CrudCreateButton entity="saSupportTicket" />
            </div>
          </div>

          {/* Data table with its search, view options, footer and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<SaTicketBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search tickets..." />
          </TableCN>
        </div>
      ) : (
        <TableCNSkeleton columnCount={8} withSearch />
      )}
    </>
  );
};
