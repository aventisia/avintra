import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNSkeleton,
  TableCNSortMenu,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { useMemo, useState } from "react";

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

const PAGINATION_PROPS = {
  pageSizeOptions: CONFIG_STORES_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "key store", plural: "key stores" },
};

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

  // Controlled search so the name cell can highlight matches, like the Agents page
  const [searchText, setSearchText] = useState("");
  const columns = useMemo(() => configStoresTableColumns({ searchText }), [searchText]);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    getRowId: (row) => row.id ?? "",
    initialState: CONFIG_STORES_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
    globalFilter: searchText,
    onGlobalFilterChange: setSearchText,
  });

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-6 pt-6">
          {/* Page heading and create action */}
          <div className="space-y-4">
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
              <TableCNToolbar table={table} searchPlaceholder="Search key stores...">
                <TableCNSortMenu table={table} />
              </TableCNToolbar>
            </TableCN>
          </div>
          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} allowInProd />
          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the config stores data
        <TableCNSkeleton columnCount={7} filterCount={2} withSearch className="py-5" />
      )}
    </>
  );
};
