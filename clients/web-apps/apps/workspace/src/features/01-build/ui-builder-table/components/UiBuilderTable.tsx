import { NoContentMessage } from "@avplatform/ui";
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
import { LayoutTemplate } from "lucide-react";

import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import { TABLE_HEADING, TABLE_KEY, UI_BUILDER_QUERY_KEY } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchUiBuilderProjects } from "../hooks/useFetchUiBuilderProjects";
import { UiBuilderBulkActions } from "./UiBuilderBulkActions";
import { uiBuilderTableColumns } from "./UiBuilderTableColumns";
import UiBuilderDisableDialog from "./ui-builder-row-actions/UiBuilderDisableDialog";

/**
 * Renders a table of custom UI builder projects.
 *
 * @returns The rendered UiBuilderTable component.
 */
export const UiBuilderTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  const { data } = useFetchUiBuilderProjects();

  const columnsArray = uiBuilderTableColumns();

  const table = useDataTable(columnsArray, data?.data || [], columnVisibility, sortState, true);

  const hasNoProjects = (data?.data?.length ?? 0) === 0;

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <DTHeading heading={TABLE_HEADING} />
            <div className="flex items-center gap-2">
              <DTSearchBox
                table={table}
                searchColumns={["name"]}
                placeholder="Search projects..."
              />
              <DTViewOptions {...{ table, columnDisplayNames, tableKey: TABLE_KEY }} />
              <DTCreateButton entity="uiBuilder" />
            </div>
          </div>
          {/* Table view of the UI builder projects data */}
          {table.getRowModel().rows.length > 0 ? (
            <>
              <DataTable table={table} columnsLength={columnsArray.length} />
              <DTPagination table={table} />
            </>
          ) : (
            <NoContentMessage
              Icon={LayoutTemplate}
              primaryMessage={
                hasNoProjects ? "No UI builder projects created" : "No projects found"
              }
              secondaryMessage={
                hasNoProjects ? "Click on create to get started." : "Try adjusting your search."
              }
              className="h-64"
            />
          )}
          {/* Bulk actions for data table */}
          <UiBuilderBulkActions table={table} />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
      <UiBuilderDisableDialog />
      <ResourceUserAccessDialog queryKey={UI_BUILDER_QUERY_KEY} allowInProd />
    </>
  );
};
