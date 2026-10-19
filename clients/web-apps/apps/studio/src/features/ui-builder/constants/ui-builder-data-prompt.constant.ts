import { type UiBuilderDataConnection } from "@avplatform/ui/ui-builder-host";

import { type UiBuilderQueueSchemaField } from "../dtos/ui-builder-dto";
import { type UiBuilderContentFormat } from "./ui-builder-framework.constant";

/** A bound connection together with the schema of the queue it reads. */
export type UiBuilderConnectionContext = {
  connection: UiBuilderDataConnection;
  fields: UiBuilderQueueSchemaField[];
  statuses: string[];
};

const CORE_QUEUE_STATUSES = ["Pending", "InProgress", "Completed", "Failed"];

const describeField = (field: UiBuilderQueueSchemaField) => {
  const traits = [
    field.type,
    field.isRequired ? "required" : null,
    field.isUsedForUniqueIdentifier ? "unique" : null,
  ].filter(Boolean);
  const label = field.label && field.label !== field.name ? ` "${field.label}"` : "";
  const description = field.description ? ` — ${field.description}` : "";
  return `    - ${field.name}${label} (${traits.join(", ")})${description}`;
};

const describeConnection = ({ connection, fields, statuses }: UiBuilderConnectionContext) =>
  [
    `- "${connection.key}" → queue "${connection.queueName}". Allowed operations: ${connection.operations.join(", ")}. Fetch: ${
      connection.fetchMode === "auto"
        ? "automatically on load"
        : "only when the user asks (a button)"
    }.${connection.description ? ` Purpose: ${connection.description}` : ""}`,
    "  Work item fields (item.data):",
    ...(fields.length > 0
      ? fields.map(describeField)
      : ["    - (no schema; treat data as free-form)"]),
    `  Statuses: ${[...CORE_QUEUE_STATUSES, ...statuses].join(", ")}.`,
  ].join("\n");

const QUERY_SPEC = [
  "Server-side queries (use these for every count, sum, average, KPI, chart, breakdown, trend, and date-range view):",
  "  spec = {",
  "    filters: [ { field, op, value } ],          // shared by every named query, e.g. the selected date range",
  "    queries: {                                  // up to 10 named result sets computed in one request",
  '      kpis:  { title: "Headline KPIs", metrics: [ { name: "total", label: "Emails received", fn: "count" },',
  '                          { name: "avgTat", label: "Avg turnaround", fn: "avg", field: "turnaroundTimeHours" },',
  '                          { name: "pending", label: "Unanswered", fn: "count", where: [ { field: "turnaroundTimeHours", op: "isNull" } ] } ],',
  '               derived: [ { label: "Response rate", formula: "(Emails received − Unanswered) ÷ Emails received × 100" } ] },',
  '      byKind:{ groupBy: [ { field: "mailbox" } ], metrics: [ { name: "total", fn: "count" } ], sort: [ { by: "total", dir: "desc" } ], limit: 20 },',
  '      trend: { groupBy: [ { field: "receivedDate", bucket: "day", as: "day" } ], metrics: [ { name: "total", fn: "count" } ] },',
  '      rows:  { filters: [ { field: "turnaroundTimeHours", op: "isNull" } ], sort: [ { by: "waitingTimeHours", dir: "desc" } ], limit: 50 }',
  "    }",
  "  }",
  "  Fields: the schema field names above, or the system fields $status, $createdOn, $lastModifiedOn, $assignee.",
  "  ops: eq, neq, in, nin, contains, startsWith, gt, gte, lt, lte, between ([from, to], inclusive, date-only 'to' includes that whole day), isNull, notNull.",
  "  fn: count (no field = count items; with field = count non-empty), countDistinct, sum, avg, min, max. A metric's where limits it to matching items (conditional counts and rates).",
  "  bucket (date fields only): day, week, month, year. A query with metrics or groupBy returns aggregate rows; a query without them returns matching items { id, status, createdOn, data }.",
  "  Result: { queries: { <name>: { rows: [...], totalRows, description, formulas: { <metric>: text }, title, labels: { <metric>: label }, derived: [ { label, formula } ] } }, scanned, truncated, filterDescription }. Every named query of the spec is always present; with no matching items an aggregate still returns one row of zero counts and null averages, and a row query returns no rows. Compute rates and percentages from the returned counts.",
  '  Explainability: give every query a title and every metric the exact label shown on the page; declare every value the page computes itself (rates, percentages, differences, durations) in that query\'s derived list with its formula in words. The host shows these in a "How numbers are calculated" panel.',
  '  Text comparisons ignore case. Values that look boolean are stored as text (compare with eq "true").',
].join("\n");

const FRAMEWORK_USAGE = [
  "Read and write these connections only through the global Avintra runtime (never fetch):",
  '  const stats = Avintra.useQueueQuery("orders", spec); // re-runs whenever spec changes, e.g. a new date range',
  '  // stats.first("kpis") → { total, avgTat, pending }; stats.rows("trend") → [{ day, total }]; stats.loading, stats.error, stats.truncated, stats.refresh()',
  '  // stats.formula("kpis", "avgTat") → plain-language formula text; stats.description("trend"); stats.filterDescription → the filters in force',
  "  // Pass { auto: false } as the third argument for on-request connections and call stats.refresh() from a button.",
  '  const orders = Avintra.useQueue("orders", { params: { status: "Pending", top: 50 } }); // simple newest-first list',
  "  // orders.items → [{ id, status, data: { ...fields }, createdOn }]; orders.loading, orders.error, orders.refresh()",
  '  // await orders.add({ ...fields }); await orders.update(item.id, { status: "Completed", data: { ...changes } }); await orders.get(id)',
  "",
  QUERY_SPEC,
].join("\n");

const HTML_USAGE = [
  "Read and write these connections only through the global Avintra runtime (never fetch):",
  '  const result = await Avintra.data.queue("orders").query(spec); // see the spec below; result.queries.kpis.formulas.avgTat is the plain-language formula',
  '  const page = await Avintra.data.queue("orders").list({ status: "Pending", top: 50 }); // simple newest-first list: { items, total }',
  "  await queue.get(id); await queue.add({ ...fields }); await queue.update(id, { status, data });",
  "  For connections fetched automatically, query on DOMContentLoaded and again whenever a filter control changes; otherwise load from a button.",
  "",
  QUERY_SPEC,
].join("\n");

/** Builds the data-connection block appended to a generation's system prompt. */
export const buildUiBuilderDataPrompt = (
  contexts: UiBuilderConnectionContext[],
  format: UiBuilderContentFormat,
) => {
  if (contexts.length === 0) return "";

  return [
    "",
    "Live data connections (Avintra queues) are bound to this interface:",
    ...contexts.map(describeConnection),
    "",
    format === "framework" ? FRAMEWORK_USAGE : HTML_USAGE,
    "Data rules:",
    "- Aggregate on the server with query(): never download items to count, sum, average, or group them in the browser, because a queue can hold far more items than a list returns.",
    "- Put user filters (date range pickers, dropdowns, segment toggles) into spec.filters or a query's filters so every widget updates together. For date ranges, filter the schema's own date field (for example when the record happened); use $createdOn only when the schema has no date field.",
    "- Fetch all widgets of a view with one query() call containing several named queries.",
    '- Make every computed figure explainable on the page: next to each KPI, chart title, and computed column header, show a small info button (aria-label "How is this calculated?") that reveals the formula on hover and on click or focus. Use the metric\'s formula text from the result, or for page-computed values the same words declared in derived. Keep it subtle and keep the existing look.',
    "- Render real states for every connection: loading skeleton, empty state, and an error message with a retry control. If a result is truncated, say that totals cover the most recent items.",
    "- In every catch block for data calls, show the error message to the user with a retry control and call Avintra.reportError(error.message, error.stack) so the platform can detect and fix it. Never swallow errors silently. Guard optional values (for example an average can be null).",
    "- Never invent records for a connected queue; show what the queue returns. Field names must match the schema exactly.",
    "- Only call operations the connection allows (query needs list). Validate required fields before add, and show success or failure feedback.",
    "- Format Date fields for people and keep ids secondary.",
  ].join("\n");
};

/** System prompt for proposing a queue work item schema from an interface. */
export const UI_BUILDER_SCHEMA_SYSTEM_PROMPT = [
  "You design the work item schema for an Avintra queue that will feed a user interface and the AI agents that process it.",
  'Respond with JSON only, shaped as {"queueName": string, "key": string, "description": string, "fields": [{"name": string, "label": string, "description": string, "type": "string" | "int" | "Date" | "Array", "isRequired": boolean, "isUsedForUniqueIdentifier": boolean}], "statuses": [string]}.',
  "Rules:",
  "- queueName: short, human readable, max 60 characters. key: camelCase identifier for code, max 32 characters.",
  "- fields: 3 to 15 fields the interface displays or captures. name is camelCase. Use int for numbers and money in minor units, Date for dates, Array for lists, string otherwise.",
  "- Mark at most one or two fields as isUsedForUniqueIdentifier (a natural business reference), and mark them required.",
  "- statuses: 0 to 4 custom terminal outcomes beyond Pending, InProgress, Completed, Failed (for example Approved, Rejected). Do not repeat the core statuses.",
].join("\n");

/** Builds the user message for a schema proposal. */
export const buildUiBuilderSchemaPrompt = (goal: string, currentCode: string) => {
  const code =
    currentCode.length > 12000 ? `${currentCode.slice(0, 12000)}\n…(truncated)` : currentCode;
  return [
    `What the queue is for: ${goal.trim() || "the data shown in this interface"}`,
    "",
    code.trim() ? `Current interface code:\n${code}` : "There is no interface yet.",
  ].join("\n");
};

/** System prompt for generating realistic sample work items for a queue. */
export const UI_BUILDER_SAMPLE_DATA_SYSTEM_PROMPT = [
  "You generate realistic sample work items for an Avintra queue so a user interface can be previewed with believable data.",
  'Respond with JSON only, shaped as {"items": [ { "<fieldName>": value, ... } ]}.',
  "Rules:",
  "- Use exactly the schema's field names; include every required field.",
  "- Types: string → text, int → whole number, Date → ISO date (YYYY-MM-DD), Array → array of short strings.",
  "- Values must be varied, plausible, and consistent with each other and with the queue's purpose; no lorem ipsum, no real people's personal data.",
  "- Fields marked unique must be unique across items (for example REF-1001, REF-1002).",
].join("\n");

/** Builds the user message for a sample data request. */
export const buildUiBuilderSampleDataPrompt = (
  queueName: string,
  description: string,
  fields: UiBuilderQueueSchemaField[],
  count: number,
) =>
  [
    `Queue: ${queueName}${description ? ` — ${description}` : ""}`,
    `Generate ${count} work items.`,
    "Schema:",
    ...fields.map(describeField),
  ].join("\n");
