import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";

import {
  TABLE_HEADING,
  TABLE_KEY,
  TICKETS_INITIAL_STATE,
  TICKETS_PAGE_SIZE_OPTIONS,
} from "../../constants";
import { useFetchTickets } from "../../hooks/useFetchTickets";
import { TicketBulkActions } from "../ticket-row-actions/TicketBulkActions";
import { ticketTableColumns } from "./TicketTableColumns";

const PAGINATION_PROPS = { pageSizeOptions: TICKETS_PAGE_SIZE_OPTIONS };

export const TicketsTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { data } = useFetchTickets();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: ticketTableColumns,
    getRowId: (row) => row.id ?? "",
    initialState: TICKETS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["title", "ticketNumber"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>
            <div className="flex items-center gap-2">
              <CrudCreateButton entity="ticket" />
            </div>
          </div>
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<TicketBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search tickets..." />
          </TableCN>
        </div>
      ) : (
        <TableCNSkeleton columnCount={10} />
      )}
    </>
  );
};
