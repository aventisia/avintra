import { Button } from "@aventisia/ui/buttons";
import {
  DataTable,
  DataTableSkeleton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { cn } from "@aventisia/ui/lib";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { columnVisibilityState } from "../constants/column-visibility-state";
import {
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants/constants";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";

import { StFilterByStatusOptions } from "./StFilterByStatusOptions";
import { SupportTicketCrudDialog } from "./support-ticket-crud-dialog/SupportTicketCrudDialog";
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
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

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

  const navigate = useNavigate();

  // Create a React table for support tickets data
  const table = useDataTable(
    supportTicketsTableColumns,
    filteredData,
    columnVisibility,
    sortState,
    true,
  );

  const openCreateSupportTicketPage = () => {
    // Navigate to create support ticket page
    navigate("/tenant/support/ticket/create");
  };

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog for support ticket crud operation */}
          <SupportTicketCrudDialog>
            <div className="flex items-center justify-between">
              {/* Heading of the support ticket table */}
              <DTHeading heading={TABLE_HEADING} />

              {/* Search, view and create support ticket container */}
              <div className="flex items-center gap-2">
                {/* Search box */}
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search all support tickets..."
                />
                {/* Column view filter */}
                {/* <DTViewOptions table={table} /> */}
                {/* Create support ticket button */}
                <Button
                  size={"xs"}
                  className={cn("gap-2 text-sm tracking-wide")}
                  onClick={openCreateSupportTicketPage}
                >
                  <PlusIcon className="h-4 w-4" />
                  New ticket
                </Button>
              </div>
            </div>
            {/* Data table container */}
            <div>
              {/* Main data table component to render the support tickets data. */}
              <StFilterByStatusOptions />
              <DataTable
                table={table}
                columnsLength={supportTicketsTableColumns.length}
              />
            </div>
            {/* Content of support ticket curd dialog for create, read, update actions */}
          </SupportTicketCrudDialog>
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
