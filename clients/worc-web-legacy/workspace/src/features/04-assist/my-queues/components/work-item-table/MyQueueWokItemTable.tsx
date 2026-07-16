import {
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
} from "@aventisia/ui/data-table";
import { useDataTable, useDocumentTitle } from "@aventisia/ui/hooks";
import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useEffect, useMemo } from "react";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";
import { HorizontalScrollWrapper } from "@/react-toolkit/ui/HorizontalScrollWrapper";

import { TABLE_HEADING } from "../../constants";
import { useMyQueueData } from "../../hooks/useMyQueueData";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { TABS, TabValue } from "../../types/my-queue-types";
import { generateColumnVisibility } from "../../utils/my-queue-utils";
import { buildColumns, generateColumnsDisplayName } from "../my-queue-column";

export const MyQueueWokItemTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const {
    tabValue,
    setTabValue,
    queueId,
    setQueueName,
    setQueueId,
    updateParams,
  } = useMyQueueParams();

  const { queues, inputSchema, tableData } = useMyQueueData(queueId, tabValue);

  useEffect(() => {
    // If queue not selected yet & queues are available
    if (!queueId && queues.length > 0) {
      const firstQueue = queues[0];

      setQueueId(firstQueue.id);
      setQueueName(firstQueue.name);
      updateParams({ qid: firstQueue.id, qn: firstQueue.name });
    }
  }, [queueId, queues, setQueueId, setQueueName, updateParams]);

  const columns = useMemo(() => buildColumns(inputSchema), [inputSchema]);
  const columnsDisplayName = useMemo(
    () => generateColumnsDisplayName(inputSchema),
    [inputSchema],
  );

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
              updateParams({ qid: value ?? "", qn });
            }}
            className="min-w-60"
            size="sm"
          />
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
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="w-full rounded-lg py-0.5"
                >
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
