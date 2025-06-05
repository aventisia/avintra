import { Separator } from "@aventisia/ui";
import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
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
        <div className="space-y-4 pb-4 pt-[17px] px-1">
          <FineTuneCrudDialog>
            {/* ✅ Tabs wrapper surrounds both header and content */}
            <Tabs defaultValue="fine-tune" className="space-y-4">
              {/* ✅ Header with tabs in it */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DTHeading heading={TABLE_HEADING} />

                  <TabsList className="bg-slate-200 rounded-full ">
                    <TabsTrigger
                      value="fine-tune"
                      className="rounded-full data-[state=active]:text-primary text-xs"
                    >
                      Fine-tune
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="rounded-full data-[state=active]:text-primary text-xs"
                    >
                      History
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex items-center gap-2">
                  <DTSearchBox
                    table={table}
                    searchColumn={SEARCH_COLUMN}
                    placeholder="Search..."
                  />
                  <DTViewOptions {...{ table, columnDisplayNames }} />
                  <Separator orientation="vertical" className="mx-2 h-6" />
                </div>
              </div>

              <FineTuneStats />

              {/* ✅ TabsContent changes only below header */}
              <TabsContent value="fine-tune">
                <ScrollArea className="w-[calc(100vw-1.5rem)]">
                  <div className="rounded-md border bg-white">
                    <DataTable table={table} columnsLength={columns.length} />
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history">
                <div className="rounded-md border bg-white p-6 text-sm text-muted-foreground">
                  Coming soon
                </div>
              </TabsContent>
            </Tabs>
          </FineTuneCrudDialog>

          <DTPagination table={table} />
          <FineTuneBulkActions table={table} />
        </div>
      ) : (
        <DataTableSkeleton />
      )}
    </>
  );
};
