import { cn } from "@avplatform/ui/lib";

import { QueueTransactionStatusTypesEnum } from "../../enums/queue-work-item-status-enum";

interface QueueSummaryCount {
  label: string;
  value: number;
  status: QueueTransactionStatusTypesEnum;
}

interface QueueSummaryCardProps {
  /** Name of the queue. */
  queueName: string;
  /** Count of pending items. */
  pending: number;
  /** Count of items currently in progress. */
  inProgress: number;
  /** Count of completed items. */
  completed: number;
  /** Invoked when the card is clicked. */
  onOpen?: () => void;
}

const statusColors: Record<QueueTransactionStatusTypesEnum, string> = {
  [QueueTransactionStatusTypesEnum.Pending]: "text-orange-700",
  [QueueTransactionStatusTypesEnum.InProgress]: "text-slate-700",
  [QueueTransactionStatusTypesEnum.Completed]: "text-green-700",
  [QueueTransactionStatusTypesEnum.Failed]: "text-red-700",
};

/**
 * Renders a clickable summary card for a queue showing its name and the
 * color-coded count of Pending, In-progress and Completed items.
 */
export const QueueSummaryCard: React.FC<QueueSummaryCardProps> = ({
  queueName,
  pending,
  inProgress,
  completed,
  onOpen,
}) => {
  const counts: QueueSummaryCount[] = [
    {
      label: "Pending",
      value: pending,
      status: QueueTransactionStatusTypesEnum.Pending,
    },
    {
      label: "In-progress",
      value: inProgress,
      status: QueueTransactionStatusTypesEnum.InProgress,
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
        <h3 className="truncate text-sm font-semibold text-accent-foreground group-hover:text-primary">
          {queueName}
        </h3>
        <span className="text-xs text-muted-foreground">
          <span className="text-sm font-semibold text-accent-foreground">
            {pending + inProgress + completed}
          </span>{" "}
          total items
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
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
    </button>
  );
};
