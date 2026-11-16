import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import {
  type UiBuilderDataConnection,
  type UiBuilderDataFetchMode,
  type UiBuilderDataOperation,
} from "@avplatform/ui/ui-builder-host";
import {
  ArrowLeftIcon,
  CircleNotchIcon,
  DatabaseIcon,
  FlaskIcon,
  LightningIcon,
  MagicWandIcon,
  PlusIcon,
  SparkleIcon,
  StackIcon,
  TrashIcon,
  WarningIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";

import {
  createUiBuilderQueue,
  createUiBuilderQueueWorkItems,
  getUiBuilderQueues,
} from "../apis/ui-builder.apis";
import {
  UI_BUILDER_SAMPLE_DATA_SYSTEM_PROMPT,
  UI_BUILDER_SCHEMA_SYSTEM_PROMPT,
  type UiBuilderConnectionContext,
  buildUiBuilderSampleDataPrompt,
  buildUiBuilderSchemaPrompt,
} from "../constants/ui-builder-data-prompt.constant";
import { type UiBuilderQueueDto, type UiBuilderQueueSchemaField } from "../dtos/ui-builder-dto";
import { useUiBuilderGeneration } from "../hooks/useUiBuilderGeneration.hook";
import { type UiBuilderModelState } from "../hooks/useUiBuilderModels.hook";
import {
  buildUiBuilderLocalSampleItems,
  normalizeUiBuilderSampleItems,
} from "../utils/ui-builder-sample-data.util";
import { UiBuilderQueueSchemaEditor } from "./UiBuilderQueueSchemaEditor";

const OPERATIONS: { value: UiBuilderDataOperation; label: string; hint: string }[] = [
  { value: "list", label: "List", hint: "Show work items" },
  { value: "get", label: "Get", hint: "Open one item" },
  { value: "add", label: "Add", hint: "Create work items" },
  { value: "update", label: "Update", hint: "Change status or data" },
];

const MAX_CONNECTIONS = 10;
const SAMPLE_COUNTS = [5, 10, 20];
const DEFAULT_SAMPLE_COUNT = 10;
const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

type SchemaProposal = {
  queueName?: string;
  key?: string;
  description?: string;
  fields?: Partial<UiBuilderQueueSchemaField>[];
  statuses?: string[];
};

type UiBuilderDataPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
  contexts: UiBuilderConnectionContext[];
  onSave: (connections: UiBuilderDataConnection[]) => Promise<unknown>;
  isSaving: boolean;
  model: UiBuilderModelState | null;
  currentCode: string;
  onWireUp: (prompt: string) => void;
  onDataSeeded?: () => void;
};

type SampleTarget = {
  queueId: string;
  queueName: string;
  description: string;
  envType: string;
  fields: UiBuilderQueueSchemaField[];
};

const toConnectionKey = (name: string, taken: string[]) => {
  const words = name
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let base = words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join("")
    .slice(0, 32);
  if (!/^[A-Za-z]/.test(base)) base = `queue${base}`;
  let key = base || "queue";
  for (
    let suffix = 2;
    taken.some((existing) => existing.toLowerCase() === key.toLowerCase());
    suffix += 1
  ) {
    key = `${base}${suffix}`;
  }
  return key;
};

const normalizeProposalFields = (fields: SchemaProposal["fields"]): UiBuilderQueueSchemaField[] =>
  (fields ?? [])
    .filter((field) => typeof field?.name === "string" && field.name.trim())
    .map((field) => ({
      name: String(field.name).replace(/[^A-Za-z0-9_]/g, ""),
      label: field.label ?? null,
      description: field.description ?? "",
      type: (["string", "int", "Date", "Array"] as const).includes(
        field.type as UiBuilderQueueSchemaField["type"],
      )
        ? (field.type as UiBuilderQueueSchemaField["type"])
        : "string",
      isRequired: Boolean(field.isRequired || field.isUsedForUniqueIdentifier),
      isUsedForUniqueIdentifier: Boolean(field.isUsedForUniqueIdentifier),
    }));

const Label = ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500"
  >
    {children}
  </label>
);

const inputClass =
  "h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15";

const EnvToggle = ({ value, onChange }: { value: string; onChange: (env: string) => void }) => (
  <div className="flex rounded-lg bg-slate-100 p-0.5">
    {[
      { value: "dev", label: "Development" },
      { value: "prod", label: "Production" },
    ].map((env) => (
      <button
        key={env.value}
        type="button"
        aria-pressed={value === env.value}
        onClick={() => onChange(env.value)}
        className={cn(
          "h-7 flex-1 rounded-md px-3 text-2xs font-medium transition-all",
          value === env.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
        )}
      >
        {env.label}
      </button>
    ))}
  </div>
);

const BindingSettings = ({
  keyValue,
  onKeyChange,
  operations,
  onOperationsChange,
  fetchMode,
  onFetchModeChange,
}: {
  keyValue: string;
  onKeyChange: (key: string) => void;
  operations: UiBuilderDataOperation[];
  onOperationsChange: (operations: UiBuilderDataOperation[]) => void;
  fetchMode: UiBuilderDataFetchMode;
  onFetchModeChange: (mode: UiBuilderDataFetchMode) => void;
}) => (
  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
    <div>
      <Label htmlFor="ui-builder-connection-key">Name in code</Label>
      <input
        id="ui-builder-connection-key"
        value={keyValue}
        onChange={(event) => onKeyChange(event.target.value.replace(/[^A-Za-z0-9_]/g, ""))}
        className={cn(inputClass, "font-mono")}
      />
      <p className="mt-1 font-mono text-[10px] text-slate-400">
        Avintra.useQueue(&quot;{keyValue || "…"}&quot;)
      </p>
    </div>
    <div>
      <Label>The interface may</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {OPERATIONS.map((operation) => {
          const checked = operations.includes(operation.value);
          return (
            <label
              key={operation.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 text-2xs transition-colors",
                checked ? "border-indigo-300 ring-1 ring-indigo-200" : "border-slate-200",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  onOperationsChange(
                    checked
                      ? operations.filter((value) => value !== operation.value)
                      : [...operations, operation.value],
                  )
                }
                className="h-3.5 w-3.5 accent-indigo-600"
              />
              <span>
                <span className="block font-semibold text-slate-800">{operation.label}</span>
                <span className="text-slate-500">{operation.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
    <div>
      <Label>Load data</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { value: "auto" as const, label: "Automatically", hint: "When the page opens" },
          { value: "manual" as const, label: "On request", hint: "When the user clicks" },
        ].map((mode) => (
          <button
            key={mode.value}
            type="button"
            aria-pressed={fetchMode === mode.value}
            onClick={() => onFetchModeChange(mode.value)}
            className={cn(
              "rounded-lg border bg-white px-2.5 py-1.5 text-left text-2xs transition-colors",
              fetchMode === mode.value
                ? "border-indigo-300 ring-1 ring-indigo-200"
                : "border-slate-200",
            )}
          >
            <span className="block font-semibold text-slate-800">{mode.label}</span>
            <span className="text-slate-500">{mode.hint}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const SampleDataOption = ({
  checked,
  onCheckedChange,
  count,
  onCountChange,
  envType,
  processedBy,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  count: number;
  onCountChange: (count: number) => void;
  envType: string;
  processedBy?: "Agent" | "User";
}) => (
  <div
    className={cn(
      "rounded-xl border p-3 transition-colors",
      checked ? "border-violet-200 bg-violet-50/60" : "border-slate-200 bg-white",
    )}
  >
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 accent-violet-600"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <FlaskIcon className="h-3.5 w-3.5 text-violet-600" />
          Generate sample data
        </span>
        <span className="mt-0.5 block text-2xs leading-relaxed text-slate-500">
          Adds realistic work items that match the schema, so the interface has data to show right
          away.
        </span>
      </span>
      {checked && (
        <select
          aria-label="Number of sample work items"
          value={count}
          onChange={(event) => onCountChange(Number(event.target.value))}
          onClick={(event) => event.stopPropagation()}
          className="h-7 rounded-md border border-violet-200 bg-white px-1.5 text-2xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          {SAMPLE_COUNTS.map((value) => (
            <option key={value} value={value}>
              {value} items
            </option>
          ))}
        </select>
      )}
    </label>
    {checked && (
      <p
        className={cn(
          "mt-2 flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-[10px] leading-relaxed",
          envType === "prod" ? "bg-amber-100 text-amber-800" : "bg-white/70 text-slate-500",
        )}
      >
        <WarningIcon className="mt-0.5 h-3 w-3 shrink-0" />
        {envType === "prod"
          ? "This is a Production queue. Sample items are real work items, and agents or people assigned to the queue may process them."
          : processedBy === "User"
            ? "Sample items are real work items in this queue; delete them from Configure › Queues when you no longer need them."
            : "Sample items are real work items; agents assigned to this queue may pick them up."}
      </p>
    )}
  </div>
);

/**
 * Side panel that binds queues to the interface: pick an existing queue, or let the model
 * propose a work item schema from the current interface and create the queue in place.
 */
export const UiBuilderDataPanel = ({
  open,
  onOpenChange,
  projectId,
  projectName,
  isOwner,
  contexts,
  onSave,
  isSaving,
  model,
  currentCode,
  onWireUp,
  onDataSeeded,
}: UiBuilderDataPanelProps) => {
  const { generateJson } = useUiBuilderGeneration();
  const connections = contexts.map((context) => context.connection);
  const takenKeys = connections.map((connection) => connection.key);

  const [view, setView] = useState<"list" | "existing" | "design">("list");
  const [envType, setEnvType] = useState("dev");
  const [queueId, setQueueId] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [operations, setOperations] = useState<UiBuilderDataOperation[]>(["list", "get"]);
  const [fetchMode, setFetchMode] = useState<UiBuilderDataFetchMode>("auto");
  const [goal, setGoal] = useState("");
  const [queueName, setQueueName] = useState("");
  const [queueDescription, setQueueDescription] = useState("");
  const [processedBy, setProcessedBy] = useState<"Agent" | "User">("Agent");
  const [fields, setFields] = useState<UiBuilderQueueSchemaField[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [justAdded, setJustAdded] = useState<UiBuilderDataConnection | null>(null);
  const [generateSamples, setGenerateSamples] = useState(true);
  const [sampleCount, setSampleCount] = useState(DEFAULT_SAMPLE_COUNT);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (open) return;
    setView("list");
    setJustAdded(null);
  }, [open]);

  const queuesQuery = useQuery({
    queryKey: ["ui-builder-queues", envType],
    queryFn: () => getUiBuilderQueues(envType),
    enabled: open && view === "existing",
  });
  const queues = queuesQuery.data?.data ?? [];
  const selectedQueue = queues.find((queue) => queue.id === queueId);

  const resetForm = () => {
    setQueueId("");
    setKeyValue("");
    setOperations(["list", "get"]);
    setFetchMode("auto");
    setGoal("");
    setQueueName("");
    setQueueDescription("");
    setFields([]);
    setStatuses([]);
    setGenerateSamples(true);
    setSampleCount(DEFAULT_SAMPLE_COUNT);
  };

  const proposeMutation = useMutation({
    mutationFn: () => {
      if (!model) throw new Error("Choose a model first.");
      return generateJson<SchemaProposal>({
        projectId,
        projectName,
        model,
        systemPrompt: UI_BUILDER_SCHEMA_SYSTEM_PROMPT,
        userContent: buildUiBuilderSchemaPrompt(goal, currentCode),
      });
    },
    onSuccess: (proposal) => {
      const proposedFields = normalizeProposalFields(proposal.fields);
      if (proposedFields.length === 0) {
        toast.error("The model did not return any fields. Try describing the data in more detail.");
        return;
      }
      setFields(proposedFields);
      setQueueName((proposal.queueName ?? "").slice(0, 60) || `${projectName} items`);
      setQueueDescription((proposal.description ?? "").slice(0, 500));
      setStatuses(
        (proposal.statuses ?? []).filter((status) => typeof status === "string").slice(0, 4),
      );
      setKeyValue(toConnectionKey(proposal.key || proposal.queueName || "items", takenKeys));
    },
    onError: (error) =>
      toast.error(`A schema could not be proposed. ${error instanceof Error ? error.message : ""}`),
  });

  const generateSampleItems = async (target: SampleTarget) => {
    if (model) {
      try {
        const response = await generateJson<{ items?: unknown }>({
          projectId,
          projectName,
          model,
          systemPrompt: UI_BUILDER_SAMPLE_DATA_SYSTEM_PROMPT,
          userContent: buildUiBuilderSampleDataPrompt(
            target.queueName,
            target.description,
            target.fields,
            sampleCount,
          ),
        });
        const items = Array.isArray(response) ? response : response?.items;
        if (Array.isArray(items) && items.length > 0) {
          return normalizeUiBuilderSampleItems(target.fields, items, sampleCount);
        }
      } catch {
        return buildUiBuilderLocalSampleItems(target.fields, sampleCount);
      }
    }
    return buildUiBuilderLocalSampleItems(target.fields, sampleCount);
  };

  const seedSampleData = async (target: SampleTarget) => {
    if (target.fields.length === 0) {
      toast.error("Sample data was skipped: the queue has no work item schema.");
      return;
    }
    setIsSeeding(true);
    try {
      const items = await generateSampleItems(target);
      const result = await createUiBuilderQueueWorkItems(target.queueId, target.envType, items);
      if (result.statusCode && result.statusCode >= 300) {
        toast.error(`Some sample items were rejected by the queue. ${result.message ?? ""}`);
      } else {
        toast.success(`Added ${items.length} sample work items to "${target.queueName}".`);
      }
      onDataSeeded?.();
    } catch (error) {
      toast.error(
        `The connection was saved, but sample data could not be added. ${
          error instanceof Error ? error.message : ""
        }`,
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const bindConnection = async (
    connection: UiBuilderDataConnection,
    sampleTarget: SampleTarget,
  ) => {
    await onSave([...connections, connection]);
    if (generateSamples) await seedSampleData(sampleTarget);
    setJustAdded(connection);
    setView("list");
    resetForm();
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const uniqueFields = fields.filter((field) => field.isUsedForUniqueIdentifier);
      const queue: UiBuilderQueueDto = {
        name: queueName.trim(),
        description: queueDescription.trim() || null,
        type: processedBy,
        processingMode: processedBy === "Agent" ? "Fifo" : "Manual",
        isUniqueReferencesEnforced: uniqueFields.length > 0,
        isStoredEncrypted: false,
        shouldRetryFailedItems: false,
        shouldRetryAbandonedItems: false,
        maximumRetryAttempts: 0,
        inputSchema: fields,
        statuses: statuses.map((status) => ({ name: status, label: status, color: null })),
        isTenantWideAccess: false,
      };
      const created = await createUiBuilderQueue(queue, envType);
      const createdQueue = created.data;
      if (!createdQueue?.id) throw new Error(created.message || "The queue was not created.");
      await bindConnection(
        {
          key: keyValue,
          type: "queue",
          queueId: createdQueue.id,
          queueName: createdQueue.name,
          envType,
          operations,
          fetchMode,
          description: queueDescription.trim() || null,
        },
        {
          queueId: createdQueue.id,
          queueName: createdQueue.name,
          description: queueDescription.trim(),
          envType,
          fields,
        },
      );
    },
    onError: (error) =>
      toast.error(`The queue could not be created. ${error instanceof Error ? error.message : ""}`),
  });

  const keyError = !keyValue
    ? "Enter a name"
    : !KEY_PATTERN.test(keyValue)
      ? "Start with a letter; letters, digits and _ only"
      : takenKeys.some((key) => key.toLowerCase() === keyValue.toLowerCase())
        ? "Already used"
        : null;
  const canBindExisting = Boolean(selectedQueue) && !keyError && operations.length > 0;
  const canCreate =
    queueName.trim().length > 0 &&
    fields.length > 0 &&
    fields.every((field) => field.name) &&
    !keyError &&
    operations.length > 0;

  const handleRemove = async (key: string) => {
    try {
      await onSave(connections.filter((connection) => connection.key !== key));
      toast.success("Connection removed.");
    } catch (error) {
      toast.error(`The connection could not be removed. ${String(error)}`);
    }
  };

  const handleBindExisting = async () => {
    if (!selectedQueue?.id) return;
    try {
      await bindConnection(
        {
          key: keyValue,
          type: "queue",
          queueId: selectedQueue.id,
          queueName: selectedQueue.name,
          envType,
          operations,
          fetchMode,
          description: selectedQueue.description ?? null,
        },
        {
          queueId: selectedQueue.id,
          queueName: selectedQueue.name,
          description: selectedQueue.description ?? "",
          envType,
          fields: selectedQueue.inputSchema ?? [],
        },
      );
    } catch (error) {
      toast.error(`The connection could not be saved. ${String(error)}`);
    }
  };

  const wireUpPrompt = (connection: UiBuilderDataConnection) => {
    const asks = [
      connection.operations.includes("list") &&
        "show its work items with real loading, empty, and error states",
      connection.operations.includes("get") && "open an item to see its details",
      connection.operations.includes("add") && "let users create work items with a validated form",
      connection.operations.includes("update") && "let users update an item's status",
    ].filter(Boolean);
    return `Connect the interface to the "${connection.key}" data connection (queue "${connection.queueName}"): ${asks.join("; ")}. Replace any placeholder data for this section with the live queue data.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        aria-describedby="ui-builder-data-description"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            {view !== "list" ? (
              <button
                type="button"
                aria-label="Back to connections"
                onClick={() => setView("list")}
                className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm">
                <DatabaseIcon className="h-4 w-4" />
              </div>
            )}
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900">
                {view === "list"
                  ? "Data connections"
                  : view === "existing"
                    ? "Connect an existing queue"
                    : "Design a queue with AI"}
              </DialogTitle>
              <DialogDescription
                id="ui-builder-data-description"
                className="text-2xs text-slate-500"
              >
                {view === "design"
                  ? "Describe the data; the agent proposes a work item schema you can edit, then creates the queue."
                  : "Bind Avintra queues so the interface reads and writes live work items through the platform."}
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {view === "list" && (
            <div className="space-y-4">
              {justAdded && (
                <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-3.5">
                  <p className="text-xs font-semibold text-indigo-900">
                    &quot;{justAdded.key}&quot; is connected
                  </p>
                  <p className="mt-0.5 text-2xs text-indigo-700">
                    Ask the agent to wire the interface to this queue.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onWireUp(wireUpPrompt(justAdded));
                      onOpenChange(false);
                    }}
                    className="mt-2.5 inline-flex h-7 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-2xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <MagicWandIcon className="h-3.5 w-3.5" />
                    Wire it up
                  </button>
                </div>
              )}

              {contexts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 text-center">
                  <StackIcon className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">No data connected yet</p>
                  <p className="mx-auto mt-1 max-w-xs text-2xs leading-relaxed text-slate-500">
                    Connect a queue so agents and people share the same work items: agents process
                    what the interface captures, and the interface shows what agents produce.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {contexts.map(({ connection, fields: connectionFields }) => (
                    <li
                      key={connection.key}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-slate-900">
                            {connection.key}
                          </p>
                          <p className="truncate text-2xs text-slate-500">
                            Queue · {connection.queueName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                              connection.envType === "prod"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-sky-50 text-sky-700",
                            )}
                          >
                            {connection.envType}
                          </span>
                          {isOwner && (
                            <button
                              type="button"
                              aria-label={`Remove ${connection.key}`}
                              disabled={isSaving}
                              onClick={() => void handleRemove(connection.key)}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {connection.operations.map((operation) => (
                          <span
                            key={operation}
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {operation}
                          </span>
                        ))}
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          <LightningIcon className="h-2.5 w-2.5" />
                          {connection.fetchMode === "auto" ? "auto-load" : "on request"}
                        </span>
                        {connectionFields.length > 0 && (
                          <span className="truncate text-[10px] text-slate-400">
                            · {connectionFields.map((field) => field.name).join(", ")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {isOwner ? (
                connections.length < MAX_CONNECTIONS && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setView("design");
                      }}
                      className="group rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <SparkleIcon className="h-4 w-4 text-indigo-600" />
                      <p className="mt-1.5 text-xs font-semibold text-slate-900">
                        Design a new queue
                      </p>
                      <p className="text-2xs text-slate-500">AI proposes the work item schema</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setView("existing");
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <PlusIcon className="h-4 w-4 text-slate-600" />
                      <p className="mt-1.5 text-xs font-semibold text-slate-900">
                        Use an existing queue
                      </p>
                      <p className="text-2xs text-slate-500">Bind a queue you already run</p>
                    </button>
                  </div>
                )
              ) : (
                <p className="text-2xs text-slate-500">
                  Only the project owner can change data connections.
                </p>
              )}
            </div>
          )}

          {view === "existing" && (
            <div className="space-y-4">
              <div>
                <Label>Environment</Label>
                <EnvToggle
                  value={envType}
                  onChange={(env) => {
                    setEnvType(env);
                    setQueueId("");
                  }}
                />
              </div>
              <div>
                <Label htmlFor="ui-builder-queue">Queue</Label>
                <select
                  id="ui-builder-queue"
                  value={queueId}
                  onChange={(event) => {
                    setQueueId(event.target.value);
                    const queue = queues.find((candidate) => candidate.id === event.target.value);
                    if (queue) setKeyValue(toConnectionKey(queue.name, takenKeys));
                  }}
                  className={inputClass}
                  disabled={queuesQuery.isLoading}
                >
                  <option value="">
                    {queuesQuery.isLoading
                      ? "Loading queues…"
                      : queues.length === 0
                        ? "No queues in this environment"
                        : "Select a queue"}
                  </option>
                  {queues.map((queue) => (
                    <option key={queue.id} value={queue.id}>
                      {queue.name}
                      {typeof queue.total === "number" ? ` · ${queue.total} items` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {selectedQueue && (
                <>
                  <div>
                    <Label>Work item schema</Label>
                    <UiBuilderQueueSchemaEditor
                      fields={selectedQueue.inputSchema ?? []}
                      onChange={() => undefined}
                      readOnly
                    />
                  </div>
                  <SampleDataOption
                    checked={generateSamples}
                    onCheckedChange={setGenerateSamples}
                    count={sampleCount}
                    onCountChange={setSampleCount}
                    envType={envType}
                  />
                  <BindingSettings
                    keyValue={keyValue}
                    onKeyChange={setKeyValue}
                    operations={operations}
                    onOperationsChange={setOperations}
                    fetchMode={fetchMode}
                    onFetchModeChange={setFetchMode}
                  />
                </>
              )}
            </div>
          )}

          {view === "design" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ui-builder-queue-goal">What should the queue hold?</Label>
                <textarea
                  id="ui-builder-queue-goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  rows={3}
                  placeholder="e.g. Invoices captured by this form, which an AI agent validates and routes for approval."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                />
                <button
                  type="button"
                  disabled={!model || proposeMutation.isPending}
                  onClick={() => proposeMutation.mutate()}
                  className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-2xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {proposeMutation.isPending ? (
                    <CircleNotchIcon className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <SparkleIcon className="h-3.5 w-3.5" />
                  )}
                  {fields.length > 0 ? "Propose again" : "Propose schema from the interface"}
                </button>
              </div>

              {fields.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="ui-builder-new-queue-name">Queue name</Label>
                      <input
                        id="ui-builder-new-queue-name"
                        value={queueName}
                        maxLength={256}
                        onChange={(event) => setQueueName(event.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <Label>Processed by</Label>
                      <div className="flex rounded-lg bg-slate-100 p-0.5">
                        {(["Agent", "User"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={processedBy === type}
                            onClick={() => setProcessedBy(type)}
                            className={cn(
                              "h-7 flex-1 rounded-md text-2xs font-medium transition-all",
                              processedBy === type
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500",
                            )}
                          >
                            {type === "Agent" ? "AI agents" : "People"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Environment</Label>
                    <EnvToggle value={envType} onChange={setEnvType} />
                  </div>
                  <div>
                    <Label>Work item schema</Label>
                    <UiBuilderQueueSchemaEditor fields={fields} onChange={setFields} />
                    {statuses.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Outcomes
                        </span>
                        {statuses.map((status) => (
                          <span
                            key={status}
                            className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700"
                          >
                            {status}
                            <button
                              type="button"
                              aria-label={`Remove ${status}`}
                              onClick={() =>
                                setStatuses(statuses.filter((value) => value !== status))
                              }
                            >
                              <XIcon className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <SampleDataOption
                    checked={generateSamples}
                    onCheckedChange={setGenerateSamples}
                    count={sampleCount}
                    onCountChange={setSampleCount}
                    envType={envType}
                    processedBy={processedBy}
                  />
                  <BindingSettings
                    keyValue={keyValue}
                    onKeyChange={setKeyValue}
                    operations={operations}
                    onOperationsChange={setOperations}
                    fetchMode={fetchMode}
                    onFetchModeChange={setFetchMode}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {view !== "list" && (
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
            <p className="text-2xs text-rose-500">
              {(view === "existing" ? selectedQueue : fields.length > 0) ? (keyError ?? "") : ""}
            </p>
            {view === "existing" ? (
              <button
                type="button"
                disabled={!canBindExisting || isSaving || isSeeding}
                onClick={() => void handleBindExisting()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-2xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-40"
              >
                {(isSaving || isSeeding) && (
                  <CircleNotchIcon className="h-3.5 w-3.5 animate-spin" />
                )}
                {isSeeding ? "Generating sample data…" : "Connect queue"}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canCreate || createMutation.isPending || isSeeding}
                onClick={() => createMutation.mutate()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-2xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-40"
              >
                {createMutation.isPending && (
                  <CircleNotchIcon className="h-3.5 w-3.5 animate-spin" />
                )}
                {isSeeding ? "Generating sample data…" : "Create queue & connect"}
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
