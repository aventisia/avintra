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

  // Update a single field in the JSON data and propagate the change.
  const handleFieldChange = (name: string, value: string) => {
    const next = { ...parsedData, [name]: value };
    setExtractedData(JSON.stringify(next, null, 2));
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
            <JsonEditor
              onChange={setExtractedData}
              value={extractedData}
              disabled={isReadOnly}
            />
          ) : (
            <div className="rounded-lg border border-input bg-background p-3">
              {(inputSchema ?? []).length > 0 ? (
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  {inputSchema?.map((field) => {
                    const value = parsedData[field.name];
                    const displayValue =
                      value == null
                        ? ""
                        : typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value);

                    return (
                      <div key={field.name} className="flex items-start gap-2">
                        <label className="w-32 shrink-0 truncate pt-2 text-right text-xs font-medium text-foreground">
                          {field.label || field.name}
                          {field.isRequired && <span className="text-destructive"> *</span>}
                        </label>
                        {field.type === "Date" ? (
                          <Input
                            type="date"
                            value={displayValue}
                            disabled={isReadOnly}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="h-8 flex-1 text-xs"
                          />
                        ) : field.type === "int" ? (
                          <Input
                            type="number"
                            value={displayValue}
                            disabled={isReadOnly}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="h-8 flex-1 text-xs"
                          />
                        ) : (
                          <AutosizeTextarea
                            value={displayValue}
                            disabled={isReadOnly}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            minHeight={32}
                            size="sm"
                            className="flex-1 text-xs"
                          />
                        )}
                      </div>
                    );
                  })}
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
