/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ToolCallMessagePartComponent,
  ToolCallMessagePartStatus,
} from "@assistant-ui/react";
import { Button } from "@aventisia/ui/buttons";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { cn } from "@aventisia/ui/lib";
import { PlayIcon } from "lucide-react";
import { useMemo, useState } from "react";

import {
  ToolFallbackArgs,
  ToolFallbackContent,
  ToolFallbackError,
  ToolFallbackResult,
  ToolFallbackRoot,
  ToolFallbackTrigger,
} from "../components/tools-fallback";
import { useToolCallManager } from "../hooks/useToolCallManager";

export const ToolsCall: ToolCallMessagePartComponent = (props) => {
  const { showCustomAlertDialog } = useShowAlertHandler();

  const {
    status,
    provider,
    isStreaming,
    isExecuting,
    isAwaitingUser,
    output,
    displayResult,
    executeTool,
    cancelTool,
  } = useToolCallManager({
    toolCallId: props.toolCallId, // pass through so coordinator uses the runtime's stable ID
    toolName: props.toolName,
    argsText: props.argsText,
    args: props.args as any,
    result: props.result,
    addResult: props.addResult,
    partStatus: props.status,
  });

  // Track raw user edits as a string from the JsonEditor inside ToolFallbackArgs
  const [userEditedPayloadStr, setUserEditedPayloadStr] = useState<
    string | null
  >(null);

  // The payload string to display in the editor.
  // Actively syncs with the LLM stream until the user types something.
  const displayArgsStr = useMemo(() => {
    if (userEditedPayloadStr !== null) return userEditedPayloadStr;
    return JSON.stringify(output?.payload || {}, null, 2);
  }, [userEditedPayloadStr, output?.payload]);

  const handleExecute = () => {
    let parsedPayload: Record<string, unknown> = {};
    try {
      parsedPayload = JSON.parse(displayArgsStr);
    } catch {
      showCustomAlertDialog({
        title: "Invalid JSON",
        description:
          "Please fix the JSON syntax in the arguments editor before executing.",
        confirmBtnText: "Got it",
        confirmActionFn: () => {},
        isDestructive: false,
      });
      return;
    }
    executeTool(parsedPayload);
  };

  const uiStatus: ToolCallMessagePartStatus = useMemo(() => {
    if (isStreaming || isExecuting) return { type: "running" };
    if (status === "cancelled")
      return { type: "incomplete", reason: "cancelled" };
    if (status === "failed")
      return {
        type: "incomplete",
        reason: "error",
        error: displayResult?.details || "Execution failed",
      };

    if (status === "pending")
      return { type: "requires-action", reason: "interrupt" };

    return { type: "complete" };
  }, [status, isStreaming, isExecuting, displayResult]);

  const isCancelled = status === "cancelled";
  const toolLabel = `${provider}_${props.toolName}`;

  return (
    <ToolFallbackRoot
      defaultOpen={status === "pending" || isStreaming || isExecuting}
      className="shadow-sm"
    >
      <ToolFallbackTrigger
        toolName={toolLabel}
        status={uiStatus}
        className={cn("rounded-lg")}
      />

      <ToolFallbackContent>
        <ToolFallbackError status={uiStatus} />

        <ToolFallbackArgs
          argsText={displayArgsStr}
          onArgsChange={setUserEditedPayloadStr}
          disabled={!isAwaitingUser}
          isEdited={userEditedPayloadStr !== null && !isCancelled}
          className={cn(isCancelled && "opacity-60")}
        />

        {isAwaitingUser && (
          <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-2">
            <Button variant="outline" size="xs" onClick={cancelTool}>
              Cancel
            </Button>
            <Button variant="default" size="xs" onClick={handleExecute}>
              <PlayIcon className="mr-1.5 size-3 fill-current" />
              Execute
            </Button>
          </div>
        )}

        {status === "success" && displayResult && (
          <ToolFallbackResult
            result={displayResult?.details || displayResult}
          />
        )}
      </ToolFallbackContent>
    </ToolFallbackRoot>
  );
};

export default ToolsCall;
