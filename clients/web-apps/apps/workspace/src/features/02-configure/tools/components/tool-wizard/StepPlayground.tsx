import { useState } from "react";

import { Button } from "@avplatform/ui/buttons";
import { useMutation } from "@tanstack/react-query";

import { activateTool, testTool } from "../../apis/tools.apis";
import { TestToolDto, TestToolResponseDto } from "../../dtos/index";
import { useToolWizardStore } from "../../stores/tool-wizard.store";

/**
 * Step 3 — Playground for testing operations and activating the tool.
 */
export const StepPlayground = () => {
  const { draftTool } = useToolWizardStore();
  const [selectedOperation] = useState("");
  const [parameters] = useState<Record<string, unknown>>({});
  const [lastResponse, setLastResponse] = useState<TestToolResponseDto | null>(null);

  const testMutation = useMutation({
    mutationFn: (dto: TestToolDto) => testTool(draftTool?.id ?? "", dto),
    onSuccess: (response) => {
      setLastResponse(response.data);
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => activateTool(draftTool?.id ?? ""),
  });

  const handleTest = () => {
    testMutation.mutate({ operationId: selectedOperation, parameters });
  };

  const handleActivate = () => {
    activateMutation.mutate();
  };

  if (!draftTool) {
    return <p className="text-sm text-muted-foreground">No tool draft loaded.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded border p-3">
        <p className="text-sm font-medium">Tool: {draftTool.name}</p>
        <p className="text-xs text-muted-foreground">Operation testing will be wired once operations are parsed from the spec.</p>
      </div>

      <Button onClick={handleTest} disabled={testMutation.isPending}>
        {testMutation.isPending ? "Testing..." : "Test Call"}
      </Button>

      {lastResponse && (
        <div className="rounded border p-3">
          <p className="text-sm">Success: {lastResponse.success ? "Yes" : "No"}</p>
          {lastResponse.statusCode && <p className="text-sm">Status: {lastResponse.statusCode}</p>}
          {lastResponse.durationMs && <p className="text-sm">Duration: {lastResponse.durationMs}ms</p>}
          {lastResponse.body !== undefined && lastResponse.body !== null && (
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
              {JSON.stringify(lastResponse.body, null, 2)}
            </pre>
          )}
        </div>
      )}

      {lastResponse?.success && (
        <Button onClick={handleActivate} disabled={activateMutation.isPending}>
          {activateMutation.isPending ? "Activating..." : "Activate Tool"}
        </Button>
      )}
    </div>
  );
};
