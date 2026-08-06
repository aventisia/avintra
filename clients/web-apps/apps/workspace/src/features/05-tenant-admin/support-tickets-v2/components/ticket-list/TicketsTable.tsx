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

import { TABLE_HEADING, TABLE_KEY } from "../../constants";
import { columnDisplayNames } from "../../constants/column-display-names";
import { columnVisibilityState } from "../../constants/column-visibility-state";
import { useFetchTickets } from "../../hooks/useFetchTickets";
import { TicketBulkActions } from "../ticket-row-actions/TicketBulkActions";
import { ticketTableColumns } from "./TicketTableColumns";

export const TicketsTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);
  const { data } = useFetchTickets();

  const table = useDataTable(
    ticketTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["title", "ticketNumber"]} placeholder="Search tickets..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton entity="ticket" />
            </div>
          </div>
          <DataTable table={table} columnsLength={ticketTableColumns.length} />
          <TicketBulkActions table={table} />
          <DTPagination table={table} isRowSelectionEnabled />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};
