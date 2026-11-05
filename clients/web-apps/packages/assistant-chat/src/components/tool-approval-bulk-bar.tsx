import { useAui, useAuiState } from "@assistant-ui/react";
import { Button } from "@avplatform/ui/buttons";
import { useState } from "react";

import { getPendingApprovalParts } from "../lib/approval-parts";

type ToolApprovalBulkBarProps = {
  /** Hides the bulk controls in read-only/archived threads. */
  disabled?: boolean;
};

/**
 * Approve/Deny-all bar for a paused batch with more than one undecided
 * approval. Resolving the batch in one click records every decision; the
 * runtime only starts the resumed turn once the whole batch is decided.
 *
 * Renders nothing (including for callers without an approval pause) when the
 * batch has a single pending card — the card's own buttons cover that case.
 */
export const ToolApprovalBulkBar = ({ disabled = false }: ToolApprovalBulkBarProps) => {
  const aui = useAui();
  const isRunning = useAuiState((s) => s.thread.isRunning);
  // Primitive selector so the subscription value stays referentially stable.
  const pendingApprovalCount = useAuiState(
    (s) => getPendingApprovalParts(s.message.content).length,
  );
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const handleBulkDecision = async (approved: boolean) => {
    if (bulkSubmitting || isRunning) return;
    setBulkSubmitting(true);
    try {
      const message = aui.message.getState();
      const pending = getPendingApprovalParts(message.content);
      for (const part of pending) {
        await aui.message.part({ toolCallId: part.toolCallId }).respondToToolApproval({
          approved,
          reason: approved ? undefined : "User denied this action.",
        });
      }
    } catch (error) {
      console.error("Failed to respond to tool approvals:", error);
    } finally {
      setBulkSubmitting(false);
    }
  };

  if (disabled || pendingApprovalCount <= 1) return null;

  return (
    <div className="aui-tool-approval-bulk mt-2 flex items-center justify-end gap-2 rounded-md border border-dashed border-line/70 px-3 py-2">
      <span className="mr-auto text-xs text-muted-foreground">
        {pendingApprovalCount} actions are waiting for your approval.
      </span>
      <Button
        variant="outline"
        size="xs"
        disabled={bulkSubmitting || isRunning}
        onClick={() => void handleBulkDecision(false)}
      >
        Deny all
      </Button>
      <Button
        variant="default"
        size="xs"
        disabled={bulkSubmitting || isRunning}
        onClick={() => void handleBulkDecision(true)}
      >
        Approve all
      </Button>
    </div>
  );
};
