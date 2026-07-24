import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { columnVisibilityState } from "../constants/column-visibility-state";
import { TABLE_HEADING, TABLE_KEY } from "../constants/constants";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { StFilterByStatusOptions } from "./StFilterByStatusOptions";
import { supportTicketsTableColumns } from "./SupportTicketsTableColumns";

/**
 * Renders a table of support tickets.
 *
 * @returns The rendered SupportTicketsTable component.
 */
export const SupportTicketsTable = () => {
  // Set the document title
  useDocumentTitle("Support");

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch support tickets data
  const { data, refetch } = useFetchSupportTickets();

  // Get store setSupportTicketsState action
  const { filteredData, setSupportTicketsState } = useSupportTicketsTableStore(
    useShallow((state) => ({
      filteredData: state.filteredData,
      setSupportTicketsState: state.setSupportTicketsState,
    })),
  );

  // Sync data with store
  useEffect(() => {
    refetch();
    setSupportTicketsState(data?.data || [], null, false);
  }, [refetch, data, setSupportTicketsState]);

  // Create a React table for support tickets data
  const table = useDataTable(
    supportTicketsTableColumns,
    filteredData,
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          <div className="flex items-center justify-between">
            {/* Heading of the support ticket table */}
            <DTHeading heading={TABLE_HEADING} />

            {/* Search, view and create support ticket container */}
            <div className="flex items-center gap-2">
              {/* Search box */}
              <DTSearchBox
                table={table}
                searchColumns={["subject"]}
                placeholder="Search all support tickets..."
              />
              {/* Create support ticket button */}
              <DTCreateButton entity="supportTicket" />
            </div>
          </div>
          {/* Data table container */}
          <div>
            {/* Main data table component to render the support tickets data. */}
            <StFilterByStatusOptions />
            <DataTable table={table} columnsLength={supportTicketsTableColumns.length} />
          </div>
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the support tickets data
        <DataTableSkeleton />
      )}
    </>
  );
};
