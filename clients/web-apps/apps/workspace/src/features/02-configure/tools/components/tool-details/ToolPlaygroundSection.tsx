import { Button } from "@avplatform/ui/buttons";
import { JsonViewer } from "@avplatform/ui/json-viewer";
import { JsonEditor } from "@/components/json-editor/JsonEditor";

import { TestToolResponseDto, ToolDto } from "../../dtos/index";
import { normalizeToolOperations } from "../../utils/tool-operations.util";

const serializeResponseBody = (body: unknown): string => {
  if (body === undefined || body === null) return "{}";
  if (typeof body === "string") return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
};

interface ToolPlaygroundSectionProps {
  tool: ToolDto;
  selectedOperation: string;
  setSelectedOperation: (value: string) => void;
  parameters: string;
  setParameters: (value: string) => void;
  onTest: () => void;
  isTesting: boolean;
  lastResponse?: TestToolResponseDto | null;
}

export const ToolPlaygroundSection = ({
  tool,
  selectedOperation,
  setSelectedOperation,
  parameters,
  setParameters,
  onTest,
  isTesting,
  lastResponse,
}: ToolPlaygroundSectionProps) => {
  const operations = normalizeToolOperations(tool);

  return (
    <div className="h-full flex flex-col">
      <div className="px-[1.1rem] py-3.5 pb-0">
        <p className="text-sm font-semibold">Test Tool</p>
        <p className="text-2xs mb-1 text-muted-foreground">
          Execute an operation against the live API to verify it works.
        </p>
      </div>

      <div className="space-y-3 p-4 pt-1 flex-1 flex flex-col overflow-hidden">
        {operations.length > 0 ? (
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Operation</label>
            <select
              value={selectedOperation}
              onChange={(e) => {
                setSelectedOperation(e.target.value);
                setParameters("{}");
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select operation...</option>
              {operations.map((op) => (
                <option key={op.operationId} value={op.operationId}>
                  {op.method} {op.path}
                  {op.summary ? ` — ${op.summary}` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No operations available.</p>
        )}

        {selectedOperation && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Parameters (JSON)</label>
            <JsonEditor
              value={parameters}
              onChange={setParameters}
              placeholder="Enter parameters as JSON"
              className="min-h-[6rem]"
            />
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedOperation("");
              setParameters("{}");
            }}
            type="button"
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={onTest}
            disabled={!selectedOperation || isTesting}
            type="button"
          >
            {isTesting ? "Testing..." : "Test Call"}
          </Button>
        </div>

        {lastResponse && (
          <div className="rounded border p-3 space-y-1.5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium">
                Status: {lastResponse.statusCode ?? "—"}
              </p>
              <span className={lastResponse.success ? "text-green-600" : "text-red-600"}>
                {lastResponse.success ? "Success" : "Failed"}
              </span>
            </div>
            {lastResponse.durationMs !== undefined && (
              <p className="text-xs text-muted-foreground">Duration: {lastResponse.durationMs}ms</p>
            )}
            {lastResponse.body !== undefined && lastResponse.body !== null && (
              <JsonViewer
                jsonData={serializeResponseBody(lastResponse.body)}
                enableValueClipboard
                className="flex-1 min-h-0 overflow-auto rounded bg-muted p-2 text-xs"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
