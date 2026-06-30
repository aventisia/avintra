import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DataTable,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useEffect, useMemo } from "react";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";
import { HorizontalScrollWrapper } from "@/react-toolkit/ui/HorizontalScrollWrapper";

import { TABLE_HEADING } from "../constants";
import { useMyQueueData } from "../hooks/useMyQueueData";
import { useMyQueueParams } from "../hooks/useMyQueueParams";
import { TABS, TabValue } from "../types/my-queue-types";
import { generateColumnVisibility } from "../utils/my-queue-utils";
import { buildColumns } from "./my-queue-column";

export const MyQueueWokItemTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const { tabValue, setTabValue, queueId, setQueueId, updateParams } =
    useMyQueueParams();

  const { queues, inputSchema, tableData } = useMyQueueData(queueId, tabValue);

  useEffect(() => {
    // If queue not selected yet & queues are available
    if (!queueId && queues.length > 0) {
      const firstQueueId = queues[0].id;

      setQueueId(firstQueueId);
      updateParams({ qid: firstQueueId });
    }
  }, [queueId, queues, setQueueId, updateParams]);

  const columns = useMemo(() => buildColumns(inputSchema), [inputSchema]);

  const columnVisibility = useMemo(
    () => ({
      rowId: true,
      status: true,
      ...generateColumnVisibility(inputSchema),
    }),
    [inputSchema],
  );

  // Initialize the table
  const table = useDataTable(columns, tableData, columnVisibility, [], true);

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DTHeading heading={TABLE_HEADING} />
          <SearchableSelect
            options={queues.map((q) => ({
              value: q.id,
              label: q.name,
            }))}
            value={queueId ?? undefined}
            onValueChange={(value) => {
              setQueueId(value);
              updateParams({ qid: value ?? "" });
            }}
            className="min-w-60"
            size="sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <DTSearchBox searchColumn="rowId" table={table} />
          <Tabs
            value={tabValue}
            onValueChange={(v) => {
              setTabValue(v as TabValue);
              updateParams({ t: v });
            }}
          >
            <TabsList className="rounded-lg px-1.5 py-1">
              {TABS.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-3">
        <HorizontalScrollWrapper>
          <DataTable table={table} columnsLength={columns.length} />
        </HorizontalScrollWrapper>
        <DTPagination table={table} />
      </div>
    </div>
  );
};
