/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolCallMessagePartComponent, ToolCallMessagePartStatus } from "@assistant-ui/react";
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { PencilIcon, PlayIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { JsonEditor } from "@/components/json-editor/JsonEditor";

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

  // UI state for toggling inline JsonEditor
  const [isEditing, setIsEditing] = useState(false);

  // Track the raw JSON string the user actually saved
  const [userEditedPayloadStr, setUserEditedPayloadStr] = useState<string | null>(null);

  // The payload currently active (LLM generated vs User edited)
  const displayArgsStr = useMemo(() => {
    if (userEditedPayloadStr !== null) return userEditedPayloadStr;
    return JSON.stringify(output?.payload || {}, null, 2);
  }, [userEditedPayloadStr, output?.payload]);

  // Draft state while actively typing in JsonEditor
  const [draftEditStr, setDraftEditStr] = useState<string>(displayArgsStr);

  const handleStartEdit = () => {
    setDraftEditStr(displayArgsStr);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    try {
      JSON.parse(draftEditStr); // Validate JSON format
      setUserEditedPayloadStr(draftEditStr);
      setIsEditing(false);
    } catch {
      showCustomAlertDialog({
        title: "Invalid JSON",
        description: "Please fix the JSON syntax before saving.",
        confirmBtnText: "Got it",
        confirmActionFn: () => { },
        isDestructive: false,
      });
    }
  };

  const handleExecute = () => {
    let parsedPayload: Record<string, unknown> = {};
    try {
      parsedPayload = JSON.parse(displayArgsStr);
    } catch {
      showCustomAlertDialog({
        title: "Invalid JSON",
        description: "Please ensure the arguments are valid JSON before executing.",
        confirmBtnText: "Got it",
        confirmActionFn: () => { },
        isDestructive: false,
      });
      return;
    }
    executeTool(parsedPayload);
  };

  const uiStatus: ToolCallMessagePartStatus = useMemo(() => {
    if (isStreaming || isExecuting) return { type: "running" };
    if (status === "cancelled") return { type: "incomplete", reason: "cancelled" };
    if (status === "failed")
      return {
        type: "incomplete",
        reason: "error",
        error: displayResult?.details || "Execution failed",
      };

    if (status === "pending") return { type: "requires-action", reason: "interrupt" };

    return { type: "complete" };
  }, [status, isStreaming, isExecuting, displayResult]);

  const isCancelled = status === "cancelled";
  const toolLabel = `${provider}_${props.toolName}`;

  return (
    <ToolFallbackRoot
      defaultOpen={status === "pending" || isStreaming || isExecuting}
      className="mb-2"
    >
      <ToolFallbackTrigger toolName={toolLabel} status={uiStatus} className={cn("rounded-lg")} />

      <ToolFallbackContent>
        <ToolFallbackError status={uiStatus} />

        {isEditing ? (
          /* EDITED MODE: Show the interactive JsonEditor */
          <div className="px-4 pb-2">
            <div className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
              Editing Arguments:
            </div>
            <JsonEditor
              value={draftEditStr}
              onChange={(value) => setDraftEditStr(value as string)}
              disabled={false}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button variant="outline" size="xs" onClick={handleCancelEdit}>
                Cancel edit
              </Button>
              <Button variant="default" size="xs" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          /* VIEW MODE: Standard assistant-ui ToolFallbackArgs */
          <>
            <div className="relative">
              <ToolFallbackArgs
                argsText={displayArgsStr}
                className={cn(isCancelled && "opacity-60")}
              />
            </div>

            {/* Render action buttons if waiting for user confirmation */}
            {isAwaitingUser && (
              <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-2">
                <Button variant="outline" size="xs" onClick={cancelTool}>
                  <XIcon className="mr-1.5 size-3.5" />
                  Cancel
                </Button>
                <Button variant="outline" size="xs" onClick={handleStartEdit}>
                  <PencilIcon className="mr-1.5 size-3" />
                  Edit
                </Button>
                <Button variant="default" size="xs" onClick={handleExecute}>
                  <PlayIcon className="mr-1.5 size-3 fill-current" />
                  Execute
                </Button>
              </div>
            )}
          </>
        )}

        {status === "success" && displayResult && (
          <ToolFallbackResult result={displayResult?.details || displayResult} />
        )}
      </ToolFallbackContent>
    </ToolFallbackRoot>
  );
};

export default ToolsCall;
