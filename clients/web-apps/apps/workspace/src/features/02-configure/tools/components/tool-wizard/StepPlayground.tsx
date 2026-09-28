import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { JsonViewer } from "@avplatform/ui/json-viewer";
import { toast } from "@avplatform/ui/sonner";
import { useCallback, useMemo, useState } from "react";

import { JsonEditor } from "@/components/json-editor/JsonEditor";

import { testToolDirectly } from "../../apis/tools.apis";
import { TestToolResponseDto } from "../../dtos/index";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import {
  normalizeParsedSchemaOperations,
  setParsedSchemaOperationVerification,
} from "../../utils/tool-operations.util";
import { FieldLabel } from "./FieldLabel";

const serializeResponseBody = (body: unknown): string => {
  if (body === undefined || body === null) return "{}";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
};

// An operation is verified only when its test call returns HTTP 200 exactly,
// regardless of the response body contents.
const isVerifiedResult = (result: TestToolResponseDto | "error" | undefined): boolean =>
  result !== undefined && result !== "error" && result.status_code === 200;

/**
 * Playground step. The user selects the operations to test; only the selected
 * operations are called against the live API (a test is verified only when it
 * returns HTTP 200). Results are recorded per operation in the parsed schema so
 * the persisted tool and the L3 selector can reflect them.
 */
export const StepPlayground = () => {
  const { draftTool, setDraftTool } = useToolWizardStore();
  const [results, setResults] = useState<Record<string, TestToolResponseDto | "error">>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [parametersText, setParametersText] = useState("{}");
  const [lastTestedId, setLastTestedId] = useState("");

  const operations = useMemo(
    () => normalizeParsedSchemaOperations(draftTool?.parsedSchema),
    [draftTool?.parsedSchema],
  );

  // Records each result on the draft: per-operation status plus the recomputed
  // tool-level aggregate (all operations verified).
  const applyVerifications = useCallback(
    (entries: Array<{ operationId: string; result: TestToolResponseDto | "error" }>) => {
      if (!draftTool || entries.length === 0) return;

      const nextResults = { ...results };
      let nextSchema = draftTool.parsedSchema;
      for (const { operationId, result } of entries) {
        nextResults[operationId] = result;
        nextSchema = setParsedSchemaOperationVerification(
          nextSchema,
          operationId,
          isVerifiedResult(result),
        );
      }

      const allVerified =
        operations.length > 0 &&
        normalizeParsedSchemaOperations(nextSchema).every(
          (operation) => operation.isVerified === true,
        );

      setResults(nextResults);
      setDraftTool({ ...draftTool, parsedSchema: nextSchema, isVerified: allVerified });
    },
    [draftTool, operations.length, results, setDraftTool],
  );

  // Runs a single test call and normalizes network/auth failures to "error".
  const testOperation = useCallback(
    async (
      operationId: string,
      parameters: Record<string, unknown>,
    ): Promise<TestToolResponseDto | "error"> => {
      try {
        return await testToolDirectly({
          operationId,
          parameters,
          baseUrl: draftTool?.baseUrl ?? "",
          openApiSpec: draftTool?.openApiSpec,
          credentialName: draftTool?.credentialName,
        });
      } catch {
        return "error";
      }
    },
    [draftTool?.baseUrl, draftTool?.openApiSpec, draftTool?.credentialName],
  );

  // Tests exactly the requested operations, sequentially so the upstream API is
  // not hammered, and applies all results once finished.
  const testOperations = useCallback(
    async (operationIds: string[], parameters: Record<string, unknown>) => {
      if (!draftTool || operationIds.length === 0 || isTesting) return;

      setIsTesting(true);
      const entries: Array<{ operationId: string; result: TestToolResponseDto | "error" }> = [];
      for (const operationId of operationIds) {
        entries.push({ operationId, result: await testOperation(operationId, parameters) });
      }

      applyVerifications(entries);
      setLastTestedId(operationIds[operationIds.length - 1]);
      setIsTesting(false);
    },
    [applyVerifications, draftTool, isTesting, testOperation],
  );

  const toggleSelection = (operationId: string) => {
    setSelectedIds((previous) =>
      previous.includes(operationId)
        ? previous.filter((id) => id !== operationId)
        : [...previous, operationId],
    );
    setParametersText("{}");
  };

  const handleTestSelected = async () => {
    // Ignore any selected ids that no longer exist after a method edit.
    const targetIds = selectedIds.filter((id) =>
      operations.some((operation) => operation.operationId === id),
    );
    if (targetIds.length === 0) return;

    // A single selected operation can be tested with a custom payload; multiple
    // operations share an empty payload.
    let parameters: Record<string, unknown> = {};
    if (targetIds.length === 1) {
      try {
        parameters = JSON.parse(parametersText);
      } catch {
        toast.error("Parameters must be valid JSON");
        return;
      }
    }

    await testOperations(targetIds, parameters);
  };

  const selectedSingle =
    selectedIds.length === 1
      ? operations.find((operation) => operation.operationId === selectedIds[0])
      : undefined;
  const lastTestedResponse = results[lastTestedId];
  const lastTestedLabel =
    operations.find((operation) => operation.operationId === lastTestedId)?.summary || lastTestedId;

  if (!draftTool) {
    return (
      <p className="text-sm text-muted-foreground">No tool draft loaded. Go back to Step 1.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded border p-3">
        <p className="text-sm font-medium">Tool: {draftTool.name}</p>
        <p className="text-xs text-muted-foreground">Base URL: {draftTool.baseUrl}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <FieldLabel
          label="Operation Verification"
          description="Select the operations to test. An operation is marked Verified only when its test returns HTTP 200."
        />
        {operations.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedIds(operations.map((operation) => operation.operationId))}
              className="text-muted-foreground hover:text-foreground"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              disabled={selectedIds.length === 0}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {operations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No operations found. Add at least one method in Step 1.
        </p>
      ) : (
        <div className="space-y-1.5">
          {operations.map((operation) => {
            const result = results[operation.operationId];
            const verified = isVerifiedResult(result);
            const isSelected = selectedIds.includes(operation.operationId);
            const label = operation.summary || operation.operationId;
            return (
              <label
                key={operation.operationId}
                className={`flex w-full cursor-pointer items-center gap-2 rounded border p-2 text-left text-sm transition-colors ${
                  isSelected ? "border-primary bg-accent" : "hover:bg-muted/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(operation.operationId)}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                <span className="truncate font-medium">{label}</span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {operation.method} {operation.path}
                </span>
                <span className="ml-auto">
                  {verified ? (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700"
                    >
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-orange-200 bg-orange-50 text-orange-700"
                    >
                      Unverified
                    </Badge>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {selectedSingle && (
        <div className="space-y-2 rounded border p-3">
          <p className="text-xs font-medium">
            Parameters for {selectedSingle.summary || selectedSingle.operationId}
          </p>
          <FieldLabel
            label="Parameters (JSON)"
            description="The JSON payload to send for the operation, e.g. a key/value pair object."
          />
          <JsonEditor
            value={parametersText}
            onChange={setParametersText}
            placeholder='{"key": "value"}'
            className="min-h-[6rem]"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => void handleTestSelected()}
          disabled={isTesting || selectedIds.length === 0}
          type="button"
          size="sm"
        >
          {isTesting
            ? "Testing..."
            : selectedIds.length > 1
              ? `Test selected (${selectedIds.length})`
              : "Test operation"}
        </Button>
      </div>

      {lastTestedId && lastTestedResponse && (
        <div className="rounded border p-3">
          <p className="text-sm font-medium">{lastTestedLabel}</p>
          <p className="text-sm">
            Verification: {isVerifiedResult(lastTestedResponse) ? "Verified" : "Unverified"}
          </p>
          {lastTestedResponse !== "error" && lastTestedResponse.status_code && (
            <p className="text-sm">Status: {lastTestedResponse.status_code}</p>
          )}
          {lastTestedResponse !== "error" && lastTestedResponse.duration_ms && (
            <p className="text-sm">Duration: {lastTestedResponse.duration_ms}ms</p>
          )}
          {lastTestedResponse === "error" && (
            <p className="text-sm text-destructive">The test call failed.</p>
          )}
          {lastTestedResponse !== "error" &&
            lastTestedResponse.body !== undefined &&
            lastTestedResponse.body !== null && (
              <JsonViewer
                jsonData={serializeResponseBody(lastTestedResponse.body)}
                enableValueClipboard
                className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs"
              />
            )}
        </div>
      )}
    </div>
  );
};
