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

import { HelpButton } from "@/components/help/HelpButton";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import { DATA_QUERY_KEY, TABLE_HEADING, TABLE_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchSpaces } from "../hooks/useFetchSpaces";
import { spacesTableColumns } from "./SpacesTableColumns";

/**
 * Renders a table of spaces.
 *
 * @returns The rendered SpacesTable component.
 */
export const SpacesTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Fetch spaces data
  const { data } = useFetchSpaces();

  // Create a React table for spaces data
  const table = useDataTable(
    spacesTableColumns,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex w-max flex-col gap-0.5">
              <div className="flex w-max items-center gap-2">
                <DTHeading heading={TABLE_HEADING} />
                <HelpButton guideId="spaces" />
              </div>
              <p className="ml-1 max-w-md text-sm text-muted-foreground">
                A logical container that acts as a global filtering / scoping dimension across the
                platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search spaces..." />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton buttonText="Create Space" entity="space" />
            </div>
          </div>

          {/* Data table to render data */}
          <DataTable table={table} columnsLength={spacesTableColumns.length} />
          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Resource Share Dialog component */}
          <ResourceShareDialog queryKey={DATA_QUERY_KEY} />
        </div>
      ) : (
        // Show data table skeleton while fetching the spaces data
        <DataTableSkeleton />
      )}
    </>
  );
};
