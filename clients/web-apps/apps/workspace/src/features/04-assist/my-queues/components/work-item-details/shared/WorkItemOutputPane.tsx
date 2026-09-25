import { AutosizeTextarea, Input, Switch } from "@avplatform/ui";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

import { JsonEditor } from "@/components/json-editor/JsonEditor";

import { QueueWorkItemDto } from "../../../dtos/queue-work-item-dto";
import { InputSchemaField } from "../../../dtos/queues-table-dto";
import { QueueTransactionStatusTypesEnum } from "../../../enums/queue-work-item-status-enum";
import WorkflowTimeline from "../email-type-work-item/WorkflowTimeline";

/**
 * Shared right-hand pane for work item detail screens (Document & Email).
 * Renders the extracted output (JSON ⇄ Form toggle) plus the workflow timeline.
 */
export const WorkItemOutputPane = ({
  data,
  extractedData,
  setExtractedData,
  inputSchema,
  readOnly = false,
}: {
  data?: QueueWorkItemDto;
  extractedData: string | undefined;
  setExtractedData: Dispatch<SetStateAction<string | undefined>>;
  inputSchema?: InputSchemaField[] | null;
  readOnly?: boolean;
}) => {
  const [viewMode, setViewMode] = useState<"json" | "form">("json");

  const isCompleted = data?.status == QueueTransactionStatusTypesEnum.Completed;
  const isReadOnly = readOnly || isCompleted;

  // Parse the extracted JSON data into a record of field name -> value.
  const parsedData = useMemo<Record<string, unknown>>(() => {
    if (!extractedData) return {};

    try {
      const parsed = JSON.parse(extractedData);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, [extractedData]);

  /**
   * Resolve a value from the parsed data using a dot-notation path.
   * Handles nested JSON (e.g. schema field name "parent.child" -> data.parent.child).
   */
  const getFieldValue = (data: Record<string, unknown>, path: string): unknown =>
    path.split(".").reduce<unknown>((acc, key) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[key];
    }, data);

  /**
   * Set a value in the parsed data using a dot-notation path, creating any
   * intermediate nested objects (or array elements) as needed.
   * Numeric path segments index into arrays (e.g. "lineitems.0.partnumber").
   */
  const setFieldValue = (
    data: Record<string, unknown>,
    path: string,
    value: unknown,
  ): Record<string, unknown> => {
    const parts = path.split(".").filter(Boolean);
    const lastKey = parts.pop()!;
    const node = data as Record<string | number, unknown>;

    let current = node;
    for (const key of parts) {
      const existing = current[key];
      if (existing == null || typeof existing !== "object") {
        current[key] = {};
      }
      current = current[key] as Record<string | number, unknown>;
    }

    current[lastKey] = value;
    return data;
  };

  // Update a single field (possibly nested) in the JSON data and propagate the change.
  const handleFieldChange = (name: string, value: string) => {
    const next = { ...parsedData };
    setFieldValue(next, name, value);
    setExtractedData(JSON.stringify(next, null, 2));
  };

  // Render a scalar (leaf) field as a labeled input.
  const renderScalarField = (
    path: string,
    label: string,
    value: unknown,
    type: string | undefined,
    required: boolean,
    depth: number,
  ) => {
    const displayValue = value == null ? "" : String(value);
    const typeKey = type?.toLowerCase();

    return (
      <div key={path} className="flex w-full items-start gap-2">
        <label
          className={`shrink-0 line-clamp-2 break-words pt-2 text-left text-xs font-medium text-foreground ${
            depth > 0 ? "w-1/3" : "w-1/3"
          }`}
        >
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        {typeKey === "date" ? (
          <Input
            type="date"
            value={displayValue}
            disabled={isReadOnly}
            onChange={(e) => handleFieldChange(path, e.target.value)}
            className="h-8 flex-1 text-xs"
          />
        ) : typeKey === "int" ? (
          <Input
            type="number"
            value={displayValue}
            disabled={isReadOnly}
            onChange={(e) => handleFieldChange(path, e.target.value)}
            className="h-8 flex-1 text-xs"
          />
        ) : (
          <AutosizeTextarea
            value={displayValue}
            disabled={isReadOnly}
            onChange={(e) => handleFieldChange(path, e.target.value)}
            minHeight={32}
            size="sm"
            className="flex-1 text-xs"
          />
        )}
      </div>
    );
  };

  // Recursively render a field value. Scalars render as inputs; objects and
  // arrays render as nested groups so nested JSON is populated in the form.
  const renderNode = (
    path: string,
    label: string,
    value: unknown,
    type: string | undefined,
    required: boolean,
    depth: number,
  ) => {
    // A schema field declared as "Array" may have no value yet (the backend strips
    // array values from the work item payload). Render it as an empty list group
    // rather than falling through to a scalar textarea.
    if (type?.toLowerCase() === "array" && (value == null || !Array.isArray(value))) {
      return (
        <div key={path} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">(0 items)</span>
          </div>
          <p className="text-xs text-muted-foreground">No items</p>
        </div>
      );
    }

    if (value == null || typeof value !== "object") {
      return renderScalarField(path, label, value, type, required, depth);
    }

    if (Array.isArray(value)) {
      return (
        <div key={path} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">
              ({value.length} item{value.length === 1 ? "" : "s"})
            </span>
          </div>
          {value.length === 0 ? (
            <p className="text-xs text-muted-foreground">No items</p>
          ) : (
            value.map((item, i) =>
              renderNode(`${path}.${i}`, `Item ${i + 1}`, item, undefined, false, depth + 1),
            )
          )}
        </div>
      );
    }

    // Plain object: render each key as a nested field.
    return (
      <div key={path} className="space-y-2 rounded-lg border border-input/60 bg-muted/30 p-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        {Object.entries(value as Record<string, unknown>).map(([key, child]) =>
          renderNode(
            `${path}.${key}`,
            key.charAt(0).toUpperCase() + key.slice(1),
            child,
            undefined,
            false,
            depth + 1,
          ),
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-4.5rem-var(--header-height)-2*var(--header-padding))] border rounded-lg bg-background p-3">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between px-1 pb-2">
            <h3 className="text-xs font-semibold">Extracted Output</h3>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>JSON</span>
              <Switch
                size="sm"
                checked={viewMode === "form"}
                onCheckedChange={(checked) => setViewMode(checked ? "form" : "json")}
                disabled={isReadOnly}
              />
              <span>Form</span>
            </label>
          </div>

          {viewMode === "json" ? (
            <JsonEditor onChange={setExtractedData} value={extractedData} disabled={isReadOnly} />
          ) : (
            <div className="rounded-lg border border-input bg-background p-3">
              {(inputSchema ?? []).length > 0 ? (
                <div className="grid grid-cols-1 gap-x-4 gap-y-3">
                  {inputSchema?.map((field) =>
                    renderNode(
                      field.name,
                      field.label || field.name,
                      getFieldValue(parsedData, field.name),
                      field.type,
                      field.isRequired,
                      0,
                    ),
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No input schema defined for this queue. Switch to JSON view to edit the data.
                </p>
              )}
            </div>
          )}
        </div>

        {data?.id && (
          <WorkflowTimeline
            workItemId={data.id}
            isCompleted={data.status == QueueTransactionStatusTypesEnum.Completed}
            readOnly={isReadOnly}
          />
        )}
      </div>
    </ScrollArea>
  );
};
