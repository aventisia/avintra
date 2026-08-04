import { Button } from "@avplatform/ui/buttons";
import { JsonViewer } from "@avplatform/ui/json-viewer";
import { toast } from "@avplatform/ui/sonner";
import { JsonEditor } from "@/components/json-editor/JsonEditor";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { testToolDirectly } from "../../apis/tools.apis";
import { TestToolDto, TestToolResponseDto } from "../../dtos/index";
import { useToolWizardStore } from "../../stores/tool-wizard.store";

const serializeResponseBody = (body: unknown): string => {
  if (body === undefined || body === null) return "{}";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
};

export const StepPlayground = () => {
  const { draftTool, setDraftTool } = useToolWizardStore();
  const [selectedOperation, setSelectedOperation] = useState("");
  const [parametersText, setParametersText] = useState("{}");
  const [lastResponse, setLastResponse] = useState<TestToolResponseDto | null>(null);

  const operations =
    draftTool?.parsedSchema &&
    typeof draftTool.parsedSchema === "object" &&
    "operations" in draftTool.parsedSchema
      ? (
          draftTool.parsedSchema as {
            operations: Array<{
              operationId: string;
              method: string;
              path: string;
              summary?: string;
            }>;
          }
        ).operations
      : [];

  const selectedOp = operations.find((op) => op.operationId === selectedOperation);

  const testMutation = useMutation({
    mutationFn: (dto: TestToolDto) => {
      return testToolDirectly(dto);
    },
    onSuccess: (response) => {
      setLastResponse(response);
      if (draftTool) {
        setDraftTool({ ...draftTool, isVerified: response.success });
      }
    },
    onError: (error) => {
      toast.error((error as Error).message || "Test call failed");
      if (draftTool) {
        setDraftTool({ ...draftTool, isVerified: false });
      }
    },
  });

  const handleTest = () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(parametersText);
    } catch {
      toast.error("Parameters must be valid JSON");
      return;
    }

    testMutation.mutate({
      operationId: selectedOperation,
      parameters: parsed,
      baseUrl: draftTool?.baseUrl ?? "",
      openApiSpec: draftTool?.openApiSpec,
      credentialId: draftTool?.credentialId,
    });
  };

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

      {operations.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Operation</label>
          <select
            value={selectedOperation}
            onChange={(e) => {
              setSelectedOperation(e.target.value);
              setParametersText("{}");
              setLastResponse(null);
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select an operation to test...</option>
            {operations.map((op) => (
              <option key={op.operationId} value={op.operationId}>
                {op.method} {op.path}
                {op.summary ? ` — ${op.summary}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedOp && (
        <div className="space-y-2 rounded border p-3">
          <p className="text-xs font-medium">Parameters for {selectedOp.operationId}</p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Parameters (JSON)</label>
            <JsonEditor
              value={parametersText}
              onChange={setParametersText}
              placeholder='{"key": "value"}'
              className="min-h-[6rem]"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleTest}
          disabled={!selectedOperation || testMutation.isPending}
          type="button"
        >
          {testMutation.isPending ? "Testing..." : "Test Call"}
        </Button>
      </div>

      {lastResponse && (
        <div className="rounded border p-3">
          <p className="text-sm">Success: {lastResponse.success ? "Yes" : "No"}</p>
          {lastResponse.statusCode && <p className="text-sm">Status: {lastResponse.statusCode}</p>}
          {lastResponse.durationMs && (
            <p className="text-sm">Duration: {lastResponse.durationMs}ms</p>
          )}
          {lastResponse.body !== undefined && lastResponse.body !== null && (
            <JsonViewer
              jsonData={serializeResponseBody(lastResponse.body)}
              enableValueClipboard
              className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs"
            />
          )}
        </div>
      )}
    </div>
  );
};
