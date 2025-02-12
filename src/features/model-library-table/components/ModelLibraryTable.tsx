import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Separator } from "@/react-toolkit/ui/separator";
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchModels } from "../hooks/useFetchModels";
import { ModelCrudDialog } from "./model-crud-dialog/ModelCrudDialog";
import { modelLibraryTableColumns } from "./ModelLibraryTableColumns";
import { ModelsBulkActions } from "./ModelsBulkActions";

/**
 * Renders a table of models.
 *
 * @returns The rendered ModelLibraryTable component.
 */
export const ModelLibraryTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch models data
  const { data } = useFetchModels();

  const table = useDataTable(
    modelLibraryTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data?.data.length ? (
        <div className="mt-7 space-y-4 rounded-lg border bg-white p-4 shadow-xs">
          {/* Crud ops dialog */}
          <ModelCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search model..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton buttonText="Create new model" />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border">
              <DataTable
                table={table}
                columnsLength={modelLibraryTableColumns.length}
              />
            </div>
          </ModelCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <ModelsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the models data
        <DataTableSkeleton />
      )}
    </>
  );
};
