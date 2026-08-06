import { useDocumentTitle } from "@avplatform/ui/hooks";
import { Loader2 } from "lucide-react";

import { TABLE_HEADING } from "../../constants";
import { useFetchQueues } from "../../hooks/useFetchQueues";
import { useMyQueueParams } from "../../hooks/useMyQueueParams";
import { QueueSummaryCard } from "./QueueSummaryCard";

/**
 * Renders the overview screen for the Assist > Queues section. Summarizes all
 * queues the user has access to, showing the total item count for each. Clicking
 * a queue navigates to the work-item list screen with that queue pre-selected.
 */
export const QueueOverview = () => {
  useDocumentTitle(TABLE_HEADING);

  const { setQueueId, setQueueName, updateParams } = useMyQueueParams();
  const { data, isLoading } = useFetchQueues({ onlyUserQueues: true });

  const queues = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (queues.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
        <p className="text-sm font-medium text-accent-foreground">No queues available</p>
        <p className="text-xs text-muted-foreground">
          You don&apos;t have access to any queues yet.
        </p>
      </div>
    );
  }

  const openQueue = (queue: (typeof queues)[number]) => {
    setQueueId(queue.id);
    setQueueName(queue.name);
    updateParams({ qid: queue.id, qn: queue.name, t: "Pending" });
  };

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <div>
        <h1 className="text-lg font-bold text-accent-foreground">{TABLE_HEADING} Overview</h1>
        <p className="text-sm text-muted-foreground">
          A summary of the queues you have access to. Click a queue to view its work items.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {queues.map((queue) => (
          <QueueSummaryCard
            key={queue.id}
            queueName={queue.name}
            pending={queue.pending}
            inProgress={queue.inProgress}
            completed={queue.completed}
            onOpen={() => openQueue(queue)}
          />
        ))}
      </div>
    </div>
  );
};
