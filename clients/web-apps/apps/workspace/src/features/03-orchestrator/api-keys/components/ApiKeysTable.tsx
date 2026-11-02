import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNSkeleton, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { useMemo } from "react";

import {
  API_KEYS_INITIAL_STATE,
  API_KEYS_PAGE_SIZE_OPTIONS,
  API_KEYS_ROW_LABELS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchApiKeys } from "../hooks/useFetchApiKeys.hook";
import { getApiKeysTableColumns } from "./ApiKeysTableColumns";
import { ApiKeyBulkActions } from "./api-key-row-actions/ApiKeyBulkActions";

const PAGINATION_PROPS = {
  pageSizeOptions: API_KEYS_PAGE_SIZE_OPTIONS,
  rowLabels: API_KEYS_ROW_LABELS,
};

/**
 * Renders a table of API keys.
 */
export const ApiKeysTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch API keys data
  const { data } = useFetchApiKeys();

  // Build table columns
  const columns = useMemo(() => getApiKeysTableColumns(), []);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    getRowId: (row) => row.id,
    initialState: API_KEYS_INITIAL_STATE,
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
              <DTCreateButton buttonText="Create" entity="apiKey" />
            </div>
          </div>

          {/* Table with its toolbar, pagination footer, and bulk actions */}
          <TableCN
            table={table}
            label={TABLE_HEADING}
            paginationProps={PAGINATION_PROPS}
            actionBar={<ApiKeyBulkActions table={table} />}
          >
            <TableCNToolbar table={table} searchPlaceholder="Search API keys..." />
          </TableCN>
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the API keys data
        <TableCNSkeleton columnCount={12} />
      )}
    </>
  );
};
