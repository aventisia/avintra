import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { useEffect } from "react";

import { SEARCH_COLUMN, TABLE_HEADING } from "../../constants";
import { columnDisplayNames } from "../../constants/column-display-names";
import { columnVisibilityState } from "../../constants/column-visibility-state";
import { useFetchFineTuneRecords } from "../../hooks/useFetchFineTuneRecords";
import { useScheduleFineTuneStore } from "../../stores/schedule-fine-tune-store";
import { FineTuneBulkActions } from "../FineTuneBulkActions";
import FineTuneStats from "../FineTuneStats";
import { FineTuneCrudDialog } from "../fine-tune-crud-dialog/FineTuneCrudDialog";
import { getFineTuneTableColumns } from "./FineTuneTableColumns";

export const FineTuneTable = () => {
  const { data } = useFetchFineTuneRecords();
  const columns = data ? getFineTuneTableColumns(data.data) : [];

  const table = useDataTable(
    columns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  const { setSelectedFileIds } = useScheduleFineTuneStore();
  const tableRowState = table.getState().rowSelection;

  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedDocIds = selectedRows
      .map((row) => row.original.docId)
      .filter(Boolean); // removes undefined/null if any

    setSelectedFileIds(selectedDocIds);
  }, [tableRowState, setSelectedFileIds, table]);

  useDocumentTitle(TABLE_HEADING);

  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4  px-1">
          <FineTuneCrudDialog>
            {/* ✅ Tabs wrapper surrounds both header and content */}
            {/* ✅ Header with tabs in it */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
              </div>
            </div>

            <FineTuneStats />
          </FineTuneCrudDialog>
          <div className="bg-white rounded-lg">
            <DataTable table={table} columnsLength={columns.length} />
          </div>
          <DTPagination table={table} />
          <FineTuneBulkActions table={table} />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};
