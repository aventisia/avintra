/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolCallMessagePartStatus } from "@assistant-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ToolProvider } from "../constants/tools-provider-enum";
import { useToolCallCoordinatorStore } from "../store/tool-call-store";
import { useToolExecutionMutation } from "./useToolsExecutionMutation";

export type ToolCallStatus = "pending" | "success" | "failed" | "cancelled";

export interface UseToolCallManagerProps {
  toolCallId?: string;
  toolName: string;
  argsText?: string;
  args?: any;
  result?: any;
  addResult?: (result: any) => void;
  /** Maps to the library's `status` field on ToolCallMessagePartComponent props. */
  partStatus?: ToolCallMessagePartStatus;
}

const TOOL_CALL_RESULT_MESSAGES = {
  /**
   * Sent when the user explicitly dismisses a pending tool action.
   * Instructs the model not to retry and to ask the user how to proceed.
   */
  USER_CANCELLED:
    "User explicitly cancelled the action. DO NOT retry this tool. Acknowledge the cancellation and ask the user how they would like to proceed.",
} as const;

export function useToolCallManager({
  toolCallId,
  toolName,
  argsText,
  args,
  result,
  addResult,
  partStatus,
}: UseToolCallManagerProps) {
  const [localStatus, setLocalStatus] = useState<ToolCallStatus | null>(null);
  const [localResult, setLocalResult] = useState<any>(null);

  // Prefer populated `args` object; fall back to parsing `argsText`.
  // An empty `args` object ({}) is intentionally treated as "not provided"
  // so that a serialised argsText can still take precedence.
  const output = useMemo(() => {
    if (args && Object.keys(args).length > 0) return args;
    try {
      return argsText ? JSON.parse(argsText) : {};
    } catch {
      return {};
    }
  }, [args, argsText]);

  const provider = output?.provider?.toLowerCase() as ToolProvider;

  const { mutate: executeMutation, isPending: isExecuting } =
    useToolExecutionMutation({ provider });

  /**
   * Status resolution order:
   *  1. "cancelled" — user intent always wins.
   *  2. Server / local result status — respects actual execution outcome.
   *  3. "pending"   — nothing has happened yet.
   */
  const status: ToolCallStatus = useMemo(() => {
    if (localStatus === "cancelled") return "cancelled";

    const activeResult = localResult ?? result;
    if (activeResult) {
      if (activeResult.status === "failed") return "failed";
      if (activeResult.status === "cancelled") return "cancelled";
      // localStatus (e.g. "success") can still surface here for non-error cases.
      if (localStatus) return localStatus;
      return "success";
    }

    return "pending";
  }, [localStatus, result, localResult]);

  const isStreaming = partStatus?.type === "running";
  const isAwaitingUser = status === "pending" && !isStreaming && !isExecuting;

  // Memoised so it can be safely listed in downstream dep arrays.
  const handleExecutionOutcome = useCallback(
    (outcomeStatus: "success" | "failed" | "cancelled", data?: any) => {
      setLocalStatus(outcomeStatus);
      const payload = { status: outcomeStatus, details: data };
      setLocalResult(payload);
      // This call is the key: addResult tells assistant-ui the tool is done,
      // which triggers a new run() with the tool result baked into the messages.
      addResult?.(payload);
    },
    [addResult],
  );

  const executeTool = useCallback(
    (formData: Record<string, unknown>) => {
      executeMutation(
        {
          agentId: output?.agentId ?? "",
          agentName: output?.agentName ?? "",
          provider: output?.provider ?? "",
          action: output?.action ?? "",
          credentialId: output?.credentialId ?? "",
          payload: formData,
        },
        {
          onSuccess: (res) => {
            const nestedResponse = res?.data?.response;
            const isError =
              res?.error ||
              res?.success === false ||
              res?.statusCode >= 400 ||
              res?.status === "failed" ||
              nestedResponse?.statusCode >= 400 ||
              nestedResponse?.status === "failed" ||
              nestedResponse?.error;

            if (isError) {
              handleExecutionOutcome(
                "failed",
                nestedResponse?.error ||
                  nestedResponse?.message ||
                  res?.error ||
                  res?.message ||
                  res,
              );
            } else {
              handleExecutionOutcome(
                "success",
                nestedResponse?.data || nestedResponse || res?.data || res,
              );
            }
          },
          onError: (error) =>
            handleExecutionOutcome(
              "failed",
              error?.message || "Execution failed",
            ),
        },
      );
    },
    [executeMutation, output, handleExecutionOutcome],
  );

  // Auto-execute when the tool is configured for automatic approval.
  // Uses a stable `executeTool` reference so the dep array is honest.
  useEffect(() => {
    if (output?.approval !== "auto") return;
    if (output?.approval === "auto" && isAwaitingUser) {
      // Guard: fall back to empty object so we never pass `undefined` as a record.
      executeTool((output?.payload ?? {}) as Record<string, unknown>);
    }
  }, [output?.approval, output?.payload, isAwaitingUser, executeTool]);

  const cancelTool = useCallback(() => {
    handleExecutionOutcome(
      "cancelled",
      TOOL_CALL_RESULT_MESSAGES.USER_CANCELLED,
    );
  }, [handleExecutionOutcome]);

  // Coordinator registration
  //
  // Register with the ToolCallCoordinator while the tool is pending
  // (= delivered by LLM but not yet resolved by the user/execution).
  // This allows the Composer to block new messages until the tool resolves.
  //
  // We use a ref for cancelTool so that the registered entry always calls the
  // latest version of cancelTool without re-registering on every render.

  const registerToolCall = useToolCallCoordinatorStore(
    (state) => state.register,
  );

  const unregisterToolCall = useToolCallCoordinatorStore(
    (state) => state.unregister,
  );

  const cancelToolRef = useRef(cancelTool);

  useEffect(() => {
    cancelToolRef.current = cancelTool;
  }, [cancelTool]);

  // Stable coordinator ID — prefer runtime-assigned toolCallId
  const coordId = toolCallId ?? toolName;

  // "Active" = tool payload delivered but result not yet submitted.
  // Covers both isAwaitingUser and isExecuting sub-states.
  const isActiveInCoordinator = status === "pending" && !isStreaming;

  useEffect(() => {
    if (!isActiveInCoordinator) return;

    registerToolCall({
      toolCallId: coordId,
      toolName,

      // Always uses latest cancelTool via ref
      // prevents stale closure issues
      cancel: () => cancelToolRef.current(),
    });

    return () => {
      unregisterToolCall(coordId);
    };
  }, [
    isActiveInCoordinator,
    coordId,
    toolName,
    registerToolCall,
    unregisterToolCall,
  ]);

  return {
    status,
    isStreaming,
    isExecuting,
    isAwaitingUser,
    output,
    provider,
    displayResult: localResult ?? result,
    executeTool,
    cancelTool,
  };
}
