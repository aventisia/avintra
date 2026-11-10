import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCN, TableCNHeading, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import { SearchableSelect } from "@/components/searchable-select/SearchableSelect";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
} from "@/components/segmented-tabs.constant";

import {
  MY_QUEUES_INITIAL_STATE,
  MY_QUEUES_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
} from "../../constants";
import { QueueTypesEnum } from "../../enums/queue-instance-type-enum";
import { QueueProcessingModeEnum } from "../../enums/queue-processing-mode-enum";
import { useGetNextItemMutation } from "../../hooks/useGetNextItemMutation";
import { useMyQueueData } from "../../hooks/useMyQueueData";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { TabValue } from "../../types/my-queue-types";
import { buildTabs, generateColumnVisibility } from "../../utils/my-queue-utils";
import HistoryDateRangeFilter, { DateRange } from "../history/HistoryDateRangeFilter";
import { buildColumns } from "../my-queue-column";

const PAGINATION_PROPS = { pageSizeOptions: MY_QUEUES_PAGE_SIZE_OPTIONS };

export const MyQueueWokItemTable = () => {
  useDocumentTitle(TABLE_HEADING);

  const {
    tabValue,
    setTabValue,
    queueId,
    queueName,
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

  const currentQueue = useMemo(() => queues.find((q) => q.id === queueId), [queues, queueId]);
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

  const columnVisibility = useMemo(
    () => ({
      rowId: true,
      status: true,
      ...generateColumnVisibility(inputSchema),
    }),
    [inputSchema],
  );

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: tableData,
    columns,
    initialState: { ...MY_QUEUES_INITIAL_STATE, columnVisibility },
    persistKey: TABLE_KEY,
    searchColumns: ["rowId"],
  });

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      {/* Breadcrumb to navigate back to the Queues overview screen. */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/assist/queues">Queues</NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate capitalize">
              {queueName ?? currentQueue?.name ?? TABLE_HEADING}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableCNHeading heading={TABLE_HEADING} />
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
          {isFifo && tabValue === "Current" && (
            <Button size="xs" onClick={() => getNextItem()} disabled={isClaiming || !queueId}>
              {isClaiming ? "Claiming..." : "Get Next Item"}
            </Button>
          )}
          {tabValue === "History" && (
            <HistoryDateRangeFilter value={dateRange} onChange={setDateRange} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={tabValue}
            onValueChange={(v) => {
              setTabValue(v as TabValue);
              updateParams({ t: v });
            }}
          >
            <TabsList className={SEGMENTED_TABS_LIST_CLASS}>
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab} className={SEGMENTED_TABS_TRIGGER_CLASS}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Table with its toolbar and pagination footer */}
      <TableCN table={table} label={TABLE_HEADING} paginationProps={PAGINATION_PROPS}>
        <TableCNToolbar table={table} searchPlaceholder="Search..." />
      </TableCN>
    </div>
  );
};
