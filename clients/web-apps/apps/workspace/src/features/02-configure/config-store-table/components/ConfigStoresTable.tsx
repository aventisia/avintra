import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useMemo } from "react";

import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import {
  CONFIG_STORES_INITIAL_STATE,
  CONFIG_STORES_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchConfigStores } from "../hooks/useFetchConfigStores";
import { useTableTab } from "../hooks/useTableTab";
import { configStoresTableColumns } from "./ConfigStoresTableColumns";
import { ConfigStoresBulkActions } from "./config-store-row-actions/ConfigStoresBulkActions";

const PAGINATION_PROPS = { pageSizeOptions: CONFIG_STORES_PAGE_SIZE_OPTIONS };

/**
 * Renders a table of config stores.
 *
 * @returns The rendered ConfigStoresTable component.
 */
export const ConfigStoresTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  // Fetch the merged config stores data
  const { data } = useFetchConfigStores();

  const columns = useMemo(() => configStoresTableColumns(), []);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    getRowId: (row) => row.id ?? "",
    initialState: CONFIG_STORES_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and create action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
            </div>
            <div className="flex items-center gap-2">
              <DTCreateButton entity="configstore" />
            </div>
          </div>
          {/* Table with its toolbar, pagination footer, and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<ConfigStoresBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search key stores..." />
          </TableCN>
          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} allowInProd />
          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the config stores data
        <TableCNSkeleton columnCount={6} withSearch />
      )}
    </>
  );
};
