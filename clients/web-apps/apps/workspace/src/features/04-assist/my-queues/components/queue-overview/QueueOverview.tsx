import { useDocumentTitle } from "@avplatform/ui/hooks";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { TABLE_HEADING } from "../../constants";
import { QueueTypesEnum } from "../../enums/queue-instance-type-enum";
import { useFetchQueues } from "../../hooks/useFetchQueues";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import HistoryDateRangeFilter, { DateRange } from "../history/HistoryDateRangeFilter";
import { QueueSummaryCard } from "./QueueSummaryCard";
import { QueueTypeSwitch } from "./QueueTypeSwitch";

/**
 * Renders the overview screen for the Assist > Queues section. Summarizes all
 * queues the user has access to, showing the total item count for each. A switch
 * toggles between the user's own queues and the agent queues they can view.
 * Clicking a queue navigates to the work-item list screen with that queue
 * pre-selected.
 */
export const QueueOverview = () => {
  useDocumentTitle(TABLE_HEADING);

  const { setQueueId, setQueueName, updateParams, queueType, setQueueType } = useMyQueueParams();

  // Date range for the "Completed" metrics. Defaults to today only.
  const today = useMemo(() => new Date(), []);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: today,
  });

  const { data, isLoading } = useFetchQueues({ onlyUserQueues: true, queueType, dateRange });

  const queues = data?.data ?? [];

  const isAgent = queueType === QueueTypesEnum.Agent;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (queues.length === 0) {
    return (
      <div className="space-y-4 pb-4 pt-[17px]">
        <div className="flex items-start justify-between gap-2">
          <QueueTypeSwitch value={queueType} onChange={setQueueType} />
        </div>
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
          <p className="text-sm font-medium text-accent-foreground">No queues available</p>
          <p className="text-xs text-muted-foreground">
            {isAgent
              ? "You don't have access to any agent queues yet."
              : "You don't have access to any queues yet."}
          </p>
        </div>
      </div>
    );
  }

  const openQueue = (queue: (typeof queues)[number]) => {
    setQueueId(queue.id);
    setQueueName(queue.name);
    updateParams({ qid: queue.id, qn: queue.name, t: "Current", qt: queueType });
  };

  const handleQueueTypeChange = (value: QueueTypesEnum) => {
    setQueueType(value);
    updateParams({ qt: value });
  };

  return (
    <div className="space-y-4 pb-6 pt-[17px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-accent-foreground">{TABLE_HEADING} Overview</h1>
          <p className="text-sm text-muted-foreground">
            {isAgent
              ? "A summary of the agent queues you have access to. Click a queue to view its work items."
              : "A summary of the queues you have access to. Click a queue to view its work items."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HistoryDateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Switch below the heading, matching the Usage screen placement. */}
      <QueueTypeSwitch value={queueType} onChange={handleQueueTypeChange} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {queues.map((queue) => (
          <QueueSummaryCard
            key={queue.id}
            queueName={queue.name}
            processingMode={queue.processingMode}
            agentsNames={queue.agentsNames}
            pending={queue.pending}
            inProgress={queue.inProgress}
            completed={queue.completed}
            averageAgeSeconds={queue.averageAgeSeconds}
            averageProcessingTimeSeconds={queue.averageProcessingTimeSeconds}
            onOpen={() => openQueue(queue)}
          />
        ))}
      </div>
    </div>
  );
};
