import { useFetchRunReviewRecords } from "@/features/run-review/hooks/useFetchRunReviewRecords";

import { Separator } from "@aventisia/ui";
import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";

import { SEARCH_COLUMN, TABLE_HEADING } from "../../constants";
import { columnDisplayNames } from "../../constants/column-display-names";
import { columnVisibilityState } from "../../constants/column-visibility-state";
import { RunReviewBulkActions } from "../RunReviewBulkActions";
import RunReviewStats from "../RunReviewStats";
import { RunReviewCrudDialog } from "../run-review-crud-dialog/RunReviewCrudDialog";
import { getRunReviewTableColumns } from "./RunReviewTableColumns";

export const RunReviewTable = () => {
  const { data } = useFetchRunReviewRecords();
  const columns = data ? getRunReviewTableColumns(data.data) : [];

  const table = useDataTable(
    columns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  useDocumentTitle(TABLE_HEADING);

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px] px-1">
          <RunReviewCrudDialog>
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton buttonText="Upload Records" />
              </div>
            </div>

            <RunReviewStats />

            {/* ✅ Scrollable Table Area */}
            <ScrollArea className="w-[calc(100vw-1.5rem)]">
              <div className="rounded-md border bg-white">
                <DataTable table={table} columnsLength={columns.length} />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </RunReviewCrudDialog>

          <DTPagination table={table} />
          <RunReviewBulkActions table={table} />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};
