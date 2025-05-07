import { Separator } from "@aventisia/ui";
import {
  DataTable,
  DataTableSkeleton,
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchModels } from "../hooks/useFetchModels";

import { ModelCrudDialog } from "./model-crud-dialog/ModelCrudDialog";
import { ModelsBulkActions } from "./ModelsBulkActions";
import { modelsTableColumns } from "./ModelsTableColumns";

/**
 * Renders a table of models.
 *
 * @returns The rendered ModelsTable component.
 */
export const ModelsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch models data
  const { data } = useFetchModels();

  const table = useDataTable(
    modelsTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
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
                <DTCreateButton buttonText="Create Model" />
              </div>
            </div>

            {/* Data table to render data */}
            <DataTable
              table={table}
              columnsLength={modelsTableColumns.length}
            />
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
