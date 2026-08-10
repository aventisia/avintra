import {
  DTCreateButton,
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

import { TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchSaTickets } from "../hooks/useFetchSaTickets";
import { saTicketTableColumns } from "./SaTicketTableColumns";
import { SaTicketBulkActions } from "./ticket-row-actions/SaTicketBulkActions";

const tabs = ["In Progress", "Closed"];

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

  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);
  const { data } = useFetchSaTickets();

  const table = useDataTable(
    saTicketTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

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
            <DTHeading heading={TABLE_HEADING} />
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["title", "ticketNumber"]}
                placeholder="Search tickets..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <Tabs value={tabValue} onValueChange={handleTabSelect}>
                <TabsList className="h-fit w-full rounded-lg px-1.5 py-1">
                  {tabs.map((tab) => (
                    <TabsTrigger value={tab} key={tab} className="w-full rounded-lg py-0.5">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <DTCreateButton entity="saSupportTicket" />
            </div>
          </div>
          <DataTable table={table} columnsLength={saTicketTableColumns.length} />
          <SaTicketBulkActions table={table} />
          <DTPagination table={table} isRowSelectionEnabled />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};
