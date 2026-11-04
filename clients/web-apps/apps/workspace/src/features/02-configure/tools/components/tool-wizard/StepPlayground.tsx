import { Checkbox } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { crudDialogFieldClasses } from "@avplatform/ui/form";
import { JsonViewer } from "@avplatform/ui/json-viewer";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { GlobeIcon, PlayIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { JsonEditor } from "@/components/json-editor/JsonEditor";

import { testTool, testToolDirectly } from "../../apis/tools.apis";
import { TestToolResponseDto } from "../../dtos/index";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import {
  normalizeParsedSchemaOperations,
  setParsedSchemaOperationVerification,
} from "../../utils/tool-operations.util";
import { FieldHint } from "./FieldHint";

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
  const fieldId = useId();
  const operationsId = `${fieldId}-operations`;
  const parametersId = `${fieldId}-parameters`;
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
      <p className="text-[13px] text-muted-foreground">No tool draft loaded. Go back to step 1.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex min-w-0 items-center gap-2 rounded-md bg-sunken/80 px-3.5 py-2.5 text-[12.5px] ring-1 ring-line">
        <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="shrink-0 text-muted-foreground">Base URL</span>
        <span className="truncate font-mono text-ink-2">{draftTool.baseUrl || "-"}</span>
      </div>

      {isCreate && (
        <p className="flex gap-2 rounded-md bg-warn/10 px-3.5 py-2.5 text-[12.5px] leading-5 text-warn ring-1 ring-warn/20">
          <WarningIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            This tool doesn’t exist yet, so each successful test runs again when you create it, to
            record its verification. Avoid testing operations that create, change or delete data
            until the tool is created.
          </span>
        </p>
      )}

      <section aria-labelledby={operationsId}>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <h3 id={operationsId} className="text-[12.5px] font-semibold text-ink-2">
            Operations
          </h3>
          {operations.length > 0 && (
            <div className="flex shrink-0 items-center gap-3 text-[12px]">
              <button
                type="button"
                onClick={() => setSelectedIds(operations.map((operation) => operation.operationId))}
                className="font-medium text-primary-text outline-none hover:underline focus-visible:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                disabled={selectedIds.length === 0}
                className="text-muted-foreground outline-none hover:text-ink-2 focus-visible:underline disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {operations.length === 0 ? (
          <p className="rounded-md border border-dashed border-line px-3.5 py-6 text-center text-[13px] text-muted-foreground">
            No operations yet. Add at least one method in step 1.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {operations.map((operation) => {
              const result = results[operation.operationId];
              const verified = result ? isVerifiedResult(result) : operation.isVerified === true;
              const isSelected = selectedIds.includes(operation.operationId);
              const label = operation.summary || operation.operationId;
              return (
                <li key={operation.operationId}>
                  <label
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left ring-1 transition-colors",
                      isSelected ? "bg-selected ring-primary" : "ring-line hover:bg-muted",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(operation.operationId)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-ink">
                        {label}
                      </span>
                      <span className="block truncate font-mono text-[11.5px] text-muted-foreground">
                        {operation.method} {operation.path}
                      </span>
                    </span>
                    {verified ? (
                      <Badge variant="completed">Verified</Badge>
                    ) : (
                      <Badge variant="draft">Unverified</Badge>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <FieldHint>
          An operation is verified only when the server records a successful HTTP 2xx test.
        </FieldHint>
      </section>

      {selectedSingle && (
        <FormField
          htmlFor={parametersId}
          label={`Parameters for ${selectedSingle.summary || selectedSingle.operationId}`}
          hint={
            <FieldHint>JSON sent with the test call, for example a key/value object.</FieldHint>
          }
        >
          <div id={parametersId}>
            <JsonEditor
              value={parametersByOperation[selectedSingle.operationId] ?? "{}"}
              onChange={(value) => updateParameters(selectedSingle.operationId, value)}
              placeholder='{"key": "value"}'
              className={cn(crudDialogFieldClasses.jsonEditor, "min-h-[6rem]")}
            />
          </div>
        </FormField>
      )}

      <div className="flex justify-end">
        <CardDialogButton
          onClick={() => void handleTestSelected()}
          disabled={isTesting || selectedIds.length === 0}
          isBusy={isTesting}
          className="ring-1 ring-border"
        >
          {!isTesting && <PlayIcon className="size-4" />}
          {isTesting
            ? "Testing"
            : selectedIds.length > 1
              ? `Test selected (${selectedIds.length})`
              : "Test operation"}
        </CardDialogButton>
      </div>

      {lastTestedId && lastTestedResponse && (
        <section className="space-y-2.5 rounded-md bg-sunken/80 p-3.5 ring-1 ring-line">
          <div className="flex min-w-0 items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
              {lastTestedLabel}
            </p>
            {lastTestedResponse.status === "tested" && (
              <span className="flex shrink-0 items-center gap-3 text-[12px] tabular-nums text-muted-foreground">
                {lastTestedResponse.response.status_code && (
                  <span>HTTP {lastTestedResponse.response.status_code}</span>
                )}
                {lastTestedResponse.response.duration_ms && (
                  <span>{lastTestedResponse.response.duration_ms} ms</span>
                )}
              </span>
            )}
            {isVerifiedResult(lastTestedResponse) ? (
              <Badge variant="completed">Verified</Badge>
            ) : (
              <Badge variant="draft">Unverified</Badge>
            )}
          </div>
          {lastTestedResponse.status === "failed" && (
            <p className="flex items-start gap-1.5 text-[12.5px] text-bad">
              <WarningCircleIcon className="mt-0.5 size-3.5 shrink-0" />
              {lastTestedResponse.message}
            </p>
          )}
          {lastTestedResponse.status === "tested" &&
            lastTestedResponse.response.body !== undefined &&
            lastTestedResponse.response.body !== null && (
              <JsonViewer
                jsonData={serializeResponseBody(lastTestedResponse.response.body)}
                enableValueClipboard
                className="max-h-48 overflow-auto rounded-md bg-popover p-2.5 text-xs ring-1 ring-line"
              />
            )}
        </section>
      )}
    </div>
  );
};
