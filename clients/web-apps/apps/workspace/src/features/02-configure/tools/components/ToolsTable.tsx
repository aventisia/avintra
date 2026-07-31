import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { formatDate } from "@avplatform/ui/utils";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";

import { QueryTabs } from "@/components/QueryTab";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import {
  COLUMN_VISIBILITY_STATE,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
} from "../constants/tools-table.constants";
import { useFetchTools } from "../hooks/useFetchTools.hook";
import { useTableTab } from "../hooks/useTableTab.hook";
import { toolsTableColumns } from "./ToolsTableColumns";
import { ToolRowActions } from "./tool-row-actions/ToolRowActions";
import { ToolsTableSkeleton } from "./ToolsTableSkeleton";

/**
 * Renders a list of tools with Personal, Shared, and Library tabs.
 */
export const ToolsTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, COLUMN_VISIBILITY_STATE);

  const { isShared, isLibrary, isReadOnly, queryKey, currentTab } = useTableTab();
  const { data, isLoading } = useFetchTools();

  const tableColumns = useMemo(
    () => toolsTableColumns(isShared, isLibrary),
    [isShared, isLibrary],
  );
  const table = useDataTable(tableColumns, data?.data || [], columnVisibility, sortState, true);

  const isReadOnlyTab = isReadOnly;

  return (
    <>
      {isLoading || !data ? (
        <ToolsTableSkeleton />
      ) : (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <QueryTabs tabs={[...TABLE_VIEW_TABS]} key={TABLE_TAB_QUERY_PARAM} />
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search tools..." />
              {!isReadOnly && <DTCreateButton buttonText="Add" entity="tool" />}
            </div>
          </div>

          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-white px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <NavLink
                  key={row.id}
                  to={`/configure/tools/${row.original.id}?tool=${row.getValue("name")}&${TABLE_TAB_QUERY_PARAM}=${currentTab}`}
                >
                    <div className="flex flex-col cursor-pointer h-36 justify-between rounded-lg border bg-background p-2.5 shadow-sm transition-shadow hover:border-primary-200 hover:ring-1 hover:ring-primary-200">
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between items-center">
                          <div className="flex max-w-80 items-center gap-3">
                            <div className="w-auto truncate text-sm font-medium">{row.getValue("name")}</div>
                            {isShared && (
                              <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-primary rounded-full">
                                {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
                              </span>
                            )}
                          </div>
                          <ToolRowActions
                            rowId={row.original.id ?? ""}
                            name={row.original.name}
                            accessLevel={row.original.accessLevel}
                            isTenantWideAccess={row.original.isTenantWideAccess}
                            isLibrary={isLibrary}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-3">
                          {row.getValue("description") as string}
                        </span>
                      </div>
                    <div className="border-t py-2.5 h-7 w-full">
                      <p className="text-xs text-muted-foreground">
                        Created on {formatDate(row.getValue("createdOn"))}
                      </p>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="flex h-24 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-2.5 py-3">
              <p className="text-sm text-muted-foreground">
                No tools found. {isReadOnlyTab ? "" : "Please add a new tool."}
              </p>
            </div>
          )}

          <DTPagination table={table} singularLabel="Tool" pluralLabel="Tools" />

          <ResourceShareDialog queryKey={queryKey} />
        </div>
      )}
    </>
  );
};
