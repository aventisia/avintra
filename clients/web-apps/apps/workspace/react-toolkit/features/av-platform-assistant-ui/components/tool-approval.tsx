import { type ToolApprovalResponse, useAuiState } from "@assistant-ui/react";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import {
  AlertCircleIcon,
  BanIcon,
  CheckIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useToolCallCoordinatorStore } from "../../tool-widget/store/tool-call-store";

/** Approval metadata the adapter attaches to a gated tool-call part. */
type ToolApprovalMeta = {
  id: string;
  prompt?: string;
  approved?: boolean;
  reason?: string;
  resolution?: "cancelled" | "expired";
};

type ToolApprovalRequestProps = {
  toolCallId: string;
  toolName: string;
  argsText?: string;
  approval?: ToolApprovalMeta;
  /** Responds to the approval gate; rejects when the runtime cannot record it. */
  respondToApproval: (response: ToolApprovalResponse) => Promise<void>;
  /** Hides the decision buttons in read-only/archived threads. */
  disabled?: boolean;
};

type ApprovalState = "pending" | "approved" | "denied" | "expired";

const STATE_LABELS: Record<ApprovalState, string> = {
  pending: "Approval required",
  approved: "Approved",
  denied: "Denied",
  expired: "Approval expired",
};

const resolveApprovalState = (approval: ToolApprovalMeta | undefined): ApprovalState => {
  if (approval?.resolution) return "expired";
  if (approval?.approved === true) return "approved";
  if (approval?.approved === false) return "denied";
  return "pending";
};

/**
 * Confirmation card for a server-side tool approval gate.
 *
 * Chat agents pause before executing actions configured with human approval.
 * Approve/Deny resolves the gate in place; the adapter then resumes the paused
 * turn with the recorded decisions. While undecided, the card registers with
 * the shared tool-call coordinator so the composer is blocked (the Stop button
 * denies the action). This is intentionally separate from the flow-builder
 * ToolsCall widget, which executes connector calls client-side.
 */
export const ToolApprovalRequest = ({
  toolCallId,
  toolName,
  argsText,
  approval,
  respondToApproval,
  disabled = false,
}: ToolApprovalRequestProps) => {
  const state = resolveApprovalState(approval);
  const isPending = state === "pending" && !disabled;
  // The runtime rejects approval responses while a run is streaming, so the
  // controls stay disabled until the message reaches "requires-action".
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const canDecide = isPending && !isRunning;

  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);
  const [failed, setFailed] = useState(false);
  const [showArgs, setShowArgs] = useState(false);

  const respond = useCallback(
    async (approved: boolean) => {
      if (!canDecide || submitting) return;
      setSubmitting(approved ? "approve" : "deny");
      setFailed(false);
      try {
        await respondToApproval({
          approved,
          reason: approved ? undefined : "User denied this action.",
        });
      } catch (error) {
        console.error("Failed to respond to tool approval:", error);
        setFailed(true);
      } finally {
        setSubmitting(null);
      }
    },
    [canDecide, submitting, respondToApproval],
  );

  // Block the composer while the batch is undecided; the composer's Stop button
  // (cancelAll) delegates here and records a denial.
  const register = useToolCallCoordinatorStore(useShallow((state) => state.register));
  const unregister = useToolCallCoordinatorStore(useShallow((state) => state.unregister));
  const respondRef = useRef(respond);
  useEffect(() => {
    respondRef.current = respond;
  }, [respond]);

  useEffect(() => {
    if (!isPending) return;
    register({
      toolCallId,
      toolName,
      cancel: () => void respondRef.current(false),
    });
    return () => unregister(toolCallId);
  }, [isPending, toolCallId, toolName, register, unregister]);

  return (
    <div
      className={cn(
        "aui-tool-approval-root w-full rounded-lg border shadow-sm",
        state === "pending" ? "border-amber-500/40 bg-amber-500/5" : "border-border/60 bg-muted/20",
      )}
    >
      <div className="flex items-start gap-2 px-4 py-3">
        {state === "pending" ? (
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
        ) : state === "approved" ? (
          <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        ) : (
          <XCircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{STATE_LABELS[state]}</p>
          <p className="text-xs text-muted-foreground">
            {state === "pending" && (
              <>
                The assistant wants to run <span className="font-mono break-all">{toolName}</span>.
              </>
            )}
            {state === "approved" && (
              <>
                <span className="font-mono break-all">{toolName}</span> was approved. The assistant
                is continuing with the result.
              </>
            )}
            {state === "denied" && (
              <>
                <span className="font-mono break-all">{toolName}</span> was denied.
              </>
            )}
            {state === "expired" && <>This approval expired. Retry the original request.</>}
          </p>
        </div>
      </div>

      {argsText && argsText !== "{}" && (
        <div className="border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowArgs((value) => !value)}
            className="flex w-full items-center gap-1.5 px-4 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40"
            aria-expanded={showArgs}
          >
            <ChevronDownIcon
              className={cn("size-3.5 shrink-0 transition-transform", showArgs && "rotate-180")}
            />
            {showArgs ? "Hide arguments" : "View arguments"}
          </button>
          {showArgs && (
            <pre className="max-h-48 overflow-auto border-t border-border/60 bg-muted/30 px-4 py-2 text-xs whitespace-pre-wrap">
              {argsText}
            </pre>
          )}
        </div>
      )}

      {isPending && (
        <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-2">
          {failed && (
            <span className="mr-auto text-xs text-destructive">
              Could not record your decision. Try again.
            </span>
          )}
          <Button
            variant="outline"
            size="xs"
            onClick={() => void respond(false)}
            disabled={submitting !== null || isRunning}
          >
            {submitting === "deny" ? (
              <LoaderCircleIcon className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <BanIcon className="mr-1.5 size-3.5" />
            )}
            Deny
          </Button>
          <Button
            variant="default"
            size="xs"
            onClick={() => void respond(true)}
            disabled={submitting !== null || isRunning}
          >
            {submitting === "approve" ? (
              <LoaderCircleIcon className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <CheckIcon className="mr-1.5 size-3.5" />
            )}
            Approve
          </Button>
        </div>
      )}
    </div>
  );
};

export default ToolApprovalRequest;
