import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { Button } from "@avplatform/ui/buttons";
import { useEffect, useMemo, useState } from "react";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";

import { TABLE_HEADING } from "../../constants";
import { QueueProcessingModeEnum } from "../../enums/queue-processing-mode-enum";
import { QueueTypesEnum } from "../../enums/queue-instance-type-enum";
import { useGetNextItemMutation } from "../../hooks/useGetNextItemMutation";
import { useMyQueueData } from "../../hooks/useMyQueueData";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { TabValue } from "../../types/my-queue-types";
import { buildTabs, generateColumnVisibility } from "../../utils/my-queue-utils";
import { buildColumns, generateColumnsDisplayName } from "../my-queue-column";
import HistoryDateRangeFilter, { DateRange } from "../history/HistoryDateRangeFilter";

export const MyQueueWokItemTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const {
    tabValue,
    setTabValue,
    queueId,
    setQueueName,
    setQueueId,
    updateParams,
    queueType,
  } = useMyQueueParams();

  // History date range. Defaults to today only.
  const today = useMemo(() => new Date(), []);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: today,
  });

  const { queues, inputSchema, tableData } = useMyQueueData(
    queueId,
    tabValue,
    tabValue === "History" ? dateRange : undefined,
    queueType,
  );
  const { mutate: getNextItem, isPending: isClaiming } = useGetNextItemMutation();

  // Agent queue work items are view-only: no claim, no actions, no navigation.
  const isAgent = queueType === QueueTypesEnum.Agent;

  const tabs = useMemo(() => buildTabs(), []);

  const currentQueue = useMemo(
    () => queues.find((q) => q.id === queueId),
    [queues, queueId],
  );
  const isFifo = currentQueue?.processingMode === QueueProcessingModeEnum.Fifo;

  useEffect(() => {
    // If queue not selected yet & queues are available
    if (!queueId && queues.length > 0) {
      const firstQueue = queues[0];

      setQueueId(firstQueue.id);
      setQueueName(firstQueue.name);
      updateParams({ qid: firstQueue.id, qn: firstQueue.name, qt: queueType });
    }
  }, [queueId, queues, setQueueId, setQueueName, updateParams, queueType]);

  const columns = useMemo(
    () => buildColumns(inputSchema, isFifo, tabValue, isAgent),
    [inputSchema, isFifo, tabValue, isAgent],
  );
  const columnsDisplayName = useMemo(() => generateColumnsDisplayName(inputSchema), [inputSchema]);

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
              label: `${q.name} (${q.total})`,
            }))}
            value={queueId ?? undefined}
            onValueChange={(value) => {
              const qn = queues.find((q) => value == q.id)?.name ?? "";
              setQueueId(value);
              setQueueName(qn);
              updateParams({ qid: value ?? "", qn, qt: queueType });
            }}
            className="min-w-60"
            size="sm"
          />
          {isFifo && !isAgent && tabValue === "Current" && (
            <Button
              size="xs"
              onClick={() => getNextItem()}
              disabled={isClaiming || !queueId}
            >
              {isClaiming ? "Claiming..." : "Get Next Item"}
            </Button>
          )}
          {tabValue === "History" && (
            <HistoryDateRangeFilter value={dateRange} onChange={setDateRange} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <DTSearchBox searchColumns={["rowId"]} table={table} />
          <DTViewOptions
            table={table}
            tableKey="My_QUEUE"
            columnDisplayNames={columnsDisplayName}
          />
          <Tabs
            value={tabValue}
            onValueChange={(v) => {
              setTabValue(v as TabValue);
              updateParams({ t: v });
            }}
          >
            <TabsList className="h-fit w-full rounded-lg px-1.5 py-1">
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="w-full rounded-lg py-0.5">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-3">
        <DataTable table={table} columnsLength={columns.length} />
        <DTPagination table={table} />
      </div>
    </div>
  );
};
