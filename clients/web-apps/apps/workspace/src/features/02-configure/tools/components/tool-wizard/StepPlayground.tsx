import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { JsonViewer } from "@avplatform/ui/json-viewer";
import { toast } from "@avplatform/ui/sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { JsonEditor } from "@/components/json-editor/JsonEditor";

import { testTool, testToolDirectly } from "../../apis/tools.apis";
import { TestToolResponseDto } from "../../dtos/index";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import {
  normalizeParsedSchemaOperations,
  setParsedSchemaOperationVerification,
} from "../../utils/tool-operations.util";
import { FieldLabel } from "./FieldLabel";

type OperationTestResult =
  { status: "tested"; response: TestToolResponseDto } | { status: "failed"; message: string };

const serializeResponseBody = (body: unknown): string => {
  if (body === undefined || body === null) return "{}";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
};

const toErrorMessage = (error: unknown): string =>
  typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : "The test call failed.";

const isVerifiedResult = (result?: OperationTestResult): boolean => {
  if (result?.status !== "tested") return false;
  const statusCode = result.response.status_code ?? 0;
  return statusCode >= 200 && statusCode < 300;
};

type StepPlaygroundProps = {
  crudAction: "create" | "read" | "update";
};

/**
 * Playground step. Only a server-recorded HTTP 2xx test marks an operation
 * verified; the wizard never trusts a client-side flag when saving.
 */
export const StepPlayground = ({ crudAction }: StepPlaygroundProps) => {
  const { draftTool, setDraftTool, resetVersion } = useToolWizardStore();
  const [results, setResults] = useState<Record<string, OperationTestResult>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [parametersByOperation, setParametersByOperation] = useState<Record<string, string>>({});
  const [lastTestedId, setLastTestedId] = useState("");

  const isCreate = crudAction === "create";
  const isTestingRef = useRef(false);
  const batchTokenRef = useRef(0);

  useEffect(
    () => () => {
      batchTokenRef.current += 1;
    },
    [resetVersion],
  );

  const operations = useMemo(
    () => normalizeParsedSchemaOperations(draftTool?.parsedSchema),
    [draftTool?.parsedSchema],
  );

  const applyVerifications = useCallback(
    (token: number, entries: Array<{ operationId: string; result: OperationTestResult }>) => {
      if (batchTokenRef.current !== token) return;

      const currentDraft = useToolWizardStore.getState().draftTool;
      if (!currentDraft || entries.length === 0) return;

      let nextSchema = currentDraft.parsedSchema;
      const resultPatch: Record<string, OperationTestResult> = {};
      for (const { operationId, result } of entries) {
        resultPatch[operationId] = result;
        nextSchema = setParsedSchemaOperationVerification(
          nextSchema,
          operationId,
          isVerifiedResult(result),
        );
      }

      const nextOperations = normalizeParsedSchemaOperations(nextSchema);
      const allVerified =
        nextOperations.length > 0 && nextOperations.every((operation) => operation.isVerified);

      setResults((previous) => ({ ...previous, ...resultPatch }));
      setDraftTool({ ...currentDraft, parsedSchema: nextSchema, isVerified: allVerified });
    },
    [setDraftTool],
  );

  const testOperation = useCallback(
    async (
      operationId: string,
      parameters: Record<string, unknown>,
    ): Promise<OperationTestResult> => {
      if (isCreate || !draftTool?.id) {
        try {
          const response = await testToolDirectly({
            operationId,
            parameters,
            baseUrl: draftTool?.baseUrl ?? "",
            openApiSpec: draftTool?.openApiSpec,
            credentialName: draftTool?.credentialName,
          });
          const result: OperationTestResult = { status: "tested", response };
          const wizardStore = useToolWizardStore.getState();
          if (isVerifiedResult(result)) {
            wizardStore.setPendingVerification(operationId, parameters);
          } else {
            wizardStore.removePendingVerification(operationId);
          }
          return result;
        } catch (error) {
          return { status: "failed", message: toErrorMessage(error) };
        }
      }

      try {
        const response = await testTool(draftTool.id, {
          operationId,
          parameters,
          credentialName: draftTool.credentialName,
        });
        if (!response.data) {
          return { status: "failed", message: response.message };
        }
        return { status: "tested", response: response.data };
      } catch (error) {
        return { status: "failed", message: toErrorMessage(error) };
      }
    },
    [draftTool, isCreate],
  );

  const testOperations = useCallback(
    async (operationIds: string[], parameters: Record<string, unknown>) => {
      if (!draftTool || operationIds.length === 0 || isTestingRef.current) return;

      isTestingRef.current = true;
      setIsTesting(true);
      const token = (batchTokenRef.current += 1);

      try {
        const entries: Array<{ operationId: string; result: OperationTestResult }> = [];
        for (const operationId of operationIds) {
          entries.push({ operationId, result: await testOperation(operationId, parameters) });
        }

        applyVerifications(token, entries);
        if (batchTokenRef.current === token) {
          setLastTestedId(operationIds[operationIds.length - 1]);
        }
      } finally {
        isTestingRef.current = false;
        setIsTesting(false);
      }
    },
    [applyVerifications, draftTool, testOperation],
  );

  const toggleSelection = (operationId: string) => {
    setSelectedIds((previous) =>
      previous.includes(operationId)
        ? previous.filter((id) => id !== operationId)
        : [...previous, operationId],
    );
  };

  const handleTestSelected = async () => {
    const targetIds = selectedIds.filter((id) =>
      operations.some((operation) => operation.operationId === id),
    );
    if (targetIds.length === 0) return;

    let parameters: Record<string, unknown> = {};
    if (targetIds.length === 1) {
      try {
        parameters = JSON.parse(parametersByOperation[targetIds[0]] ?? "{}");
      } catch {
        toast.error("Parameters must be valid JSON");
        return;
      }
    }

    await testOperations(targetIds, parameters);
  };

  const updateParameters = (operationId: string, value: string) => {
    setParametersByOperation((previous) => ({ ...previous, [operationId]: value }));
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
          description="Select the operations to test. An operation is marked Verified only when the server records a successful HTTP 200 test."
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

      {isCreate && (
        <p className="text-xs text-orange-700">
          This tool does not exist yet: each successful test is sent to the API again when you
          create the tool, to record its verification. Avoid testing operations that create, change
          or delete data here, or test them after the tool is created.
        </p>
      )}

      {operations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No operations found. Add at least one method in Step 1.
        </p>
      ) : (
        <div className="space-y-1.5">
          {operations.map((operation) => {
            const result = results[operation.operationId];
            const verified = result ? isVerifiedResult(result) : operation.isVerified === true;
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
            value={parametersByOperation[selectedSingle.operationId] ?? "{}"}
            onChange={(value) => updateParameters(selectedSingle.operationId, value)}
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
          {lastTestedResponse.status === "tested" && lastTestedResponse.response.status_code && (
            <p className="text-sm">Status: {lastTestedResponse.response.status_code}</p>
          )}
          {lastTestedResponse.status === "tested" && lastTestedResponse.response.duration_ms && (
            <p className="text-sm">Duration: {lastTestedResponse.response.duration_ms}ms</p>
          )}
          {lastTestedResponse.status === "failed" && (
            <p className="text-sm text-destructive">{lastTestedResponse.message}</p>
          )}
          {lastTestedResponse.status === "tested" &&
            lastTestedResponse.response.body !== undefined &&
            lastTestedResponse.response.body !== null && (
              <JsonViewer
                jsonData={serializeResponseBody(lastTestedResponse.response.body)}
                enableValueClipboard
                className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs"
              />
            )}
        </div>
      )}
    </div>
  );
};
