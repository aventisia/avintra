import { crudDialogFieldClasses } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { isBodyCapableMethod } from "@avplatform/ui/utils";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";
import { JsonEditor } from "@/components/json-editor/JsonEditor";

import {
  ManualToolOperation,
  ManualToolOperationHeader,
  ManualToolOperationParameter,
} from "../../../dtos";

const METHOD_OPTIONS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const createEmptyOperation = (): ManualToolOperation => ({
  name: "",
  method: "GET",
  endpoint: "/",
});

type MethodFormProps = {
  initialOperation?: ManualToolOperation;
  /** Names already used by other methods; names are unique case-insensitively. */
  existingNames?: string[];
  onSubmit: (operation: ManualToolOperation) => void;
  onCancel: () => void;
  submitLabel: string;
};

/**
 * Inline form panel for authoring a single tool method: name, description, method
 * and endpoint, static headers, parameters and an optional JSON payload sample.
 */
export const MethodForm = ({
  initialOperation,
  existingNames,
  onSubmit,
  onCancel,
  submitLabel,
}: MethodFormProps) => {
  const [operation, setOperation] = useState<ManualToolOperation>(
    initialOperation ?? createEmptyOperation(),
  );
  const [showValidation, setShowValidation] = useState(false);
  const fieldId = useId();
  const nameId = `${fieldId}-name`;
  const descriptionId = `${fieldId}-description`;
  const methodId = `${fieldId}-method`;
  const endpointId = `${fieldId}-endpoint`;

  const updateOperation = (patch: Partial<ManualToolOperation>) =>
    setOperation((previous) => ({ ...previous, ...patch }));

  const updateHeader = (headerIndex: number, patch: Partial<ManualToolOperationHeader>) => {
    updateOperation({
      headers: (operation.headers ?? []).map((header, index) =>
        index === headerIndex ? { ...header, ...patch } : header,
      ),
    });
  };

  const updateParameter = (
    parameterIndex: number,
    patch: Partial<ManualToolOperationParameter>,
  ) => {
    updateOperation({
      parameters: (operation.parameters ?? []).map((parameter, index) =>
        index === parameterIndex ? { ...parameter, ...patch } : parameter,
      ),
    });
  };

  const isDuplicateName = (existingNames ?? []).some(
    (name) => name.trim().toLowerCase() === operation.name.trim().toLowerCase(),
  );
  const isValid = Boolean(operation.name.trim() && operation.endpoint.trim()) && !isDuplicateName;

  const handleSubmit = () => {
    if (!isValid) {
      setShowValidation(true);
      return;
    }
    onSubmit({
      ...operation,
      endpoint: operation.endpoint.trim().startsWith("/")
        ? operation.endpoint.trim()
        : `/${operation.endpoint.trim()}`,
    });
  };

  const nameError =
    isDuplicateName && operation.name.trim()
      ? "This method name is already in use."
      : showValidation && !operation.name.trim()
        ? "Method name is required."
        : null;
  const endpointError =
    showValidation && !operation.endpoint.trim() ? "Endpoint is required." : null;

  return (
    <div className="overflow-hidden rounded-md bg-popover p-4 ring-1 ring-border">
      <div className="space-y-3.5">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField htmlFor={nameId} label="Name" error={nameError}>
            <input
              id={nameId}
              value={operation.name}
              onChange={(event) => updateOperation({ name: event.target.value })}
              placeholder="e.g. get_current_weather"
              disabled={initialOperation !== undefined}
              autoFocus
              aria-invalid={Boolean(nameError)}
              className={cn(getFieldInputClassName(Boolean(nameError)), "h-9 disabled:bg-sunken")}
            />
          </FormField>

          <FormField htmlFor={descriptionId} label="Description" isOptional>
            <input
              id={descriptionId}
              value={operation.description ?? ""}
              onChange={(event) => updateOperation({ description: event.target.value })}
              placeholder="What this method does"
              className={cn(getFieldInputClassName(false), "h-9")}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <FormField htmlFor={methodId} label="Method">
            <Select
              value={operation.method}
              onValueChange={(value) =>
                updateOperation({ method: value as ManualToolOperation["method"] })
              }
            >
              <SelectTrigger
                id={methodId}
                className={cn(crudDialogFieldClasses.selectTrigger, "h-9")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHOD_OPTIONS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField htmlFor={endpointId} label="Endpoint" error={endpointError}>
            <input
              id={endpointId}
              value={operation.endpoint}
              onChange={(event) => updateOperation({ endpoint: event.target.value })}
              placeholder="/forecast"
              aria-invalid={Boolean(endpointError)}
              className={cn(getFieldInputClassName(Boolean(endpointError)), "h-9 font-mono")}
            />
          </FormField>
        </div>

        <KeyValueList
          title="Headers"
          emptyText="No headers yet."
          addLabel="Add header"
          rows={(operation.headers ?? []).map((header) => ({
            key: header.key,
            description: header.description ?? "",
          }))}
          keyPlaceholder="Header name"
          onAdd={() =>
            updateOperation({
              headers: [...(operation.headers ?? []), { key: "", description: "" }],
            })
          }
          onChangeKey={(index, key) => updateHeader(index, { key })}
          onChangeDescription={(index, description) => updateHeader(index, { description })}
          onRemove={(headerIndex) =>
            updateOperation({
              headers: (operation.headers ?? []).filter((_, index) => index !== headerIndex),
            })
          }
        />

        <KeyValueList
          title="Parameters"
          emptyText="No parameters yet."
          addLabel="Add parameter"
          rows={(operation.parameters ?? []).map((parameter) => ({
            key: parameter.name,
            description: parameter.description ?? "",
          }))}
          keyPlaceholder="Parameter name"
          onAdd={() =>
            updateOperation({
              parameters: [
                ...(operation.parameters ?? []),
                { name: "", in: "query", description: "" },
              ],
            })
          }
          onChangeKey={(index, name) => updateParameter(index, { name })}
          onChangeDescription={(index, description) => updateParameter(index, { description })}
          onRemove={(parameterIndex) =>
            updateOperation({
              parameters: (operation.parameters ?? []).filter(
                (_, index) => index !== parameterIndex,
              ),
            })
          }
        />

        <div>
          <p className="mb-1.5 text-[12.5px] font-semibold text-ink-2">
            JSON payload
            <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>
          </p>
          {isBodyCapableMethod(operation.method) ? (
            <JsonEditor
              value={operation.jsonPayload ?? ""}
              onChange={(value) => updateOperation({ jsonPayload: value })}
              placeholder={'{\n  "key": "value"\n}'}
              className={cn(crudDialogFieldClasses.jsonEditor, "min-h-[7rem]")}
            />
          ) : (
            <p className="text-[12px] text-muted-foreground">
              A JSON payload applies to POST, PUT, PATCH and DELETE methods.
            </p>
          )}
        </div>
      </div>

      <div className="-mx-4 -mb-4 mt-4 flex justify-end gap-2 border-t border-line bg-sunken/70 px-4 py-2.5">
        <CardDialogButton onClick={onCancel} className="h-8">
          Cancel
        </CardDialogButton>
        <CardDialogButton
          variant="primary"
          onClick={handleSubmit}
          disabled={!isValid}
          className="h-8"
        >
          {submitLabel}
        </CardDialogButton>
      </div>
    </div>
  );
};

type KeyValueListProps = {
  title: string;
  emptyText: string;
  addLabel: string;
  rows: { key: string; description: string }[];
  keyPlaceholder: string;
  onAdd: () => void;
  onChangeKey: (index: number, value: string) => void;
  onChangeDescription: (index: number, value: string) => void;
  onRemove: (index: number) => void;
};

const KeyValueList = ({
  title,
  emptyText,
  addLabel,
  rows,
  keyPlaceholder,
  onAdd,
  onChangeKey,
  onChangeDescription,
  onRemove,
}: KeyValueListProps) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <p className="text-[12.5px] font-semibold text-ink-2">
        {title}
        <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1 text-[12px] font-medium text-primary-text outline-none hover:underline focus-visible:underline"
      >
        <PlusIcon className="size-3.5" />
        {addLabel}
      </button>
    </div>
    {rows.length === 0 ? (
      <p className="text-[12px] text-muted-foreground">{emptyText}</p>
    ) : (
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={row.key}
              onChange={(event) => onChangeKey(index, event.target.value)}
              placeholder={keyPlaceholder}
              aria-label={keyPlaceholder}
              className={cn(getFieldInputClassName(false), "h-9")}
            />
            <input
              value={row.description}
              onChange={(event) => onChangeDescription(index, event.target.value)}
              placeholder="Description"
              aria-label="Description"
              className={cn(getFieldInputClassName(false), "h-9")}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${title.toLowerCase().replace(/s$/, "")}`}
              className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-focus"
            >
              <TrashIcon className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);
