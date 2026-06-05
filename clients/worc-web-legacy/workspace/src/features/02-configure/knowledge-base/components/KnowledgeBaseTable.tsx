import { QueryTabs } from "@/components/QueryTab";
import ResourceShareDialog from "@/features/resource-share/components/ResourceShareDialog";

import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { dateFormatter } from "@aventisia/ui/utils";
import { NavLink } from "react-router-dom";

import {
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
} from "../constants";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchKnowledgeBase } from "../hooks/useFetchKnowledgeBase";
import { useTableTab } from "../hooks/useTableTab";
import { KBTableColumns } from "./KBTableColumns";
import { KBTableSkeleton } from "./KBTableSkeleton";
import { KBCrudDialog } from "./kb-crud-dialog/KBCrudDialog";
import { KBRowActions } from "./kb-row-actions/KBRowActions";

/**
 * Renders a list of knowledge bases
 */
export const KnowledgeBaseTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(
    TABLE_KEY,
    columnVisibilityState,
  );

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { isPersonal, queryKey, currentTab } = useTableTab();

  // Fetch configs data
  const { data } = useFetchKnowledgeBase();

  // Create a React table for configs data
  const table = useDataTable(
    KBTableColumns,
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
          <KBCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DTHeading heading={TABLE_HEADING} />
                <QueryTabs tabs={TABLE_VIEW_TABS} key={TABLE_TAB_QUERY_PARAM} />
              </div>
              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search..."
                />
                {isPersonal && <DTCreateButton buttonText="Add" />}
              </div>
            </div>
            {/* DT with only rows and custom design */}
            {table.getRowModel().rows?.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 rounded-lg border bg-white px-2.5 py-3">
                {table.getRowModel().rows.map((row) => (
                  <NavLink
                    key={row.id}
                    to={`/configure/knowledge-base/${row.original.id}?kb=${row.getValue("name")}&${TABLE_TAB_QUERY_PARAM}=${currentTab}`}
                  >
                    <div className="flex flex-col cursor-pointer h-36  justify-between rounded-lg border bg-background p-2.5 shadow-sm transition-shadow hover:border-primary-200 hover:ring-1 hover:ring-primary-200">
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between items-center">
                          <div className="flex max-w-80 items-center gap-3 ">
                            <div className="w-auto truncate text-sm font-medium">
                              {row.getValue("name")}
                            </div>
                            {row.original.accessLevel !== "Owner" && (
                              <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem]  flex items-center justify-center  text-primary    rounded-full">
                                {row.original.accessLevel?.replace(
                                  /([A-Z])/g,
                                  " $1",
                                )}
                              </span>
                            )}
                          </div>
                          {/* Action trigger */}
                          <KBRowActions
                            rowId={row.original.id || ""}
                            accessLevel={row.original.accessLevel}
                            isTenantWideAccess={
                              row.original.isTenantWideAccess || false
                            }
                            name={row.original.name}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-3">
                          {row.getValue("description") as string}
                        </span>
                      </div>
                      <div className="border-t py-2.5 h-7 w-full">
                        <p className="text-xs text-muted-foreground">
                          Created on {dateFormatter(row.getValue("createdOn"))}
                        </p>
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            ) : (
              <div className="flex h-24 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-2.5 py-3">
                <p className="text-sm text-muted-foreground">
                  No knowledge base found. Please add new knowledge base.
                </p>
              </div>
            )}
          </KBCrudDialog>
          {/* Data table Pagination component */}
          <DTPagination table={table} singularLabel="KB" pluralLabel="KBs" />

          {/* Resource Share Dialog component */}
          <ResourceShareDialog queryKey={queryKey} />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <KBTableSkeleton />
      )}
    </>
  );
};
