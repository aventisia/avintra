import {
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable } from "@aventisia/ui/hooks";
import { useParams } from "react-router-dom";

import { DETAIL_TABLE_KEY } from "../../constants";
import { columnDisplayNames } from "../../constants/kb-files-column-display-names";
import { columnVisibilityState } from "../../constants/kb-files-column-visibility-state";
import { useFetchKBFiles } from "../../hooks/useFetchKBFiles";
import AddFileDD from "./AddFileDropDown";
import { KBFileUploadDialog } from "./KBFileUploadDialog";
import { KBFilesTableColumns } from "./KBFilesTableColumns";
import { KBRetrievalSection } from "./KBRetrievalSection";
import { TableHeading } from "./TableHeading";

/**
 * Renders a table of KBFilesFiles.
 *
 * @returns The rendered KBFilesTable component.
 */
export const KBFilesTable = () => {
  const { id } = useParams();
  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    DETAIL_TABLE_KEY,
    columnVisibilityState,
  );

  // Fetch KBFilesFiles data
  const { data } = useFetchKBFiles();
  // const data = { data: [] };

  // Create a React table for KBFilesFiles data
  const table = useDataTable(
    KBFilesTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        // <div className='h-[calc(100vh-2.5*var(--header-height))] grid grid-cols-10 gap-5'>

        <div className="space-y-4 h-full   pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <TableHeading kbName={id} />
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumn={"id"}
                placeholder="Search..."
              />
              <DTViewOptions
                {...{ table, columnDisplayNames, tableKey: DETAIL_TABLE_KEY }}
              />
              <AddFileDD />
            </div>
          </div>
          <div className="grid grid-cols-9 h-[calc(100vh-2.7*var(--header-height))] gap-3">
            <div className="col-span-6 space-y-4">
              {/* Data table to render data */}
              <DataTable
                table={table}
                columnsLength={KBFilesTableColumns.length}
              />

              {/* Data table Pagination component */}
              <DTPagination table={table} />
            </div>
            <div className="col-span-3 border bg-background rounded-lg">
              <KBRetrievalSection />
            </div>
          </div>
          <KBFileUploadDialog />
        </div>
      ) : (
        // Show data table skeleton while fetching the WorkItems data
        <DataTableSkeleton />
      )}
    </>
  );
};
