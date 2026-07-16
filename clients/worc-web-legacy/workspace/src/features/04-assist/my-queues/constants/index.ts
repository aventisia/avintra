import { QueueTransactionStatusTypesEnum } from "../enums/queue-work-item-status-enum";

/**
 * The unique key for the my-queues query to be used in the query client. ["my-queues"]
 */
const DATA_QUERY_KEY = ["my-queues"];

const EVENT_QUERY_KEY = "queue-work-item-events";

/**
 * The heading for the queues table.
 */
const TABLE_HEADING = "Queues";

const TABLE_KEY = "my-queues";

export const statusColor: { [key: string]: string } = {
  [QueueTransactionStatusTypesEnum.Completed]: "bg-green-200 text-green-700",
  [QueueTransactionStatusTypesEnum.InProgress]: "bg-slate-200 text-slate-600",
  [QueueTransactionStatusTypesEnum.Pending]: "bg-orange-200 text-orange-600",
  [QueueTransactionStatusTypesEnum.Failed]: "bg-red-200 text-red-600",
};

export { DATA_QUERY_KEY, TABLE_HEADING, TABLE_KEY, EVENT_QUERY_KEY };
