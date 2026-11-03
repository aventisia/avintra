import { EmptyState } from "@avplatform/ui";
import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCNHeading,
  TableCNPagination,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { NavLink } from "react-router-dom";

import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import { KB_INITIAL_STATE, KB_PAGE_SIZE_OPTIONS, TABLE_HEADING, TABLE_KEY } from "../constants";
import { useFetchKnowledgeBase } from "../hooks/useFetchKnowledgeBase";
import { useTableTab } from "../hooks/useTableTab";
import { KBTableColumns } from "./KBTableColumns";
import { KBTableSkeleton } from "./KBTableSkeleton";
import { KBRowActions } from "./kb-row-actions/KBRowActions";

const PAGINATION_PROPS = {
  pageSizeOptions: KB_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "KB", plural: "KBs" },
};

/**
 * Renders a list of knowledge bases
 */
export const KnowledgeBaseTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  // Fetch the merged knowledge bases data
  const { data } = useFetchKnowledgeBase();

  const KBTableColumnsArray = KBTableColumns();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data || [],
    columns: KBTableColumnsArray,
    getRowId: (knowledgeBase) => knowledgeBase.id ?? "",
    initialState: KB_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  // Return the rendered card list.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>
            <div className="flex items-center gap-2">
              <CrudCreateButton buttonText="Add" entity="knowledgeBase" />
            </div>
          </div>
          {/* Search for the card list */}
          <TableCNToolbar table={table} searchPlaceholder="Search..." withViewOptions={false} />
          {/* TableCN with only rows and custom design */}
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-surface px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <NavLink
                  key={row.id}
                  to={`/configure/knowledge-base/${row.original.id}?kb=${row.getValue("name")}`}
                >
                  <div className="flex flex-col cursor-pointer h-36  justify-between rounded-lg border bg-surface p-2.5 transition-colors hover:border-line-strong">
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between items-center">
                        <div className="flex max-w-80 items-center gap-3 ">
                          <div className="w-auto truncate text-sm font-medium">
                            {row.getValue("name")}
                          </div>
                          <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem]  flex items-center justify-center  text-ink-2    rounded-sm">
                            {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
                          </span>
                          {row.original.isResourceAccessRestricted && (
                            <span className="border border-warn/35 bg-warn/10 px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-warn rounded-sm">
                              Restricted
                            </span>
                          )}
                        </div>
                        {/* Action trigger */}
                        <KBRowActions
                          rowId={row.original.id || ""}
                          accessLevel={row.original.accessLevel}
                          isTenantWideAccess={row.original.isTenantWideAccess || false}
                          isResourceAccessRestricted={
                            row.original.isResourceAccessRestricted || false
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
                        Created on {formatDate(row.getValue("createdOn"))}
                      </p>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <EmptyState
              className="rounded-lg border bg-surface py-8"
              primaryMessage="No knowledge base found"
              secondaryMessage="Please add new knowledge base."
            />
          )}
          {/* Card list pagination */}
          <TableCNPagination table={table} {...PAGINATION_PROPS} />

          <ResourceUserAccessDialog queryKey={queryKey} />
          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      ) : (
        // Show data table skeleton while fetching the configs data
        <KBTableSkeleton />
      )}
    </>
  );
};
