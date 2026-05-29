/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolCallMessagePartStatus } from "@assistant-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ToolProvider } from "../constants/tools-provider-enum";
import { useToolExecutionMutation } from "./useToolsExecutionMutation";

export type ToolCallStatus = "pending" | "success" | "failed" | "cancelled";

export interface UseToolCallManagerProps {
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
  // toolName,
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
   *  1. "cancelled" — user intent always wins, regardless of any server reply.
   *  2. Server / local result status — respects actual execution outcome.
   *  3. "pending" — nothing has happened yet.
   *
   * Deliberately does NOT let an arbitrary localStatus short-circuit a
   * server-reported "failed", so real failures are never silently masked.
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
