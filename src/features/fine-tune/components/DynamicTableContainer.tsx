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
import { useEffect, useState } from "react";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { historyTablecolumnDisplayNames } from "../constants/history-table-column-display-names";
import { historyTablecolumnVisibilityState } from "../constants/history-table-column-visibility-state";
import { useFetchFineTuneRecords } from "../hooks/useFetchFineTuneRecords";
import { useFetchHistoryRecords } from "../hooks/useFetchHistoryRecords";
import { useScheduleFineTuneStore } from "../stores/schedule-fine-tune-store";
import { FineTuneBulkActions } from "./FineTuneBulkActions";
import FineTuneStats from "./FineTuneStats";
import { FineTuneCrudDialog } from "./fine-tune-crud-dialog/FineTuneCrudDialog";
import { getFineTuneTableColumns } from "./fine-tune-table/FineTuneTableColumns";
import { HistoryCrudDialog } from "./history-table-crud-dialog/HistoryCrudDialog";
import { historyTableColumns } from "./history-table/HistoryTableColumns";

export const DynamicTableContainer = () => {
  const { data: fineTuneTableData } = useFetchFineTuneRecords();
  const { data: historyTableData } = useFetchHistoryRecords();
  const [activeTab, setActiveTab] = useState("fine-tune");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const columns = fineTuneTableData
    ? getFineTuneTableColumns(fineTuneTableData.data)
    : [];

  const fineTuneTable = useDataTable(
    columns,
    fineTuneTableData?.data || [],
    columnVisibilityState,
    true,
  );

  const historyTable = useDataTable(
    historyTableColumns,
    historyTableData?.data || [],
    historyTablecolumnVisibilityState,
    true,
  );

  const { setSelectedFileIds } = useScheduleFineTuneStore();
  const tableRowState = fineTuneTable.getState().rowSelection;

  useEffect(() => {
    const selectedRows = fineTuneTable.getSelectedRowModel().rows;
    const selectedDocIds = selectedRows
      .map((row) => row.original.docId)
      .filter(Boolean);

    setSelectedFileIds(selectedDocIds);
  }, [tableRowState, setSelectedFileIds, fineTuneTable]);

  useDocumentTitle(TABLE_HEADING);

  if (!fineTuneTable || !historyTable) {
    return <DataTableSkeleton />;
  }

  return (
    <div className="space-y-4 pb-4 px-1">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <DTHeading heading={TABLE_HEADING} />
            <TabsList className="bg-slate-200 rounded-full">
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
            {activeTab === "fine-tune" ? (
              <>
                <DTSearchBox
                  table={fineTuneTable}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search..."
                />
                <DTViewOptions
                  table={fineTuneTable}
                  columnDisplayNames={columnDisplayNames}
                />
              </>
            ) : (
              <>
                <DTSearchBox
                  table={historyTable}
                  searchColumn={""}
                  placeholder="Search..."
                />
                <DTViewOptions
                  table={historyTable}
                  columnDisplayNames={historyTablecolumnDisplayNames}
                />
              </>
            )}
          </div>
        </div>

        <TabsContent value="fine-tune">
          <FineTuneCrudDialog>
            <div className="mb-4">
              <FineTuneStats />
            </div>
            <ScrollArea className="w-[calc(100vw-1.5rem)] mb-4">
              <div className="bg-white rounded-lg">
                <DataTable
                  table={fineTuneTable}
                  columnsLength={columns.length}
                />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <DTPagination table={fineTuneTable} />
            <FineTuneBulkActions table={fineTuneTable} />
          </FineTuneCrudDialog>
        </TabsContent>

        <TabsContent value="history">
          <HistoryCrudDialog>
            <div className="mb-4">
              <FineTuneStats />
            </div>
            <ScrollArea className="w-[calc(100vw-1.5rem)] mb-4">
              <div className="bg-white rounded-lg">
                <DataTable
                  table={historyTable}
                  columnsLength={historyTableColumns.length}
                />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <DTPagination table={historyTable} />
          </HistoryCrudDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};
