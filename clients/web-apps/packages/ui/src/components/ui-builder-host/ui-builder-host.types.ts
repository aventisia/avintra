/** Operations a generated interface may run against a bound data connection. */
export type UiBuilderDataOperation = "list" | "get" | "add" | "update";

/** When a generated interface loads a connection's data. */
export type UiBuilderDataFetchMode = "auto" | "manual";

/** A data source bound to a UI builder project and exposed to its generated interface. */
export type UiBuilderDataConnection = {
  /** Identifier the generated code uses, e.g. `Avintra.useQueue("orders")`. */
  key: string;
  /** Connection type; only queues are supported today. */
  type: "queue";
  queueId: string;
  queueName: string;
  /** Environment the queue lives in ("dev" or "prod"). */
  envType: string;
  operations: UiBuilderDataOperation[];
  fetchMode: UiBuilderDataFetchMode;
  description?: string | null;
};

/** A data request posted by a generated interface through the runtime bridge. */
/**
 * Operations a generated interface can request at runtime. `query` (server-side filters, grouping,
 * and metrics) is a read and is allowed whenever the connection allows `list`.
 */
export type UiBuilderDataRequestOperation = UiBuilderDataOperation | "query";

export type UiBuilderDataRequest = {
  connection: UiBuilderDataConnection;
  operation: UiBuilderDataRequestOperation;
  params: Record<string, unknown>;
};

/** A successful query observed by the host, used to explain how figures are calculated. */
export type UiBuilderQueryResultEvent = {
  connection: UiBuilderDataConnection;
  spec: Record<string, unknown>;
  result: unknown;
};

/** A queue work item as seen by a generated interface. */
export type UiBuilderRuntimeWorkItem = {
  id: string;
  status: string;
  data: Record<string, unknown>;
  description?: string | null;
  assignee?: string | null;
  createdBy?: string | null;
  createdOn?: string | null;
  lastModifiedOn?: string | null;
};

/** A page of queue work items returned to a generated interface. */
export type UiBuilderRuntimeWorkItemPage = {
  items: UiBuilderRuntimeWorkItem[];
  total: number;
};

/** A runtime error reported by a generated interface. */
export type UiBuilderRuntimeError = {
  message: string;
  stack?: string;
};
