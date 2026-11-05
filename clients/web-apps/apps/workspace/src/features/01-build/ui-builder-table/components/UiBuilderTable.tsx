import { EmptyState } from "@avplatform/ui";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { BrowserIcon } from "@phosphor-icons/react";

import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import {
  TABLE_HEADING,
  TABLE_KEY,
  UI_BUILDER_INITIAL_STATE,
  UI_BUILDER_PAGE_SIZE_OPTIONS,
  UI_BUILDER_QUERY_KEY,
} from "../constants";
import { useFetchUiBuilderProjects } from "../hooks/useFetchUiBuilderProjects";
import { UiBuilderBulkActions } from "./UiBuilderBulkActions";
import { uiBuilderTableColumns } from "./UiBuilderTableColumns";
import UiBuilderDisableDialog from "./ui-builder-row-actions/UiBuilderDisableDialog";

const PAGINATION_PROPS = { pageSizeOptions: UI_BUILDER_PAGE_SIZE_OPTIONS };

/**
 * Renders a table of custom UI builder projects.
 *
 * @returns The rendered UiBuilderTable component.
 */
export const UiBuilderTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { data } = useFetchUiBuilderProjects();

  const { table } = useTableCN({
    data: data?.data ?? [],
    columns: uiBuilderTableColumns(),
    initialState: UI_BUILDER_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  const hasNoProjects = (data?.data?.length ?? 0) === 0;

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and create action */}
          <div className="flex items-center justify-between">
            <TableCNHeading heading={TABLE_HEADING} />
            <div className="flex items-center gap-2">
              <CrudCreateButton buttonText="Create project" entity="uiBuilder" />
            </div>
          </div>
          {/* Table with its toolbar, pagination footer, and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<UiBuilderBulkActions table={table} />}
            emptyMessage={
              <EmptyState
                Icon={BrowserIcon}
                primaryMessage={
                  hasNoProjects ? "No UI builder projects created" : "No projects found"
                }
                secondaryMessage={
                  hasNoProjects ? "Click on create to get started." : "Try adjusting your search."
                }
                className="h-64"
              />
            }
          >
            <TableCNToolbar table={table} searchPlaceholder="Search projects..." />
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the UI builder projects
        <TableCNSkeleton columnCount={7} />
      )}
      <UiBuilderDisableDialog />
      <ResourceUserAccessDialog queryKey={UI_BUILDER_QUERY_KEY} allowInProd />
    </>
  );
};
