import { isBodyCapableMethod } from "@avplatform/ui/utils";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

import { JsonEditor } from "@/components/json-editor/JsonEditor";

import {
  ManualToolOperation,
  ManualToolOperationHeader,
  ManualToolOperationParameter,
} from "../../../dtos";
import { FieldLabel } from "../FieldLabel";

const METHOD_OPTIONS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const createEmptyOperation = (): ManualToolOperation => ({
  name: "",
  method: "GET",
  endpoint: "/",
});

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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

  return (
    <div className="rounded-lg border bg-surface p-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <FieldLabel label="Name" isRequired />
          <input
            value={operation.name}
            onChange={(event) => updateOperation({ name: event.target.value })}
            placeholder="e.g. get_current_weather"
            disabled={initialOperation !== undefined}
            autoFocus
            className={inputClass}
          />
          {showValidation && !operation.name.trim() && (
            <p className="text-xs text-destructive">Method name is required.</p>
          )}
          {isDuplicateName && operation.name.trim() && (
            <p className="text-xs text-destructive">This method name is already in use.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <FieldLabel label="Description" />
          <input
            value={operation.description ?? ""}
            onChange={(event) => updateOperation({ description: event.target.value })}
            placeholder="What this method does"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-[7rem_1fr] gap-2">
          <div className="space-y-1.5">
            <FieldLabel label="Method" />
            <select
              value={operation.method}
              onChange={(event) =>
                updateOperation({ method: event.target.value as ManualToolOperation["method"] })
              }
              className={inputClass}
            >
              {METHOD_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <FieldLabel label="Endpoint" isRequired />
            <input
              value={operation.endpoint}
              onChange={(event) => updateOperation({ endpoint: event.target.value })}
              placeholder="/forecast"
              className={`${inputClass} font-mono`}
            />
            {showValidation && !operation.endpoint.trim() && (
              <p className="text-xs text-destructive">Endpoint is required.</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel label="Headers" />
            <span className="text-xs text-muted-foreground">optional</span>
          </div>
          {(operation.headers ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No headers added yet.</p>
          ) : (
            (operation.headers ?? []).map((header, headerIndex) => (
              <div key={headerIndex} className="flex items-center gap-2">
                <input
                  value={header.key}
                  onChange={(event) => updateHeader(headerIndex, { key: event.target.value })}
                  placeholder="Header name"
                  className={inputClass}
                />
                <input
                  value={header.description ?? ""}
                  onChange={(event) =>
                    updateHeader(headerIndex, { description: event.target.value })
                  }
                  placeholder="Description"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    updateOperation({
                      headers: (operation.headers ?? []).filter(
                        (_, index) => index !== headerIndex,
                      ),
                    })
                  }
                  aria-label="Remove header"
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() =>
              updateOperation({
                headers: [...(operation.headers ?? []), { key: "", description: "" }],
              })
            }
            className="rounded-md border border-dashed border-input px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            + Add header
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel label="Parameters" />
            <span className="text-xs text-muted-foreground">optional</span>
          </div>
          {(operation.parameters ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No parameters added yet.</p>
          ) : (
            (operation.parameters ?? []).map((parameter, parameterIndex) => (
              <div key={parameterIndex} className="flex items-center gap-2">
                <input
                  value={parameter.name}
                  onChange={(event) =>
                    updateParameter(parameterIndex, { name: event.target.value })
                  }
                  placeholder="Parameter name"
                  className={inputClass}
                />
                <input
                  value={parameter.description ?? ""}
                  onChange={(event) =>
                    updateParameter(parameterIndex, { description: event.target.value })
                  }
                  placeholder="Description"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    updateOperation({
                      parameters: (operation.parameters ?? []).filter(
                        (_, index) => index !== parameterIndex,
                      ),
                    })
                  }
                  aria-label="Remove parameter"
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() =>
              updateOperation({
                parameters: [
                  ...(operation.parameters ?? []),
                  { name: "", in: "query", description: "" },
                ],
              })
            }
            className="rounded-md border border-dashed border-input px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            + Add parameter
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel label="JSON payload" />
            <span className="text-xs text-muted-foreground">optional</span>
          </div>
          {isBodyCapableMethod(operation.method) ? (
            <JsonEditor
              value={operation.jsonPayload ?? ""}
              onChange={(value) => updateOperation({ jsonPayload: value })}
              placeholder={'{\n  "key": "value"\n}'}
              className="min-h-[7rem]"
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              JSON payload applies to POST, PUT, PATCH and DELETE methods.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-input px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-muted/50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};
