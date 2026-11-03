import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";

import {
  MACHINES_INITIAL_STATE,
  MACHINES_PAGE_SIZE_OPTIONS,
  MACHINES_ROW_LABELS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchMachines } from "../hooks/useFetchMachines";
import { MachineStats } from "./MachineStats";
import { machinesTableColumns } from "./MachinesTableColumns";
import { MachinesBulkActions } from "./machine-row-actions/MachinesBulkActions";

const PAGINATION_PROPS = {
  pageSizeOptions: MACHINES_PAGE_SIZE_OPTIONS,
  rowLabels: MACHINES_ROW_LABELS,
};

/**
 * Renders a table of machines.
 *
 * @returns The rendered MachinesTable component.
 */
export const MachinesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch machines data
  const { data } = useFetchMachines();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: machinesTableColumns,
    getRowId: (row) => row.id,
    initialState: MACHINES_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name", "status", "username", "operatingSystem"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>
          </div>

          {/* Table with its toolbar, pagination footer, and bulk actions */}
          <div className="flex flex-col gap-2">
            <MachineStats data={data?.data} />
            <TableCN
              table={table}
              label={TABLE_HEADING}
              paginationProps={PAGINATION_PROPS}
              actionBar={<MachinesBulkActions table={table} />}
            >
              <TableCNToolbar
                table={table}
                searchPlaceholder="Search name, status, user or OS..."
              />
            </TableCN>
          </div>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the machines data
        <TableCNSkeleton columnCount={14} />
      )}
    </>
  );
};
