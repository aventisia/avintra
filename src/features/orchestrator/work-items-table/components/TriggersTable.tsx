import { Separator } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTPagination,
  DTSearchBox,
} from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";

import { useFetchQueuesWorkItems } from "../hooks/useFetchQueuesWorkItems";

import { PayloadTableHeading } from "./TableHeading";
import { triggersTableColumns } from "./TriggersTableColumns";

/**
 * Renders a table of triggers.
 *
 * @returns The rendered triggersTable component.
 */
export const TriggersTable = () => {
  // Set the document title
  // useDocumentTitle(TABLE_HEADING);

  // Fetch triggers data
  const { data } = useFetchQueuesWorkItems();

  // Create a React table for triggers data
  const table = useDataTable(
    triggersTableColumns,
    data?.data || [],
    {},
    [],
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <PayloadTableHeading queueName={data?.data[0]?.queueName || ""} />
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={"id"}
                placeholder="Search..."
              />
              {/* <DTViewOptions {...{ table, columnDisplayNames }} /> */}
              <Separator orientation="vertical" className="mx-2 h-6" />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable
            table={table}
            columnsLength={triggersTableColumns.length}
          />

          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the triggers data
        <DataTableSkeleton />
      )}
    </>
  );
};
