/**
 * Shared detection of unresolved tool-approval parts on an assistant message.
 *
 * A tool-call part carries `approval` metadata when the server paused the turn
 * on a human-approval gate. The gate is pending while neither a user decision
 * (`approved`) nor an outcome (`resolution: "cancelled" | "expired"`) has been
 * recorded. Both the approval card wiring and the bulk bar count through this
 * predicate so the two never disagree.
 */

/** Approval metadata the adapter attaches to a gated tool-call part. */
export type ApprovalPartMeta = {
  approved?: boolean;
  resolution?: "cancelled" | "expired";
};

/** Minimal shape of a tool-call part the approval gate operates on. */
export type ApprovalToolCallPart = {
  type: "tool-call";
  toolCallId: string;
  approval?: ApprovalPartMeta;
};

/** True when the part is a tool-call awaiting an approval decision. */
export function isPendingApprovalPart(part: unknown): part is ApprovalToolCallPart {
  const candidate = part as ApprovalToolCallPart | undefined;
  return (
    !!candidate &&
    candidate.type === "tool-call" &&
    candidate.approval !== undefined &&
    candidate.approval.approved === undefined &&
    candidate.approval.resolution === undefined
  );
}

/** Extract the pending approval parts from a message's content parts. */
export function getPendingApprovalParts(
  parts: readonly unknown[] | undefined,
): ApprovalToolCallPart[] {
  return (parts ?? []).filter(isPendingApprovalPart);
}
