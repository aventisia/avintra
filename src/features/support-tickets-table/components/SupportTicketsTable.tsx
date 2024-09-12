import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { Separator } from "@/react-toolkit/ui/separator";
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants/constants";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";
import { SupportTicketCrudDialog } from "./support-ticket-crud-dialog/SupportTicketCrudDialog";
import { supportTicketsTableColumns } from "./SupportTicketsTableColumns";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { StFilterByStatusOptions } from "./StFilterByStatusOptions";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { cn } from "@/react-toolkit/lib/utils";
import { useNavigate } from "react-router-dom";
import { columnVisibilityState } from "../constants/column-visibility-state";

/**
 * Renders a table of support tickets.
 *
 * @returns The rendered SupportTicketsTable component.
 */
export const SupportTicketsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch support tickets data
  const { data, refetch } = useFetchSupportTickets();

  // Get store setSupportTicketsState action
  const {
    filteredData,
    selectedSupportTicket,
    userRole,
    setSupportTicketsState,
  } = useSupportTicketsTableStore(
    useShallow((state) => ({
      filteredData: state.filteredData,
      selectedSupportTicket: state.selectedSupportTicket,
      userRole: state.userRole,
      setSupportTicketsState: state.setSupportTicketsState,
    })),
  );

  // Sync data with store
  useEffect(() => {
    refetch();
    setSupportTicketsState(data?.data || [], selectedSupportTicket, userRole);
  }, [refetch, data, setSupportTicketsState, selectedSupportTicket, userRole]);

  const navigate = useNavigate();

  // Create a React table for support tickets data
  const table = useDataTable(
    supportTicketsTableColumns,
    filteredData,
    columnVisibilityState,
    true,
  );

  const openCreateSupportTicketPage = () => {
    // Navigate to create support ticket page
    navigate("/supportticket/create");
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
                <Separator orientation="vertical" className="mx-2 h-6" />
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
            <div className="rounded-md border">
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
