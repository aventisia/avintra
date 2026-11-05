import { EmptyState } from "@avplatform/ui";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCNHeading,
  TableCNPagination,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { NavLink } from "react-router-dom";

import { QueryTabs } from "@/components/QueryTab";
import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import {
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
  TOOLS_INITIAL_STATE,
  TOOLS_PAGE_SIZE_OPTIONS,
} from "../constants/tools-table.constants";
import { useFetchTools } from "../hooks/useFetchTools.hook";
import { useTableTab } from "../hooks/useTableTab.hook";
import { getToolDetailsPath } from "../utils/tool-details-path.util";
import { getToolDisplayName } from "../utils/tool-name-formatter";
import { ToolIcon } from "./ToolIcon";
import { toolsTableColumns } from "./ToolsTableColumns";
import { ToolsTableSkeleton } from "./ToolsTableSkeleton";
import { ToolRowActions } from "./tool-row-actions/ToolRowActions";

const PAGINATION_PROPS = {
  pageSizeOptions: TOOLS_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "Tool", plural: "Tools" },
};

/**
 * Renders a list of tools with Personal, Shared, and Platform tabs.
 */
export const ToolsTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { isPlatformTab, isReadOnly, queryKey } = useTableTab();
  const { data, isLoading } = useFetchTools();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data || [],
    columns: toolsTableColumns(),
    getRowId: (tool) => tool.id ?? "",
    initialState: TOOLS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  const isReadOnlyTab = isReadOnly;

  return (
    <>
      {isLoading || !data ? (
        <ToolsTableSkeleton />
      ) : (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
              <QueryTabs tabs={[...TABLE_VIEW_TABS]} key={TABLE_TAB_QUERY_PARAM} />
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && <CrudCreateButton buttonText="Add" entity="tool" />}
            </div>
          </div>
          {/* Search for the card list */}
          <TableCNToolbar
            table={table}
            searchPlaceholder="Search tools..."
            withViewOptions={false}
          />

          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-surface px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <NavLink
                  key={row.id}
                  to={getToolDetailsPath(row.original.id ?? "", row.original.name, isPlatformTab)}
                >
                  <div className="flex cursor-pointer items-center justify-between rounded-lg border bg-surface px-3.5 py-2.5 transition-colors hover:border-line-strong">
                    {/* Left: Icon with centered content */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <ToolIcon
                          name={row.getValue("name") as string}
                          iconUrl={row.original.iconUrl}
                          className="h-6 w-6 object-contain"
                        />
                      </div>

                      {/* Middle: Name and Description */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">
                            {getToolDisplayName(row.getValue("name") as string)}
                          </div>
                          <span className="bg-sunken border border-line px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-ink-2 rounded-sm">
                            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {row.getValue("description") as string}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <ToolRowActions
                      rowId={row.original.id ?? ""}
                      name={row.original.name}
                      accessLevel={row.original.accessLevel}
                      isTenantWideAccess={row.original.isTenantWideAccess}
                      isResourceAccessRestricted={row.original.isResourceAccessRestricted}
                      isPlatformTool={isPlatformTab}
                    />
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <EmptyState
              className="rounded-lg border bg-surface py-8"
              primaryMessage="No tools found"
              secondaryMessage={isReadOnlyTab ? undefined : "Please add a new tool."}
            />
          )}

          <TableCNPagination table={table} {...PAGINATION_PROPS} />

          <ResourceUserAccessDialog queryKey={queryKey} />

          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      )}
    </>
  );
};
