import { CrudCreateButton } from "@avplatform/ui/crud-dialog";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import {
  TableCN,
  TableCNHeading,
  TableCNSkeleton,
  TableCNToolbar,
  useTableCN,
} from "@avplatform/ui/table-cn";
import { useMemo } from "react";

import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";

import {
  EMAIL_TRIGGERS_INITIAL_STATE,
  EMAIL_TRIGGERS_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../constants";
import { useFetchTriggers } from "../hooks/useFetchTriggers";
import { useTableTab } from "../hooks/useTableTab";
import { triggersTableColumns } from "./TriggersTableColumns";

// import { TriggerBulkActions } from "./table-actions/TriggerBulkActions";

const PAGINATION_PROPS = { pageSizeOptions: EMAIL_TRIGGERS_PAGE_SIZE_OPTIONS };

/**
 * Renders a table of triggers.
 *
 * @returns The rendered triggersTable component.
 */
export const EmailTriggersTable = () => {
  // Set the document title
  useDocumentTitle(`${TABLE_HEADING}`);

  // Get the query key used to invalidate both merged lists after a mutation
  const { queryKey } = useTableTab();

  // Fetch triggers data
  const { isLoading, data } = useFetchTriggers();

  const columns = useMemo(() => triggersTableColumns(), []);

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data ?? [],
    columns,
    initialState: EMAIL_TRIGGERS_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  // Return the rendered TableCN component.
  return (
    <>
      {!isLoading ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and create action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableCNHeading heading={TABLE_HEADING} />
            </div>
            <div className="flex items-center gap-2">
              <CrudCreateButton entity="emailTrigger" />
            </div>
          </div>
          {/* Table with its toolbar, pagination footer, and (commented) bulk actions */}
          <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
            <TableCNToolbar table={table} searchPlaceholder="Search triggers..." />
          </TableCN>

          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} />

          {/* Bulk actions for data table */}
          {/* <TriggerBulkActions table={table} /> */}
        </div>
      ) : (
        // Show a table-shaped placeholder while fetching the triggers data
        <TableCNSkeleton columnCount={columns.length} />
      )}
    </>
  );
};
