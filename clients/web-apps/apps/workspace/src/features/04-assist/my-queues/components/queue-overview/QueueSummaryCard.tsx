import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";

import { QueueProcessingModeEnum } from "../../enums/queue-processing-mode-enum";
import { QueueTransactionStatusTypesEnum } from "../../enums/queue-work-item-status-enum";
import { formatDuration } from "../../utils/my-queue-utils";

interface QueueSummaryCount {
  label: string;
  value: number;
  status: QueueTransactionStatusTypesEnum;
}

interface QueueSummaryCardProps {
  /** Name of the queue. */
  queueName: string;
  /** How work items in this queue are claimed for processing. */
  processingMode?: QueueProcessingModeEnum;
  /** Names of the agents assigned to this queue. */
  agentsNames?: string[] | null;
  /** Count of pending items. */
  pending: number;
  /** Count of items currently in progress. */
  inProgress: number;
  /** Count of completed items. */
  completed: number;
  /** Average age (seconds) of active (Pending + InProgress) items. */
  averageAgeSeconds?: number;
  /** Average processing time (seconds) of completed items. */
  averageProcessingTimeSeconds?: number;
  /** Invoked when the card is clicked. */
  onOpen?: () => void;
}

const statusColors: Record<QueueTransactionStatusTypesEnum, string> = {
  [QueueTransactionStatusTypesEnum.Pending]: "text-orange-700",
  [QueueTransactionStatusTypesEnum.InProgress]: "text-slate-700",
  [QueueTransactionStatusTypesEnum.Completed]: "text-green-700",
  [QueueTransactionStatusTypesEnum.Failed]: "text-red-700",
};

const processingModeBadge: Record<QueueProcessingModeEnum, string> = {
  [QueueProcessingModeEnum.Fifo]: "bg-sky-100 text-sky-700",
  [QueueProcessingModeEnum.Manual]: "bg-sky-100 text-sky-700",
};

/**
 * Renders a clickable summary card for a queue showing its name, the
 * color-coded count of Pending (Pending + In-progress combined) and Completed
 * items, plus the average age of active items and the average processing time
 * of completed ones.
 */
export const QueueSummaryCard: React.FC<QueueSummaryCardProps> = ({
  queueName,
  processingMode,
  agentsNames,
  pending,
  inProgress,
  completed,
  averageAgeSeconds,
  averageProcessingTimeSeconds,
  onOpen,
}) => {
  const counts: QueueSummaryCount[] = [
    {
      label: "Pending",
      value: pending + inProgress,
      status: QueueTransactionStatusTypesEnum.Pending,
    },
    {
      label: "Completed",
      value: completed,
      status: QueueTransactionStatusTypesEnum.Completed,
    },
  ];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-accent-foreground group-hover:text-primary">
            {queueName}
          </h3>
          {processingMode && (
            <Badge
              className={cn(
                "shrink-0 rounded-full px-2 py-0 text-2xs font-medium",
                processingModeBadge[processingMode],
              )}
            >
              {processingMode}
            </Badge>
          )}
        </div>
      </div>

      {/* Assigned agent(s) tag */}
      <div className="flex min-h-[26px] flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Agents:</span>
        {agentsNames && agentsNames.length > 0 ? (
          agentsNames.map((agent) => (
            <Badge
              key={agent}
              variant="outline"
              className="rounded-full px-2 py-0 text-2xs font-medium text-primary"
            >
              {agent}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {counts.map((count) => (
          <div
            key={count.label}
            className="flex flex-col gap-1 rounded-lg border border-border/70 bg-muted/30 p-2.5"
          >
            <span className={cn("text-xl font-bold leading-none", statusColors[count.status])}>
              {count.value}
            </span>
            <span className="text-xs text-muted-foreground">{count.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Avg Age (Active)</span>
          <span className="text-sm font-semibold text-accent-foreground">
            {formatDuration(averageAgeSeconds)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Avg Processing (Completed)</span>
          <span className="text-sm font-semibold text-accent-foreground">
            {formatDuration(averageProcessingTimeSeconds)}
          </span>
        </div>
      </div>
    </button>
  );
};
