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
  [QueueTransactionStatusTypesEnum.Pending]: "text-warn",
  [QueueTransactionStatusTypesEnum.InProgress]: "text-ink-2",
  [QueueTransactionStatusTypesEnum.Completed]: "text-ok",
  [QueueTransactionStatusTypesEnum.Failed]: "text-bad",
};

/**
 * User-facing label for a queue's processing mode. The stored enum value for the
 * non-FIFO mode is "Manual", but it is branded as "Flexible" in the UI, so map it
 * to the display label instead of showing the raw stored value.
 */
const processingModeLabel: Record<QueueProcessingModeEnum, string> = {
  [QueueProcessingModeEnum.Fifo]: "Fifo",
  [QueueProcessingModeEnum.Manual]: "Flexible",
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
      className="group flex cursor-pointer flex-col gap-4 rounded-lg border border-line bg-surface p-5 text-left transition-colors duration-200 hover:border-line-strong"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-ink group-hover:text-primary-text">
            {queueName}
          </h3>
          {processingMode && (
            <Badge variant="secondary" className="shrink-0">
              {processingModeLabel[processingMode] ?? processingMode}
            </Badge>
          )}
        </div>
      </div>

      {/* Assigned agent(s) tag */}
      <div className="flex min-h-[26px] flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Agents:</span>
        {agentsNames && agentsNames.length > 0 ? (
          agentsNames.map((agent) => (
            <Badge key={agent} variant="outline">
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
            className="flex flex-col gap-1 rounded-md border border-line bg-sunken p-2.5"
          >
            <span
              className={cn(
                "font-mono text-xl font-bold leading-none tabular-nums",
                statusColors[count.status],
              )}
            >
              {count.value}
            </span>
            <span className="text-xs text-muted-foreground">{count.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Avg Age (Active)</span>
          <span className="font-mono text-code font-semibold tabular-nums text-ink">
            {formatDuration(averageAgeSeconds)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Avg Processing (Completed)</span>
          <span className="font-mono text-code font-semibold tabular-nums text-ink">
            {formatDuration(averageProcessingTimeSeconds)}
          </span>
        </div>
      </div>
    </button>
  );
};
